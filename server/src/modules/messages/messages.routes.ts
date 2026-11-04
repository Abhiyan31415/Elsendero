import { Router } from 'express';
import type { AppDeps } from '../../deps.js';
import { requireAuth } from '../../lib/auth.js';
import { messagesController } from './messages.controller.js';

export default function messagesRoutes(deps: AppDeps): Router {
  const c = messagesController(deps);
  const router = Router();
  router.get('/', c.list);
  router.post('/', requireAuth, c.create);
  return router;
}
