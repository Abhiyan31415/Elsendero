import type { AppDeps } from '../../deps.js';
import { currentUser } from '../../lib/auth.js';
import { asyncHandler, ok } from '../../lib/http.js';
import { createEvent, listEvents } from './events.service.js';
import { createEventSchema } from './events.validators.js';

export function eventsController({ db }: AppDeps) {
  return {
    list: asyncHandler(async (_req, res) => {
      ok(res, await listEvents(db));
    }),

    create: asyncHandler(async (req, res) => {
      const input = createEventSchema.parse(req.body ?? {});
      ok(res, await createEvent(db, input, currentUser(req).id), 201);
    }),
  };
}
