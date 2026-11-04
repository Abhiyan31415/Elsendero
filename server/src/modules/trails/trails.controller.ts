import type { AppDeps } from '../../deps.js';
import { currentUser } from '../../lib/auth.js';
import { AppError, asyncHandler, ok, parseId } from '../../lib/http.js';
import { createTrail, getTrail, listTrails } from './trails.service.js';
import { createTrailSchema, listQuerySchema } from './trails.validators.js';

export function trailsController({ db }: AppDeps) {
  return {
    list: asyncHandler(async (req, res) => {
      ok(res, await listTrails(db, listQuerySchema.parse(req.query)));
    }),

    get: asyncHandler(async (req, res) => {
      const trail = await getTrail(db, parseId(req.params.id, 'Trail'));
      if (!trail) throw AppError.notFound('Trail not found');
      ok(res, trail);
    }),

    create: asyncHandler(async (req, res) => {
      const input = createTrailSchema.parse(req.body ?? {});
      ok(res, await createTrail(db, input, currentUser(req)), 201);
    }),
  };
}
