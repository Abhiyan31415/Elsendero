// Fills the database with dummy data: `npm run seed`.
// Safe to re-run: it only seeds when the users table is empty.
import { env } from '../config/env.js';
import { createPgDb } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';
import { seed } from '../db/seed.js';

const conn = createPgDb({ url: env.DATABASE_URL, ssl: env.DATABASE_SSL, max: 1 });
try {
  await runMigrations(conn);
  const seeded = await seed(conn.db);
  console.log(
    seeded
      ? 'Seeded dummy data. Demo login: demo@elsendero.app / password123'
      : 'Database already has data, skipping seed.',
  );
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await conn.close();
}
