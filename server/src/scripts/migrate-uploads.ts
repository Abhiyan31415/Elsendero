// Moves pre-v1 uploads (server/uploads/<file>) into object storage under
// `legacy/<file>` and rewrites `/uploads/<file>` references in the database
// to the new public URL.
//
//   npm run migrate:uploads             # do it
//   npm run migrate:uploads -- --dry-run  # only print what would change
import { env } from '../config/env.js';
import { LEGACY_UPLOADS_DIR } from '../config/paths.js';
import { createPgDb } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';
import { createStorage } from '../lib/storage.js';
import { migrateUploads } from '../modules/uploads/legacy-migration.js';

const dryRun = process.argv.includes('--dry-run');
const conn = createPgDb({ url: env.DATABASE_URL, ssl: env.DATABASE_SSL, max: 2 });
try {
  await runMigrations(conn);
  const storage = createStorage(env);
  console.log(`Storage driver: ${storage.driver}${dryRun ? ' (dry run)' : ''}; source: ${LEGACY_UPLOADS_DIR}`);
  const r = await migrateUploads({ db: conn.db, storage, sourceDir: LEGACY_UPLOADS_DIR, dryRun });
  console.log(`Done. files=${r.files} users=${r.users} trails=${r.trails}${dryRun ? ' (nothing written)' : ''}`);
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await conn.close();
}
