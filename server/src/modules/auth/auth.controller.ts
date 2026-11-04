import type { AppDeps } from '../../deps.js';
import { currentUser } from '../../lib/auth.js';
import { AppError, asyncHandler, ok } from '../../lib/http.js';
import { findUserById, toSelfUser, userIdFromToken } from '../users/users.service.js';
import { loginUser, registerUser } from './auth.service.js';
import { loginSchema, registerSchema } from './auth.validators.js';

export function authController({ db }: AppDeps) {
  return {
    register: asyncHandler(async (req, res) => {
      const input = registerSchema.parse(req.body ?? {});
      ok(res, await registerUser(db, input), 201);
    }),

    login: asyncHandler(async (req, res) => {
      const input = loginSchema.parse(req.body ?? {});
      ok(res, await loginUser(db, input));
    }),

    me: asyncHandler(async (req, res) => {
      const id = userIdFromToken(currentUser(req).id);
      const row = id ? await findUserById(db, id) : undefined;
      if (!row) throw AppError.unauthorized();
      ok(res, { user: toSelfUser(row) });
    }),
  };
}
