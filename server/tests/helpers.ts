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
import { DiskStorage } from '../src/lib/storage.js';

export interface TestContext {
  app: Express;
  db: Db;
  storage: DiskStorage;
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
  const app = createApp({ db, storage });

  return {
    app,
    db,
    storage,
    storageDir,
    close: async () => {
      await client.close();
      fs.rmSync(storageDir, { recursive: true, force: true });
    },
  };
}

let counter = 0;

export async function registerUser(
  app: Express,
  overrides: Partial<{ name: string; email: string; password: string }> = {},
) {
  counter += 1;
  const body = {
    name: overrides.name ?? `Tester ${counter}`,
    email: overrides.email ?? `tester${counter}-${Date.now()}@example.com`,
    password: overrides.password ?? 'secret123',
  };
  const res = await request(app).post('/api/v1/auth/register').send(body);
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return {
    ...body,
    id: res.body.result.user.id as string,
    token: res.body.result.token as string,
  };
}

// Smallest valid PNG: 1x1 transparent pixel.
export const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
