// Applies pending migrations from server/drizzle/. `npm run db:migrate`
// (the server also does this on startup).
import { env } from '../config/env.js';
import { createPgDb } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';

const conn = createPgDb({ url: env.DATABASE_URL, ssl: env.DATABASE_SSL, max: 1 });
try {
  await runMigrations(conn);
  console.log('[db] migrations applied');
} catch (err) {
  console.error('[db] migration failed:', err);
  process.exitCode = 1;
} finally {
  await conn.close();
}
