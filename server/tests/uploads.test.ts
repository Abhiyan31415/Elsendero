import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestContext, registerUser, TINY_PNG, type TestContext } from './helpers.js';

let ctx: TestContext;
let token: string;
let userId: string;
beforeAll(async () => {
  ctx = await createTestContext();
  const u = await registerUser(ctx);
  token = u.token;
  userId = u.id;
});
afterAll(async () => {
  await ctx.close();
});

describe('uploads', () => {
  it('requires auth', async () => {
    const res = await request(ctx.app).post('/api/v1/uploads').attach('image', TINY_PNG, 'a.png');
    expect(res.status).toBe(401);
  });

  it('rejects a non-image even when it claims to be a PNG', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('<script>alert(1)</script>'), { filename: 'evil.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: 'Only JPEG, PNG and WebP images are allowed' });
  });

  it('rejects a request without a file', async () => {
    const res = await request(ctx.app).post('/api/v1/uploads').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('rejects files over 5MB with 413', async () => {
    const big = Buffer.concat([TINY_PNG, Buffer.alloc(5 * 1024 * 1024 + 1)]);
    const res = await request(ctx.app)
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', big, 'big.png');
    expect(res.status).toBe(413);
  });

  it('accepts a real PNG and serves it from /media/<key>', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', TINY_PNG, { filename: 'whatever.bin', contentType: 'application/octet-stream' });
    expect(res.status).toBe(201);
    const { key, url } = res.body.result as { key: string; url: string };
    expect(key).toMatch(new RegExp(`^uploads/${userId}/[0-9a-f-]{36}\\.png$`));
    expect(url).toBe(`http://api.test/media/${key}`);
    expect(fs.existsSync(path.join(ctx.storageDir, key))).toBe(true);

    const media = await request(ctx.app).get(`/media/${key}`).buffer(true);
    expect(media.status).toBe(200);
    expect(media.headers['content-type']).toBe('image/png');
    expect(media.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(Buffer.compare(media.body as Buffer, TINY_PNG)).toBe(0);
  });

  it('returns 404 for missing media and blocks traversal', async () => {
    expect((await request(ctx.app).get('/media/uploads/nope.png')).status).toBe(404);
    expect((await request(ctx.app).get('/media/..%2F..%2Fetc%2Fpasswd')).status).toBe(404);
  });
});
