import type { AppDeps } from '../../deps.js';
import { currentUser } from '../../lib/auth.js';
import { asyncHandler, ok } from '../../lib/http.js';
import { listMessages, saveMessage } from './messages.service.js';
import { createMessageSchema, listMessagesQuerySchema } from './messages.validators.js';

export function messagesController({ db }: AppDeps) {
  return {
    list: asyncHandler(async (req, res) => {
      const { eventId } = listMessagesQuerySchema.parse(req.query);
      ok(res, await listMessages(db, eventId));
    }),

    create: asyncHandler(async (req, res) => {
      const input = createMessageSchema.parse(req.body ?? {});
      ok(res, await saveMessage(db, input, currentUser(req)), 201);
    }),
  };
}
