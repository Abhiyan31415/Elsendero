import { Router } from 'express';
import multer from 'multer';
import type { AppDeps } from '../../deps.js';
import { requireAuth } from '../../lib/auth.js';
import { uploadsController } from './uploads.controller.js';
import { MAX_UPLOAD_BYTES } from './uploads.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 10 },
});

/** Mounted at /api/v1/uploads. */
export default function uploadsRoutes(deps: AppDeps): Router {
  const c = uploadsController(deps);
  const router = Router();
  router.post('/', requireAuth, upload.single('image'), c.create);
  return router;
}

/** Mounted at /media (outside /api/v1 so URLs stay short and cacheable). */
export function mediaRoutes(deps: AppDeps): Router {
  const c = uploadsController(deps);
  const router = Router();
  router.get('/*key', c.media);
  return router;
}
