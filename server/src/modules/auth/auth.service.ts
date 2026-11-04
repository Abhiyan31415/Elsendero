import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { pgErrorCode } from '../../lib/errors.js';
import { AppError } from '../../lib/http.js';
import type { GoogleProfile } from '../../lib/google.js';
import type { Email, Mailer } from '../../lib/mailer.js';
import { signToken } from '../../lib/token.js';
import { users, type UserRow } from '../users/users.schema.js';
import { findUserByEmail, findUserById, syncAuthorPhoto, toSelfUser, type SelfUser } from '../users/users.service.js';
import { passwordResetEmail, verificationEmail } from './auth.emails.js';
import { consumeToken, issuedRecently, issueToken, revokeTokens } from './auth.tokens.js';

const BCRYPT_ROUNDS = env.NODE_ENV === 'test' ? 4 : 12;
const INVALID_CREDENTIALS = 'Invalid email or password';
const DUPLICATE_EMAIL = 'An account with this email already exists';
const INVALID_LINK = 'This link is invalid or has expired. Please request a new one.';
export const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED';
// Compared against when the email is unknown, so timing doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_ROUNDS);


export interface AuthResult {
  user: SelfUser;
  token: string;
}

export interface RegisterResult {
  user: SelfUser;
  /** Always true: the account can't log in until the email link is clicked. */
  verificationRequired: true;
}

const withToken = (user: SelfUser): AuthResult => ({ user, token: signToken(user) });

const appLink = (path: string, token: string) => `${env.APP_URL}${path}?token=${encodeURIComponent(token)}`;

/** Email failures are logged, not surfaced: the user can always ask for another email. */
async function sendSafely(mailer: Mailer, email: Email): Promise<void> {
  try {
    await mailer.send(email);
  } catch (err) {
    console.error(`[mail] failed to send "${email.subject}" to ${email.to}:`, err);
  }
}

async function sendVerification(db: Db, mailer: Mailer, user: UserRow): Promise<void> {
  const token = await issueToken(db, user.id, 'verify_email');
  await sendSafely(mailer, verificationEmail(user.email, user.name, appLink('/verify-email', token)));
}

export async function registerUser(
  db: Db,
  mailer: Mailer,
  input: { name: string; email: string; password: string },
): Promise<RegisterResult> {
  if (await findUserByEmail(db, input.email)) throw AppError.conflict(DUPLICATE_EMAIL);
  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  let row: UserRow | undefined;
  try {
    [row] = await db
      .insert(users)
      .values({ name: input.name, email: input.email, password })
      .returning();
  } catch (err) {
    if (pgErrorCode(err) === '23505') throw AppError.conflict(DUPLICATE_EMAIL);
    throw err;
  }
  if (!row) throw new Error('Insert returned no row');
  await sendVerification(db, mailer, row);
  return { user: toSelfUser(row), verificationRequired: true };
}

export async function loginUser(db: Db, input: { email: string; password: string }): Promise<AuthResult> {
  const row = await findUserByEmail(db, input.email);
  const valid = await bcrypt.compare(input.password, row?.password ?? DUMMY_HASH);
  if (!row || !valid) throw AppError.unauthorized(INVALID_CREDENTIALS);
  // Only revealed after a correct password, so it doesn't leak which emails exist.
  if (!row.emailVerifiedAt) {
    throw AppError.forbidden('Please verify your email first. Check your inbox for the link.', EMAIL_NOT_VERIFIED);
  }
  return withToken(toSelfUser(row));
}

/** Confirms the email and signs the user in. */
export async function verifyEmail(db: Db, token: string): Promise<AuthResult> {
  const userId = await consumeToken(db, token, 'verify_email');
  if (!userId) throw AppError.badRequest(INVALID_LINK);
  const [row] = await db
    .update(users)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  if (!row) throw AppError.badRequest(INVALID_LINK);
  return withToken(toSelfUser(row));
}

/** Sends a new verification link. Silent for unknown or already verified emails. */
export async function resendVerification(db: Db, mailer: Mailer, email: string): Promise<void> {
  const row = await findUserByEmail(db, email);
  if (!row || row.emailVerifiedAt) return;
  if (await issuedRecently(db, row.id, 'verify_email')) return;
  await sendVerification(db, mailer, row);
}

/** Sends a reset link. Silent for unknown emails so this can't be used to find accounts. */
export async function requestPasswordReset(db: Db, mailer: Mailer, email: string): Promise<void> {
  const row = await findUserByEmail(db, email);
  if (!row) return;
  if (await issuedRecently(db, row.id, 'reset_password')) return;
  const token = await issueToken(db, row.id, 'reset_password');
  await sendSafely(mailer, passwordResetEmail(row.email, row.name, appLink('/reset-password', token)));
}

/** Sets a new password from a reset link and signs the user in. */
export async function resetPassword(db: Db, token: string, newPassword: string): Promise<AuthResult> {
  const userId = await consumeToken(db, token, 'reset_password');
  if (!userId) throw AppError.badRequest(INVALID_LINK);
  const existing = await findUserById(db, userId);
  if (!existing) throw AppError.badRequest(INVALID_LINK);
  const password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const [row] = await db
    .update(users)
    .set({
      password,
      // Opening the emailed link proves the user owns the address.
      emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  if (!row) throw AppError.badRequest(INVALID_LINK);
  await revokeTokens(db, userId, 'reset_password');
  await revokeTokens(db, userId, 'verify_email');
  return withToken(toSelfUser(row));
}

/**
 * Signs in with a verified Google account. Links to an existing account with the same
 * email, or creates one. Uses the Google profile photo unless the user uploaded their own.
 */
export async function signInWithGoogle(db: Db, profile: GoogleProfile): Promise<AuthResult> {
  if (!profile.emailVerified) throw AppError.unauthorized('Your Google account email is not verified');

  const [byGoogle] = await db.select().from(users).where(eq(users.googleId, profile.sub)).limit(1);
  const existing = byGoogle ?? (await findUserByEmail(db, profile.email));

  if (existing) {
    // Keep a photo the user uploaded themselves; otherwise use (or refresh) Google's.
    const uploadedOwn = Boolean(existing.photoUrl) && !isGooglePhoto(existing.photoUrl);
    const photoUrl = uploadedOwn || !profile.picture ? existing.photoUrl : profile.picture;
    const [row] = await db
      .update(users)
      .set({
        googleId: profile.sub,
        photoUrl,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    if (!row) throw AppError.unauthorized();
    if (row.photoUrl !== existing.photoUrl) await syncAuthorPhoto(db, row);
    // A pending verification link is no longer needed.
    await revokeTokens(db, row.id, 'verify_email');
    return withToken(toSelfUser(row));
  }

  // New account. It has no usable password until the user sets one via "Forgot password".
  const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), BCRYPT_ROUNDS);
  try {
    const [row] = await db
      .insert(users)
      .values({
        name: profile.name.slice(0, 50),
        email: profile.email,
        password,
        photoUrl: profile.picture,
        googleId: profile.sub,
        emailVerifiedAt: new Date(),
      })
      .returning();
    if (!row) throw new Error('Insert returned no row');
    return withToken(toSelfUser(row));
  } catch (err) {
    // Two sign-ins racing for the same new account: the other one won, so link to it.
    if (pgErrorCode(err) === '23505') return signInWithGoogle(db, profile);
    throw err;
  }
}

const isGooglePhoto = (url: string) => /^https:\/\/[a-z0-9-]+\.googleusercontent\.com\//.test(url);
