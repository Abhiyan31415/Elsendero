import { desc, eq } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import type { AuthUser } from '../../lib/token.js';
import { trails, type TrailRow } from './trails.schema.js';
import type { CreateTrailInput } from './trails.validators.js';

export const toTrail = (t: TrailRow) => ({
  id: String(t.id),
  title: t.title,
  description: t.description,
  sloc: t.sloc,
  floc: t.floc,
  checkp: t.checkp,
  price: Number(t.price),
  images: t.images,
  difficulty: t.difficulty,
  uid: t.uid,
  uName: t.uName,
  uPhoto: t.uPhoto,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

export type Trail = ReturnType<typeof toTrail>;

export async function listTrails(db: Db, opts: { limit: number; offset: number }): Promise<Trail[]> {
  const rows = await db
    .select()
    .from(trails)
    .orderBy(desc(trails.createdAt), desc(trails.id))
    .limit(opts.limit)
    .offset(opts.offset);
  return rows.map(toTrail);
}

export async function getTrail(db: Db, id: number): Promise<Trail | null> {
  const [row] = await db.select().from(trails).where(eq(trails.id, id)).limit(1);
  return row ? toTrail(row) : null;
}

/** Creator fields always come from the verified token, never the body. */
export async function createTrail(db: Db, input: CreateTrailInput, creator: AuthUser): Promise<Trail> {
  const [row] = await db
    .insert(trails)
    .values({
      title: input.title,
      description: input.description,
      sloc: input.sloc,
      floc: input.floc,
      checkp: input.checkp,
      price: input.price,
      images: input.images,
      difficulty: input.difficulty ?? null,
      uid: creator.id,
      uName: creator.name,
      uPhoto: creator.photoURL ?? '',
    })
    .returning();
  if (!row) throw new Error('Insert returned no row');
  return toTrail(row);
}
