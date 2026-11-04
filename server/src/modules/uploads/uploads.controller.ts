import { pipeline } from 'node:stream/promises';
import type { AppDeps } from '../../deps.js';
import { currentUser } from '../../lib/auth.js';
import { AppError, asyncHandler, ok } from '../../lib/http.js';
import { isSafeKey } from '../../lib/storage.js';
import { detectImageType, storeImage } from './uploads.service.js';

export function uploadsController({ storage }: AppDeps) {
  return {
    /** POST /uploads (multipart field `image`) → 201 { key, url } */
    create: asyncHandler(async (req, res) => {
      const file = req.file;
      if (!file) throw AppError.badRequest('No image provided (multipart field "image")');
      const type = detectImageType(file.buffer);
      if (!type) throw AppError.badRequest('Only JPEG, PNG and WebP images are allowed');
      ok(res, await storeImage(storage, currentUser(req).id, file.buffer, type), 201);
    }),

    /** GET /media/<key> streams an object from storage. */
    media: asyncHandler(async (req, res) => {
      const raw = (req.params as { key?: string | string[] }).key;
      const key = Array.isArray(raw) ? raw.join('/') : (raw ?? '');
      if (!isSafeKey(key)) throw AppError.notFound('File not found');

      const obj = await storage.getObjectStream(key);
      if (!obj) throw AppError.notFound('File not found');

      res.setHeader('Content-Type', obj.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      if (obj.contentLength !== undefined) res.setHeader('Content-Length', String(obj.contentLength));
      try {
        await pipeline(obj.body, res);
      } catch (err) {
        // Client aborts are normal; anything else is logged. Headers are already sent.
        if ((err as NodeJS.ErrnoException).code !== 'ERR_STREAM_PREMATURE_CLOSE') {
          console.error('[media] stream error:', (err as Error).message);
        }
        res.destroy();
      }
    }),
  };
}
