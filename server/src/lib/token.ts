import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

/** The identity carried in every JWT (and in req.user / socket.data.user). */
export interface AuthUser {
  id: string;
  name: string;
  photoURL: string;
}

export function signToken(user: { id: string | number; name: string; photoURL: string }): string {
  const payload: AuthUser = { id: String(user.id), name: user.name, photoURL: user.photoURL };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

/** Returns the token's user or throws if the token is invalid/expired. */
export function verifyToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded !== 'object' || decoded === null) throw new Error('Invalid token payload');
  const { id, name, photoURL } = decoded as Partial<AuthUser>;
  if (id === undefined || id === null || typeof name !== 'string') throw new Error('Invalid token payload');
  return { id: String(id), name, photoURL: typeof photoURL === 'string' ? photoURL : '' };
}

/** Accepts "Bearer <token>" or a bare token; returns null when absent. */
export function extractBearer(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  const m = /^Bearer\s+(.+)$/i.exec(v);
  return m?.[1] ? m[1].trim() : v.includes(' ') ? null : v;
}
