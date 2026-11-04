import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { createPgDb } from './db/client.js';
import { runMigrations } from './db/migrate.js';
import { createGoogleVerifier } from './lib/google.js';
import { createMailer } from './lib/mailer.js';
import { closeRedis } from './lib/redis.js';
import { createStorage } from './lib/storage.js';
import { createSocketServer } from './sockets/index.js';

async function main(): Promise<void> {
  const conn = createPgDb({ url: env.DATABASE_URL, ssl: env.DATABASE_SSL });
  await runMigrations(conn);

  const storage = createStorage(env);
  const mailer = createMailer(env);
  const google = env.GOOGLE_CLIENT_ID ? createGoogleVerifier(env.GOOGLE_CLIENT_ID) : undefined;
  const app = createApp({ db: conn.db, storage, mailer, google });
  const server = http.createServer(app);
  const io = createSocketServer(server, { db: conn.db });

  server.listen(env.PORT, env.HOST, () => {
    console.log(`[server] listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
    console.log(`[server] storage=${storage.driver} redis=${env.REDIS_URL ? 'on' : 'off'} mail=${mailer.driver} google=${google ? 'on' : 'off'}`);
    console.log(`[server] allowed origins: ${env.CLIENT_ORIGINS.join(', ')}`);
  });

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server] ${signal} received, shutting down`);
    setTimeout(() => {
      console.error('[server] forced exit after 10s');
      process.exit(1);
    }, 10_000).unref();
    // io.close() also closes the HTTP server.
    void io.close(async () => {
      await Promise.allSettled([conn.close(), closeRedis()]);
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err: unknown) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
