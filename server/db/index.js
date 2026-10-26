import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Small pool: the server has very little RAM.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

export const query = (text, params) => pool.query(text, params);

export async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
}
