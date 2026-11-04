import type { Request, RequestHandler } from 'express';
import { AppError } from './http.js';
import { extractBearer, verifyToken, type AuthUser } from './token.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

/** Request type for handlers behind requireAuth. */
export type AuthedRequest = Request & { user: AuthUser };

function userFromHeader(req: Request): AuthUser | null {
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !/^Bearer\s+/i.test(header)) return null;
  const token = extractBearer(header);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/** 401 unless a valid `Authorization: Bearer <jwt>` header is present. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const user = userFromHeader(req);
  if (!user) return next(AppError.unauthorized());
  req.user = user;
  next();
};

/** Sets req.user when a valid token is present; never rejects. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const user = userFromHeader(req);
  if (user) req.user = user;
  next();
};

/** Narrowing helper for handlers behind requireAuth. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}
