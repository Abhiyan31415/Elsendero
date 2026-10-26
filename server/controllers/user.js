import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import tryCatch from './utils/tryCatch.js';
import { query } from '../db/index.js';
import { toUser } from '../db/mappers.js';

const defaultImages = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
];

const sign = ({ id, name, photoURL }) =>
  jwt.sign({ id, name, photoURL }, process.env.JWT_SECRET, { expiresIn: '1d' });

const findByEmail = async (email) =>
  toUser((await query('SELECT * FROM users WHERE email = $1', [email])).rows[0]);

export const register = tryCatch(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }
  const emailLowerCase = email.toLowerCase();
  if (await findByEmail(emailLowerCase)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const photo = defaultImages[Math.floor(Math.random() * defaultImages.length)];
  const { rows } = await query(
    'INSERT INTO users (name, email, password, photo_url) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, emailLowerCase, hashedPassword, photo],
  );
  const { id, photoURL } = toUser(rows[0]);
  res.status(201).json({ success: true, result: { id, name, email: emailLowerCase, photoURL, token: sign({ id, name, photoURL }) } });
});

export const login = tryCatch(async (req, res) => {
  const { email, password } = req.body;
  const emailLowerCase = (email || '').toLowerCase();
  const user = await findByEmail(emailLowerCase);
  if (!user) {
    return res.status(400).json({ success: false, message: 'User doesnt exists' });
  }
  if (!(await bcrypt.compare(password || '', user.password))) {
    return res.status(400).json({ success: false, message: 'Password is incorrect' });
  }
  const { id, name, photoURL } = user;
  res.status(201).json({ success: true, result: { id, name, email: emailLowerCase, photoURL, token: sign(user) } });
});

export const updateProfile = tryCatch(async (req, res) => {
  const { name, photoURL } = req.body;
  const { rows } = await query(
    `UPDATE users SET name = COALESCE($2, name), photo_url = COALESCE($3, photo_url)
     WHERE id = $1 RETURNING *`,
    [req.user.id, name ?? null, photoURL ?? null],
  );
  const user = toUser(rows[0]);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, result: { name: user.name, photoURL: user.photoURL, token: sign(user) } });
});
