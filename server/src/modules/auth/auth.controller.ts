import type { AppDeps } from '../../deps.js';
import { currentUser } from '../../lib/auth.js';
import { AppError, asyncHandler, ok } from '../../lib/http.js';
import { findUserById, toSelfUser, userIdFromToken } from '../users/users.service.js';
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  verifyEmail,
} from './auth.service.js';
import {
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validators.js';

// Same reply whether or not the account exists.
const SENT_MESSAGE = 'If an account exists for that email, we sent a link to it.';

export function authController({ db, mailer }: AppDeps) {
  return {
    register: asyncHandler(async (req, res) => {
      const input = registerSchema.parse(req.body ?? {});
      ok(res, await registerUser(db, mailer, input), 201);
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

    verifyEmail: asyncHandler(async (req, res) => {
      const { token } = verifyEmailSchema.parse(req.body ?? {});
      ok(res, await verifyEmail(db, token));
    }),

    resendVerification: asyncHandler(async (req, res) => {
      const { email } = emailOnlySchema.parse(req.body ?? {});
      await resendVerification(db, mailer, email);
      ok(res, { message: SENT_MESSAGE });
    }),

    forgotPassword: asyncHandler(async (req, res) => {
      const { email } = emailOnlySchema.parse(req.body ?? {});
      await requestPasswordReset(db, mailer, email);
      ok(res, { message: SENT_MESSAGE });
    }),

    resetPassword: asyncHandler(async (req, res) => {
      const { token, password } = resetPasswordSchema.parse(req.body ?? {});
      ok(res, await resetPassword(db, token, password));
    }),
  };
}
