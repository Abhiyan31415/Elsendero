import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { MIGRATIONS_DIR } from '../config/paths.js';
import type { PgConnection } from './client.js';

/** Applies pending SQL migrations from server/drizzle/ (idempotent). */
export async function runMigrations(conn: PgConnection): Promise<void> {
  await migrate(conn.db as unknown as NodePgDatabase, { migrationsFolder: MIGRATIONS_DIR });
}
