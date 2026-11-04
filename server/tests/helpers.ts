import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { MIGRATIONS_DIR } from '../src/config/paths.js';
import type { Db } from '../src/db/client.js';
import * as schema from '../src/db/schema.js';
import type { GoogleProfile, GoogleVerifier } from '../src/lib/google.js';
import { MemoryMailer } from '../src/lib/mailer.js';
import { DiskStorage } from '../src/lib/storage.js';

export interface TestContext {
  app: Express;
  db: Db;
  storage: DiskStorage;
  mailer: MemoryMailer;
  storageDir: string;
  close: () => Promise<void>;
}

/** In-process Postgres (PGlite) with the real migrations + disk storage in a temp dir. */
export async function createTestContext(): Promise<TestContext> {
  const client = new PGlite();
  const pgliteDb = drizzle({ client, schema });
  await migrate(pgliteDb, { migrationsFolder: MIGRATIONS_DIR });
  const db = pgliteDb as unknown as Db;

  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gantabya-test-'));
  const storage = new DiskStorage(storageDir, 'http://api.test');
  const mailer = new MemoryMailer();
  const app = createApp({ db, storage, mailer, google: fakeGoogle });

  return {
    app,
    db,
    storage,
    mailer,
    storageDir,
    close: async () => {
      await client.close();
      fs.rmSync(storageDir, { recursive: true, force: true });
    },
  };
}

/** Test stand-in for Google: the "credential" is the JSON of the profile it should return. */
export const fakeGoogle: GoogleVerifier = {
  async verify(credential) {
    return JSON.parse(credential) as GoogleProfile;
  },
};

export const googleCredential = (p: Partial<GoogleProfile> & { email: string }) =>
  JSON.stringify({ sub: `g-${p.email}`, emailVerified: true, name: 'Google User', picture: 'https://lh3.googleusercontent.com/a/photo', ...p });

let counter = 0;

/** Pulls the `?token=` value out of the link in an email's text body. */
export function tokenFromEmail(mailer: MemoryMailer, to: string): string {
  const email = mailer.last(to);
  const match = email && /[?&]token=([^\s&]+)/.exec(email.text);
  if (!match?.[1]) throw new Error(`no email with a token sent to ${to}`);
  return decodeURIComponent(match[1]);
}

/** Registers a user, clicks the verification link and returns a signed-in user. */
export async function registerUser(
  ctx: Pick<TestContext, 'app' | 'mailer'>,
  overrides: Partial<{ name: string; email: string; password: string }> = {},
) {
  const { app, mailer } = ctx;
  counter += 1;
  const body = {
    name: overrides.name ?? `Tester ${counter}`,
    email: overrides.email ?? `tester${counter}-${Date.now()}@example.com`,
    password: overrides.password ?? 'secret123',
  };
  const res = await request(app).post('/api/v1/auth/register').send(body);
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  const email = res.body.result.user.email as string;
  const verified = await request(app).post('/api/v1/auth/verify-email').send({ token: tokenFromEmail(mailer, email) });
  if (verified.status !== 200) throw new Error(`verify failed: ${verified.status} ${JSON.stringify(verified.body)}`);
  return {
    ...body,
    id: verified.body.result.user.id as string,
    token: verified.body.result.token as string,
  };
}

// Smallest valid PNG: 1x1 transparent pixel.
export const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
