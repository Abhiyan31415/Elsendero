import { Router } from 'express';
import type { AppDeps } from '../../deps.js';
import { requireAuth } from '../../lib/auth.js';
import { createRateLimiter } from '../../lib/rateLimit.js';
import { authController } from './auth.controller.js';

export default function authRoutes(deps: AppDeps): Router {
  const c = authController(deps);
  const limiter = createRateLimiter({
    name: 'auth',
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: 'Too many attempts, please try again later',
  });

  const router = Router();
  router.post('/register', limiter, c.register);
  router.post('/login', limiter, c.login);
  router.get('/me', requireAuth, c.me);
  return router;
}
