import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Works for both src/config/paths.ts (tsx) and dist/config/paths.js (node):
// both are two levels below the server/ directory.
const here = path.dirname(fileURLToPath(import.meta.url));

export const SERVER_ROOT = path.resolve(here, '..', '..');
export const LEGACY_UPLOADS_DIR = path.join(SERVER_ROOT, 'uploads');
export const MIGRATIONS_DIR = path.join(SERVER_ROOT, 'drizzle');
