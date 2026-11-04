import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { pgErrorCode } from '../../lib/errors.js';
import { AppError } from '../../lib/http.js';
import { signToken } from '../../lib/token.js';
import { users } from '../users/users.schema.js';
import { findUserByEmail, toSelfUser, type SelfUser } from '../users/users.service.js';

const BCRYPT_ROUNDS = env.NODE_ENV === 'test' ? 4 : 12;
const INVALID_CREDENTIALS = 'Invalid email or password';
const DUPLICATE_EMAIL = 'An account with this email already exists';
// Compared against when the email is unknown, so timing doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_ROUNDS);

const DEFAULT_PHOTOS = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
];

export interface AuthResult {
  user: SelfUser;
  token: string;
}

const withToken = (user: SelfUser): AuthResult => ({ user, token: signToken(user) });

export async function registerUser(
  db: Db,
  input: { name: string; email: string; password: string },
): Promise<AuthResult> {
  if (await findUserByEmail(db, input.email)) throw AppError.conflict(DUPLICATE_EMAIL);
  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const photoUrl = DEFAULT_PHOTOS[Math.floor(Math.random() * DEFAULT_PHOTOS.length)] ?? '';
  try {
    const [row] = await db
      .insert(users)
      .values({ name: input.name, email: input.email, password, photoUrl })
      .returning();
    if (!row) throw new Error('Insert returned no row');
    return withToken(toSelfUser(row));
  } catch (err) {
    if (pgErrorCode(err) === '23505') throw AppError.conflict(DUPLICATE_EMAIL);
    throw err;
  }
}

export async function loginUser(db: Db, input: { email: string; password: string }): Promise<AuthResult> {
  const row = await findUserByEmail(db, input.email);
  const valid = await bcrypt.compare(input.password, row?.password ?? DUMMY_HASH);
  if (!row || !valid) throw AppError.unauthorized(INVALID_CREDENTIALS);
  return withToken(toSelfUser(row));
}
