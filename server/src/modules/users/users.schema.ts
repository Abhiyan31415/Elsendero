import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { timestamps } from '../../db/columns.js';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    photoUrl: text('photo_url').notNull().default(''),
    /** Null until the user clicks the link in their verification email. */
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    /** Google account id (`sub`) once the user has signed in with Google. */
    googleId: text('google_id'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('users_email_lower_idx').on(sql`lower(${t.email})`),
    uniqueIndex('users_google_id_idx').on(t.googleId),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
