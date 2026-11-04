import { asc } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { events, type EventRow } from './events.schema.js';
import type { CreateEventInput } from './events.validators.js';

export const toEvent = (e: EventRow) => ({
  id: String(e.id),
  title: e.title,
  description: e.description,
  from: e.fromDate,
  to: e.toDate,
  location: e.location,
  participants: e.participants,
  createdBy: e.createdBy,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

export async function listEvents(db: Db) {
  const rows = await db.select().from(events).orderBy(asc(events.fromDate), asc(events.id));
  return rows.map(toEvent);
}

export async function createEvent(db: Db, input: CreateEventInput, createdBy: string) {
  const [row] = await db
    .insert(events)
    .values({
      title: input.title,
      description: input.description,
      fromDate: input.from,
      toDate: input.to,
      location: input.location,
      participants: input.participants,
      createdBy,
    })
    .returning();
  if (!row) throw new Error('Insert returned no row');
  return toEvent(row);
}
