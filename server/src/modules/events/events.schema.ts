import { index, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { timestamps } from '../../db/columns.js';

export const events = pgTable(
  'events',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    fromDate: timestamp('from_date', { withTimezone: true }).notNull(),
    toDate: timestamp('to_date', { withTimezone: true }).notNull(),
    location: text('location').notNull(),
    participants: text('participants').array().notNull().default([]),
    /** Creator user id; null for rows created before v1. */
    createdBy: text('created_by'),
    ...timestamps,
  },
  (t) => [index('events_from_date_idx').on(t.fromDate)],
);

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
