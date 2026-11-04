import { index, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { timestamps } from '../../db/columns.js';

export const messages = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    eventId: text('event_id').notNull(),
    userId: text('user_id').notNull(),
    username: text('username').notNull(),
    content: text('content').notNull(),
    ...timestamps,
  },
  (t) => [index('messages_event_created_idx').on(t.eventId, t.createdAt)],
);

export type MessageRow = typeof messages.$inferSelect;
export type NewMessageRow = typeof messages.$inferInsert;
