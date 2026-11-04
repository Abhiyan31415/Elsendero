import pg from 'pg';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema.js';

export type Schema = typeof schema;
/** Driver-agnostic database handle (node-postgres in prod, PGlite in tests). */
export type Db = PgDatabase<PgQueryResultHKT, Schema>;

export interface PgConnection {
  db: Db;
  pool: pg.Pool;
  close: () => Promise<void>;
}

export function createPgDb(opts: { url: string; ssl: boolean; max?: number }): PgConnection {
  const pool = new pg.Pool({
    connectionString: opts.url,
    max: opts.max ?? 10,
    ssl: opts.ssl ? true : undefined,
  });
  pool.on('error', (err) => console.error('[db] idle client error:', err.message));
  const db = drizzle({ client: pool, schema });
  return { db, pool, close: () => pool.end() };
}

export async function pingDb(db: Db): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}
