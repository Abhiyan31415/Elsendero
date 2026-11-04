import { Router } from 'express';
import type { AppDeps } from '../../deps.js';
import { requireAuth } from '../../lib/auth.js';
import { usersController } from './users.controller.js';

export default function usersRoutes(deps: AppDeps): Router {
  const c = usersController(deps);
  const router = Router();
  router.patch('/me', requireAuth, c.updateMe);
  router.get('/:id', c.getById);
  return router;
}
