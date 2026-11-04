import { Router } from 'express';
import type { AppDeps } from '../deps.js';
import authRoutes from './auth/auth.routes.js';
import eventsRoutes from './events/events.routes.js';
import messagesRoutes from './messages/messages.routes.js';
import roomsRoutes from './rooms/rooms.routes.js';
import trailsRoutes from './trails/trails.routes.js';
import uploadsRoutes from './uploads/uploads.routes.js';
import usersRoutes from './users/users.routes.js';

/**
 * Every module router, mounted under /api/v1.
 * To add a module: create src/modules/<name>/<name>.routes.ts exporting
 * `default function (deps: AppDeps): Router`, then add ONE import + ONE line below.
 */
export function createApiRouter(deps: AppDeps): Router {
  const api = Router();
  api.use('/auth', authRoutes(deps));
  api.use('/users', usersRoutes(deps));
  api.use('/trails', trailsRoutes(deps));
  api.use('/events', eventsRoutes(deps));
  api.use('/messages', messagesRoutes(deps));
  api.use('/rooms', roomsRoutes(deps));
  api.use('/uploads', uploadsRoutes(deps));
  return api;
}
