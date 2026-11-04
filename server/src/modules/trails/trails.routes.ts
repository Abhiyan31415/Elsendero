import { Router } from 'express';
import type { AppDeps } from '../../deps.js';
import { requireAuth } from '../../lib/auth.js';
import { trailsController } from './trails.controller.js';

export default function trailsRoutes(deps: AppDeps): Router {
  const c = trailsController(deps);
  const router = Router();
  router.get('/', c.list);
  router.get('/:id', c.get);
  router.post('/', requireAuth, c.create);
  return router;
}
