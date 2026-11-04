import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestContext, registerUser, type TestContext } from './helpers.js';

let ctx: TestContext;
beforeAll(async () => {
  ctx = await createTestContext();
});
afterAll(async () => {
  await ctx.close();
});

describe('health', () => {
  it('GET /health and /api/v1/health report ok', async () => {
    for (const url of ['/health', '/api/v1/health']) {
      const res = await request(ctx.app).get(url);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    }
  });

  it('unknown routes return the error envelope', async () => {
    const res = await request(ctx.app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: 'Route not found' });
  });

  it('old unversioned routes are gone', async () => {
    expect((await request(ctx.app).post('/user/login').send({})).status).toBe(404);
    expect((await request(ctx.app).get('/trial')).status).toBe(404);
  });
});

describe('auth', () => {
  it('registers a user and returns { user, token }', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/auth/register')
      .send({ name: '  Asha  ', email: '  Asha@Example.COM ', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const { user, token } = res.body.result;
    expect(user).toEqual({
      id: expect.any(String),
      name: 'Asha',
      email: 'asha@example.com',
      photoURL: expect.any(String),
    });
    expect(user).not.toHaveProperty('password');
    expect(typeof token).toBe('string');
  });

  it('rejects a duplicate email (case-insensitive) with 409', async () => {
    await registerUser(ctx.app, { email: 'dup@example.com' });
    const res = await request(ctx.app)
      .post('/api/v1/auth/register')
      .send({ name: 'Other', email: 'DUP@example.com', password: 'secret123' });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, message: 'An account with this email already exists' });
  });

  it.each([
    [{ name: 'A', email: 'a@example.com', password: 'secret123' }, 'Name must be between 2 and 50 characters'],
    [{ name: 'Valid', email: 'not-an-email', password: 'secret123' }, 'Please enter a valid email address'],
    [{ name: 'Valid', email: 'v@example.com', password: 'short1' }, 'Password must be at least 8 characters long'],
    [{ name: 'Valid', email: 'v@example.com', password: 'lettersonly' }, 'Password must contain at least one letter and one number'],
    [{ name: 'Valid', email: 'v@example.com' }, 'Password is required'],
  ])('validates registration input %#', async (body, message) => {
    const res = await request(ctx.app).post('/api/v1/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message });
  });

  it('logs in with correct credentials', async () => {
    const u = await registerUser(ctx.app, { email: 'login@example.com', password: 'secret123' });
    const res = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ email: 'LOGIN@example.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.result.user).toMatchObject({ id: u.id, email: 'login@example.com' });
    expect(typeof res.body.result.token).toBe('string');
  });

  it('returns the same 401 for a wrong password and an unknown email', async () => {
    await registerUser(ctx.app, { email: 'wrongpw@example.com' });
    const wrong = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrongpw@example.com', password: 'nottheone1' });
    const unknown = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'nottheone1' });
    for (const res of [wrong, unknown]) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ success: false, message: 'Invalid email or password' });
    }
  });

  it('GET /auth/me returns the user for a valid token and 401 otherwise', async () => {
    const u = await registerUser(ctx.app);
    const ok = await request(ctx.app).get('/api/v1/auth/me').set('Authorization', `Bearer ${u.token}`);
    expect(ok.status).toBe(200);
    expect(ok.body.result.user).toMatchObject({ id: u.id, name: u.name, email: u.email.toLowerCase() });

    const none = await request(ctx.app).get('/api/v1/auth/me');
    expect(none.status).toBe(401);
    expect(none.body.success).toBe(false);

    const bad = await request(ctx.app).get('/api/v1/auth/me').set('Authorization', 'Bearer garbage');
    expect(bad.status).toBe(401);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
