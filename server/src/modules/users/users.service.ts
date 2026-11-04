import { eq, sql } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { users, type UserRow } from './users.schema.js';

/** The signed-in user's own view (includes email). */
export interface SelfUser {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  emailVerified: boolean;
}

/** What anyone can see about a user. */
export interface PublicProfile {
  id: string;
  name: string;
  photoURL: string;
  createdAt: Date;
}

export const toSelfUser = (u: UserRow): SelfUser => ({
  id: String(u.id),
  name: u.name,
  email: u.email,
  photoURL: u.photoUrl,
  emailVerified: u.emailVerifiedAt !== null,
});

export const toPublicProfile = (u: UserRow): PublicProfile => ({
  id: String(u.id),
  name: u.name,
  photoURL: u.photoUrl,
  createdAt: u.createdAt,
});

export async function findUserById(db: Db, id: number): Promise<UserRow | undefined> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row;
}

export async function findUserByEmail(db: Db, email: string): Promise<UserRow | undefined> {
  const [row] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1);
  return row;
}

export async function updateUser(
  db: Db,
  id: number,
  patch: { name?: string; photoURL?: string },
): Promise<UserRow | undefined> {
  const [row] = await db
    .update(users)
    .set({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.photoURL !== undefined && { photoUrl: patch.photoURL }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  return row;
}

/** Token user ids are strings; returns null when not a valid numeric id. */
export function userIdFromToken(id: string): number | null {
  return /^[1-9]\d{0,9}$/.test(id) ? Number(id) : null;
}
