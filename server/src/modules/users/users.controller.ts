import type { AppDeps } from '../../deps.js';
import { currentUser } from '../../lib/auth.js';
import { AppError, asyncHandler, ok, parseId } from '../../lib/http.js';
import { signToken } from '../../lib/token.js';
import {
  findUserById,
  toPublicProfile,
  toSelfUser,
  updateUser,
  userIdFromToken,
} from './users.service.js';
import { updateMeSchema } from './users.validators.js';

export function usersController({ db }: AppDeps) {
  return {
    /** PATCH /users/me → { user, token } (token re-issued because it embeds name/photo). */
    updateMe: asyncHandler(async (req, res) => {
      const patch = updateMeSchema.parse(req.body ?? {});
      const id = userIdFromToken(currentUser(req).id);
      const row = id ? await updateUser(db, id, patch) : undefined;
      if (!row) throw AppError.notFound('User not found');
      const user = toSelfUser(row);
      ok(res, { user, token: signToken(user) });
    }),

    /** GET /users/:id → public profile. */
    getById: asyncHandler(async (req, res) => {
      const row = await findUserById(db, parseId(req.params.id, 'User'));
      if (!row) throw AppError.notFound('User not found');
      ok(res, toPublicProfile(row));
    }),
  };
}
