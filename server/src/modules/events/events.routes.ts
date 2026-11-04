import { Router } from 'express';
import type { AppDeps } from '../../deps.js';
import { requireAuth } from '../../lib/auth.js';
import { eventsController } from './events.controller.js';

export default function eventsRoutes(deps: AppDeps): Router {
  const c = eventsController(deps);
  const router = Router();
  router.get('/', c.list);
  router.post('/', requireAuth, c.create);
  return router;
}
