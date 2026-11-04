import { randomUUID } from 'node:crypto';
import type { Storage } from '../../lib/storage.js';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface ImageType {
  ext: 'jpg' | 'png' | 'webp';
  mime: 'image/jpeg' | 'image/png' | 'image/webp';
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Detects JPEG / PNG / WebP from magic bytes (the client-supplied mimetype is not trusted). */
export function detectImageType(buf: Buffer): ImageType | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  if (buf.length >= 8 && PNG_SIG.every((b, i) => buf[i] === b)) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

export async function storeImage(
  storage: Storage,
  userId: string,
  buf: Buffer,
  type: ImageType,
): Promise<{ key: string; url: string }> {
  const safeUser = userId.replace(/[^A-Za-z0-9_-]/g, '') || 'anonymous';
  const key = `uploads/${safeUser}/${randomUUID()}.${type.ext}`;
  await storage.putObject(key, buf, type.mime);
  return { key, url: storage.publicUrl(key) };
}
