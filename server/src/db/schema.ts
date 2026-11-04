// Every table in the app. Each module owns its tables in
// src/modules/<name>/<name>.schema.ts; add one re-export line per module here,
// then run `npm run db:generate` to create a migration in server/drizzle/.
export * from '../modules/users/users.schema.js';
export * from '../modules/trails/trails.schema.js';
export * from '../modules/events/events.schema.js';
export * from '../modules/messages/messages.schema.js';
export * from '../modules/auth/auth.schema.js';
