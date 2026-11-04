import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import tryCatch from './utils/tryCatch.js';
import { signToken } from '../utils/token.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INVALID_CREDENTIALS = 'Invalid email or password';

const fail = (res, status, message) => res.status(status).json({ success: false, message });

const validateName = (name) => {
  if (typeof name !== 'string') return 'Name is required';
  const n = name.trim();
  if (n.length < 2 || n.length > 50) return 'Name must be between 2 and 50 characters';
  return null;
};

const validateEmail = (email) => {
  if (typeof email !== 'string' || !email.trim()) return 'Email is required';
  const e = email.trim().toLowerCase();
  if (e.length > 254 || !EMAIL_RE.test(e)) return 'Please enter a valid email address';
  return null;
};

const validatePassword = (password) => {
  if (typeof password !== 'string' || !password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (password.length > 128) return 'Password must be at most 128 characters long';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return null;
};

const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  photoURL: user.photoURL,
});

export const register = tryCatch(async (req, res) => {
  const { name, email, password } = req.body || {};
  const error = validateName(name) || validateEmail(email) || validatePassword(password);
  if (error) return fail(res, 400, error);

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return fail(res, 409, 'An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
  } catch (err) {
    if (err?.code === 11000) return fail(res, 409, 'An account with this email already exists');
    throw err;
  }
  res.status(201).json({ success: true, result: { ...publicUser(user), token: signToken(user) } });
});

export const login = tryCatch(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return fail(res, 400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  const ok = user ? await bcrypt.compare(password, user.password) : false;
  if (!ok) return fail(res, 401, INVALID_CREDENTIALS);

  res.status(200).json({ success: true, result: { ...publicUser(user), token: signToken(user) } });
});

export const me = tryCatch(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return fail(res, 404, 'User not found');
  res.status(200).json({ success: true, result: publicUser(user) });
});

export const updateProfile = tryCatch(async (req, res) => {
  const { name, photoURL } = req.body || {};
  const updates = {};

  if (name !== undefined) {
    const error = validateName(name);
    if (error) return fail(res, 400, error);
    updates.name = name.trim();
  }
  if (photoURL !== undefined) {
    if (typeof photoURL !== 'string' || photoURL.length > 2048) {
      return fail(res, 400, 'Invalid photo URL');
    }
    updates.photoURL = photoURL.trim();
  }
  if (Object.keys(updates).length === 0) {
    return fail(res, 400, 'Nothing to update');
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  if (!user) return fail(res, 404, 'User not found');

  res.status(200).json({ success: true, result: { ...publicUser(user), token: signToken(user) } });
});
