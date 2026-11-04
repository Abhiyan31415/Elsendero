import { doublePrecision, index, jsonb, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { timestamps } from '../../db/columns.js';

export type LngLat = [number, number];
/** Checkpoint: [lng, lat, description] (legacy rows may store numbers as strings). */
export type Checkpoint = (string | number)[];

export const trails = pgTable(
  'trails',
  {
    id: serial('id').primaryKey(),
    sloc: jsonb('sloc').$type<LngLat>().notNull(),
    floc: jsonb('floc').$type<LngLat>().notNull(),
    checkp: jsonb('checkp').$type<Checkpoint[]>().notNull().default([]),
    price: numeric('price', { mode: 'number' }).notNull().default(0),
    title: text('title').notNull(),
    description: text('description').notNull(),
    images: jsonb('images').$type<string[][]>().notNull().default([]),
    difficulty: doublePrecision('difficulty'),
    /** Creator user id (text for compatibility with pre-v1 rows). */
    uid: text('uid').notNull(),
    uName: text('u_name').notNull(),
    uPhoto: text('u_photo').notNull().default(''),
    ...timestamps,
  },
  (t) => [index('trails_uid_idx').on(t.uid), index('trails_created_at_idx').on(t.createdAt)],
);

export type TrailRow = typeof trails.$inferSelect;
export type NewTrailRow = typeof trails.$inferInsert;
