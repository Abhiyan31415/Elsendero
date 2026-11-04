import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from '../users/users.schema.js';

export type AuthTokenType = 'verify_email' | 'reset_password';

/** Single-use tokens sent by email. Only a SHA-256 hash of the token is stored. */
export const authTokens = pgTable(
  'auth_tokens',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AuthTokenType>().notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('auth_tokens_hash_idx').on(t.tokenHash), index('auth_tokens_user_type_idx').on(t.userId, t.type)],
);

export type AuthTokenRow = typeof authTokens.$inferSelect;
