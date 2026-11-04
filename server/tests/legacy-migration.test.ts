import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { trails, users } from '../src/db/schema.js';
import { seed } from '../src/db/seed.js';
import { migrateUploads, rewriteLegacyUrl } from '../src/modules/uploads/legacy-migration.js';
import { createTestContext, TINY_PNG, type TestContext } from './helpers.js';

let ctx: TestContext;
let sourceDir: string;
beforeAll(async () => {
  ctx = await createTestContext();
  sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gantabya-legacy-'));
  fs.writeFileSync(path.join(sourceDir, '123-land 9.png'), TINY_PNG);
});
afterAll(async () => {
  await ctx.close();
  fs.rmSync(sourceDir, { recursive: true, force: true });
});

describe('legacy upload migration', () => {
  it('rewriteLegacyUrl only maps flat legacy filenames', () => {
    const urls = new Map([['a b.png', 'http://new/legacy/a%20b.png']]);
    expect(rewriteLegacyUrl('/uploads/a%20b.png', urls)).toBe('http://new/legacy/a%20b.png');
    expect(rewriteLegacyUrl('https://old.host/uploads/a b.png', urls)).toBe('http://new/legacy/a%20b.png');
    expect(rewriteLegacyUrl('http://api/media/uploads/1/x.png', urls)).toBeNull();
    expect(rewriteLegacyUrl('https://randomuser.me/x.jpg', urls)).toBeNull();
  });

  it('uploads files and rewrites user + trail references (dry run writes nothing)', async () => {
    expect(await seed(ctx.db)).toBe(true);
    expect(await seed(ctx.db)).toBe(false); // idempotent

    const [user] = await ctx.db
      .update(users)
      .set({ photoUrl: 'https://api.old/uploads/123-land%209.png' })
      .where(eq(users.email, 'demo@elsendero.app'))
      .returning();
    const [trail] = await ctx.db
      .update(trails)
      .set({ images: [['/uploads/123-land 9.png'], ['https://keep.me/x.jpg']] })
      .where(eq(trails.title, 'Lalitpur heritage walk'))
      .returning();
    if (!user || !trail) throw new Error('fixture missing');

    const quiet = () => {};
    const dry = await migrateUploads({ db: ctx.db, storage: ctx.storage, sourceDir, dryRun: true, log: quiet });
    expect(dry).toMatchObject({ files: 1, users: 1, trails: 1 });
    expect(fs.existsSync(path.join(ctx.storageDir, 'legacy'))).toBe(false);

    const real = await migrateUploads({ db: ctx.db, storage: ctx.storage, sourceDir, dryRun: false, log: quiet });
    expect(real).toMatchObject({ files: 1, users: 1, trails: 1 });
    expect(fs.existsSync(path.join(ctx.storageDir, 'legacy', '123-land 9.png'))).toBe(true);

    const newUrl = 'http://api.test/media/legacy/123-land%209.png';
    const [u2] = await ctx.db.select().from(users).where(eq(users.id, user.id));
    expect(u2?.photoUrl).toBe(newUrl);
    const [t2] = await ctx.db.select().from(trails).where(eq(trails.id, trail.id));
    expect(t2?.images).toEqual([[newUrl], ['https://keep.me/x.jpg']]);
  });
});
