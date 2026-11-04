import cors, { type CorsOptions } from 'cors';
import express, { type Express, type RequestHandler } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { LEGACY_UPLOADS_DIR } from './config/paths.js';
import { pingDb } from './db/client.js';
import type { AppDeps } from './deps.js';
import { errorHandler, notFoundHandler } from './lib/errors.js';
import { createApiRouter } from './modules/index.js';
import { mediaRoutes } from './modules/uploads/uploads.routes.js';

export type { AppDeps } from './deps.js';

export function corsOptions(origins: string[] = env.CLIENT_ORIGINS): CorsOptions {
  return {
    // Requests without an Origin header (curl, health checks, server-to-server) are allowed.
    origin: (origin, cb) => cb(null, !origin || origins.includes(origin)),
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 600,
  };
}

/** Builds the Express app. No listen, no DB connect: safe to use in tests. */
export function createApp(deps: AppDeps): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  // cross-origin CORP so the frontend (another origin) can load /media and /uploads images.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(corsOptions()));
  app.use(express.json({ limit: '1mb' }));

  const health: RequestHandler = async (_req, res) => {
    const dbOk = await pingDb(deps.db);
    res.status(dbOk ? 200 : 503).json({ status: dbOk ? 'ok' : 'unavailable' });
  };
  app.get('/health', health);
  app.get('/', (_req, res) => {
    res.json({ success: true, result: { name: 'gantabya-api', version: 'v1' } });
  });

  const api = createApiRouter(deps);
  app.get('/api/v1/health', health);
  app.use('/api/v1', api);

  app.use('/media', mediaRoutes(deps));
  // Pre-v1 uploads; old database rows still point at /uploads/<file>.
  app.use(
    '/uploads',
    express.static(LEGACY_UPLOADS_DIR, { dotfiles: 'ignore', index: false, maxAge: '30d', fallthrough: true }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
