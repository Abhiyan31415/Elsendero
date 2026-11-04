import { sql } from 'drizzle-orm';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createTestContext, googleCredential, registerUser, type TestContext } from './helpers.js';

let ctx: TestContext;
beforeAll(async () => {
  ctx = await createTestContext();
});
afterAll(async () => {
  await ctx.close();
});

const google = (credential: string) => request(ctx.app).post('/api/v1/auth/google').send({ credential });

describe('Google sign-in', () => {
  it('creates a verified account with the Google photo', async () => {
    const res = await google(googleCredential({ email: 'new@gmail.com', name: 'Asha Rai' }));
    expect(res.status).toBe(200);
    expect(res.body.result.user).toMatchObject({
      name: 'Asha Rai',
      email: 'new@gmail.com',
      photoURL: 'https://lh3.googleusercontent.com/a/photo',
      emailVerified: true,
    });
    expect(typeof res.body.result.token).toBe('string');

    const again = await google(googleCredential({ email: 'new@gmail.com' }));
    expect(again.body.result.user.id).toBe(res.body.result.user.id);
  });

  it('links an existing email/password account and verifies it', async () => {
    await request(ctx.app)
      .post('/api/v1/auth/register')
      .send({ name: 'Pending', email: 'link@gmail.com', password: 'secret123' });
    const res = await google(googleCredential({ email: 'link@gmail.com' }));
    expect(res.status).toBe(200);
    expect(res.body.result.user).toMatchObject({
      name: 'Pending',
      emailVerified: true,
      photoURL: 'https://lh3.googleusercontent.com/a/photo',
    });
    // The password still works too.
    const login = await request(ctx.app).post('/api/v1/auth/login').send({ email: 'link@gmail.com', password: 'secret123' });
    expect(login.status).toBe(200);
  });

  it('keeps a photo the user uploaded but refreshes an old Google photo', async () => {
    const u = await registerUser(ctx, { email: 'own@gmail.com' });
    await request(ctx.app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ photoURL: 'http://api.test/media/me.png' });
    const res = await google(googleCredential({ email: 'own@gmail.com' }));
    expect(res.body.result.user.photoURL).toBe('http://api.test/media/me.png');

    await google(googleCredential({ email: 'refresh@gmail.com', picture: 'https://lh3.googleusercontent.com/a/old' }));
    const refreshed = await google(
      googleCredential({ email: 'refresh@gmail.com', picture: 'https://lh3.googleusercontent.com/a/new' }),
    );
    expect(refreshed.body.result.user.photoURL).toBe('https://lh3.googleusercontent.com/a/new');
  });

  it("updates the author photo on the user's trails", async () => {
    const u = await registerUser(ctx, { email: 'author@gmail.com' });
    await ctx.db.execute(
      sql`insert into trails (sloc, floc, title, description, uid, u_name, u_photo) values ('[85,27]', '[86,28]', 'T', 'D', ${u.id}, 'A', '')`,
    );
    await google(googleCredential({ email: 'author@gmail.com' }));
    const rows = (await ctx.db.execute(sql`select u_photo from trails where uid = ${u.id}`)) as unknown as {
      rows: { u_photo: string }[];
    };
    expect(rows.rows[0]?.u_photo).toBe('https://lh3.googleusercontent.com/a/photo');
  });

  it('rejects unverified Google emails and bad credentials', async () => {
    const unverified = await google(googleCredential({ email: 'x@gmail.com', emailVerified: false }));
    expect(unverified.status).toBe(401);
    const bad = await google('not-json');
    expect(bad.status).toBe(401);
    expect(bad.body.message).toBe('Google sign-in failed, please try again');
  });

  it('returns 503 when Google sign-in is not configured', async () => {
    const app = createApp({ db: ctx.db, storage: ctx.storage, mailer: ctx.mailer });
    const res = await request(app).post('/api/v1/auth/google').send({ credential: 'x' });
    expect(res.status).toBe(503);
  });

  it('new email/password accounts get no stock photo', async () => {
    const u = await registerUser(ctx);
    const me = await request(ctx.app).get('/api/v1/auth/me').set('Authorization', `Bearer ${u.token}`);
    expect(me.body.result.user.photoURL).toBe('');
  });
});
