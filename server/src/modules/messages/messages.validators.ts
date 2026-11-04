import { z } from 'zod';

export const MAX_MESSAGE_LENGTH = 2000;

export const eventIdSchema = z
  .union([z.string(), z.number()], { error: 'Event ID is required' })
  .transform((v) => String(v).trim())
  .pipe(z.string().min(1, 'Event ID is required').max(64, 'Invalid event ID'));

export const contentSchema = z
  .string({ error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters` })
  .trim()
  .min(1, `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`)
  .max(MAX_MESSAGE_LENGTH, `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`);

export const createMessageSchema = z.object({ eventId: eventIdSchema, content: contentSchema });
export const listMessagesQuerySchema = z.object({ eventId: eventIdSchema });

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
