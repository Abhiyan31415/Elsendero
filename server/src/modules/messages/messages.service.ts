import { desc, eq } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import type { AuthUser } from '../../lib/token.js';
import { messages, type MessageRow } from './messages.schema.js';
import type { CreateMessageInput } from './messages.validators.js';

export const toMessage = (m: MessageRow) => ({
  id: String(m.id),
  eventId: m.eventId,
  userId: m.userId,
  username: m.username,
  content: m.content,
  /** Kept for the pre-v1 clients; same value as createdAt. */
  timestamp: m.createdAt,
  createdAt: m.createdAt,
});

export type Message = ReturnType<typeof toMessage>;

/** Latest 50 messages for an event, oldest first. */
export async function listMessages(db: Db, eventId: string, limit = 50): Promise<Message[]> {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.eventId, eventId))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit);
  return rows.reverse().map(toMessage);
}

/** Author always comes from the verified token. */
export async function saveMessage(db: Db, input: CreateMessageInput, author: AuthUser): Promise<Message> {
  const [row] = await db
    .insert(messages)
    .values({ eventId: input.eventId, userId: author.id, username: author.name, content: input.content })
    .returning();
  if (!row) throw new Error('Insert returned no row');
  return toMessage(row);
}
