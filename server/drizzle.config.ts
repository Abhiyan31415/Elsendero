import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  // Only used by `drizzle-kit studio/push`; `generate` works offline.
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://localhost:5432/gantabya' },
  strict: true,
});
