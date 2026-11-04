import { createMessageSchema, eventIdSchema } from '../modules/messages/messages.validators.js';
import { saveMessage } from '../modules/messages/messages.service.js';
import type { SocketHandler } from './types.js';

/**
 * Event chat.
 *  client → `join room` (eventId)
 *  client → `chat message` { eventId, content }   (auth required; author from token)
 *  server → `chat message` (saved message) to everyone in the room
 *  server → `error` (string)
 */
export const registerChat: SocketHandler = (io, socket, { db }) => {
  socket.on('join room', (eventId: unknown) => {
    const parsed = eventIdSchema.safeParse(eventId);
    if (!parsed.success) {
      socket.emit('error', 'Event ID is required to join a room');
      return;
    }
    void socket.join(parsed.data);
  });

  socket.on('chat message', async (payload: unknown) => {
    const user = socket.data.user;
    if (!user) {
      socket.emit('error', 'Not authorized, please log in again');
      return;
    }
    const parsed = createMessageSchema.safeParse(payload ?? {});
    if (!parsed.success) {
      socket.emit('error', parsed.error.issues[0]?.message ?? 'Invalid message');
      return;
    }
    try {
      const message = await saveMessage(db, parsed.data, user);
      io.to(parsed.data.eventId).emit('chat message', message);
    } catch (err) {
      console.error('[chat] save failed:', err);
      socket.emit('error', 'Unable to send message');
    }
  });
};
