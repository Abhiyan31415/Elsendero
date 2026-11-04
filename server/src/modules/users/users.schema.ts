import { sql } from 'drizzle-orm';
import { pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { timestamps } from '../../db/columns.js';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    photoUrl: text('photo_url').notNull().default(''),
    ...timestamps,
  },
  (t) => [uniqueIndex('users_email_lower_idx').on(sql`lower(${t.email})`)],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
