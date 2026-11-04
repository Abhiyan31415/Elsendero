import { Router } from 'express';
import type { AppDeps } from '../../deps.js';
import { requireAuth } from '../../lib/auth.js';
import { trailsController } from '../trails/trails.controller.js';

/**
 * Legacy "room" endpoint: in the pre-v1 server POST /room created a trail with
 * the creator taken from the token. Kept as an alias of POST /trails.
 */
export default function roomsRoutes(deps: AppDeps): Router {
  const trails = trailsController(deps);
  const router = Router();
  router.post('/', requireAuth, trails.create);
  return router;
}
