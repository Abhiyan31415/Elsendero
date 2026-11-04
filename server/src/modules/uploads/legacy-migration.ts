// Pre-v1 uploads → object storage. Used by src/scripts/migrate-uploads.ts.
import fs from 'node:fs/promises';
import path from 'node:path';
import { eq, like, or, sql } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { contentTypeFor, type Storage } from '../../lib/storage.js';
import { trails } from '../trails/trails.schema.js';
import { users } from '../users/users.schema.js';

/** Maps a legacy `/uploads/<file>` reference (relative or absolute URL) to its new URL. */
export function rewriteLegacyUrl(value: string, urls: Map<string, string>): string | null {
  const idx = value.lastIndexOf('/uploads/');
  if (idx === -1) return null;
  let rest = value.slice(idx + '/uploads/'.length).split(/[?#]/)[0] ?? '';
  try {
    rest = decodeURIComponent(rest);
  } catch {
    /* keep raw */
  }
  if (!rest || rest.includes('/')) return null; // new-style keys (uploads/<user>/<uuid>) are not legacy
  return urls.get(rest) ?? null;
}

export async function migrateUploads(opts: {
  db: Db;
  storage: Storage;
  sourceDir: string;
  dryRun: boolean;
  log?: (msg: string) => void;
}): Promise<{ files: number; users: number; trails: number }> {
  const log = opts.log ?? console.log;
  const entries = await fs.readdir(opts.sourceDir, { withFileTypes: true }).catch(() => []);
  const urls = new Map<string, string>();

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue;
    const key = `legacy/${entry.name}`;
    urls.set(entry.name, opts.storage.publicUrl(key));
    if (opts.dryRun) {
      log(`[dry-run] would upload ${entry.name} -> ${key}`);
    } else {
      const body = await fs.readFile(path.join(opts.sourceDir, entry.name));
      await opts.storage.putObject(key, body, contentTypeFor(entry.name));
      log(`uploaded ${entry.name} -> ${key}`);
    }
  }

  let userCount = 0;
  const userRows = await opts.db
    .select({ id: users.id, photoUrl: users.photoUrl })
    .from(users)
    .where(like(users.photoUrl, '%/uploads/%'));
  for (const u of userRows) {
    const next = rewriteLegacyUrl(u.photoUrl, urls);
    if (!next || next === u.photoUrl) continue;
    userCount++;
    log(`${opts.dryRun ? '[dry-run] would update' : 'updated'} user ${u.id} photo: ${u.photoUrl} -> ${next}`);
    if (!opts.dryRun) await opts.db.update(users).set({ photoUrl: next }).where(eq(users.id, u.id));
  }

  let trailCount = 0;
  const trailRows = await opts.db
    .select({ id: trails.id, images: trails.images, uPhoto: trails.uPhoto })
    .from(trails)
    .where(or(like(trails.uPhoto, '%/uploads/%'), sql`${trails.images}::text like '%/uploads/%'`));
  for (const t of trailRows) {
    let changed = false;
    const images = (t.images ?? []).map((group) =>
      (Array.isArray(group) ? group : [group]).map((src) => {
        const next = typeof src === 'string' ? rewriteLegacyUrl(src, urls) : null;
        if (next && next !== src) {
          changed = true;
          return next;
        }
        return src;
      }),
    );
    const uPhotoNext = rewriteLegacyUrl(t.uPhoto, urls);
    const uPhoto = uPhotoNext ?? t.uPhoto;
    if (uPhoto !== t.uPhoto) changed = true;
    if (!changed) continue;
    trailCount++;
    log(`${opts.dryRun ? '[dry-run] would update' : 'updated'} trail ${t.id} image URLs`);
    if (!opts.dryRun) await opts.db.update(trails).set({ images, uPhoto }).where(eq(trails.id, t.id));
  }

  return { files: urls.size, users: userCount, trails: trailCount };
}
