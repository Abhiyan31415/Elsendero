import crypto from 'node:crypto';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { authTokens, type AuthTokenType } from './auth.schema.js';

export const TOKEN_TTL_MS: Record<AuthTokenType, number> = {
  verify_email: 24 * 60 * 60 * 1000,
  reset_password: 60 * 60 * 1000,
};

/** Minimum gap between two emails of the same type to the same user. */
export const RESEND_COOLDOWN_MS = 60 * 1000;

const hash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

/** True when a token of this type was issued to the user within the cooldown window. */
export async function issuedRecently(db: Db, userId: number, type: AuthTokenType): Promise<boolean> {
  const since = new Date(Date.now() - RESEND_COOLDOWN_MS);
  const [row] = await db
    .select({ id: authTokens.id })
    .from(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.type, type), gt(authTokens.createdAt, since)))
    .limit(1);
  return Boolean(row);
}

/** Creates a new single-use token (revoking older unused ones of the same type) and returns it in plain text. */
export async function issueToken(db: Db, userId: number, type: AuthTokenType): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  await revokeTokens(db, userId, type);
  await db.insert(authTokens).values({
    userId,
    type,
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS[type]),
  });
  return token;
}

/** Marks a valid token as used and returns its user id; null if unknown, used or expired. */
export async function consumeToken(db: Db, token: string, type: AuthTokenType): Promise<number | null> {
  const [row] = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.tokenHash, hash(token)),
        eq(authTokens.type, type),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, sql`now()`),
      ),
    )
    .returning({ userId: authTokens.userId });
  return row?.userId ?? null;
}

export async function revokeTokens(db: Db, userId: number, type: AuthTokenType): Promise<void> {
  await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(authTokens.userId, userId), eq(authTokens.type, type), isNull(authTokens.usedAt)));
}
