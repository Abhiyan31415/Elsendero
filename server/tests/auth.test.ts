import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { MIGRATIONS_DIR } from '../src/config/paths.js';
import { createTestContext, registerUser, tokenFromEmail, type TestContext } from './helpers.js';

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
  it('registers an unverified user, returns no token and emails a verification link', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/auth/register')
      .send({ name: '  Asha  ', email: '  Asha@Example.COM ', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toEqual({
      user: {
        id: expect.any(String),
        name: 'Asha',
        email: 'asha@example.com',
        photoURL: expect.any(String),
        emailVerified: false,
      },
      verificationRequired: true,
    });
    expect(res.body.result).not.toHaveProperty('token');

    const email = ctx.mailer.last('asha@example.com');
    expect(email?.subject).toBe('Verify your Gantabya email');
    expect(email?.text).toContain('http://localhost:3000/verify-email?token=');
  });

  it('rejects a duplicate email (case-insensitive) with 409', async () => {
    await registerUser(ctx, { email: 'dup@example.com' });
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
    const u = await registerUser(ctx, { email: 'login@example.com', password: 'secret123' });
    const res = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ email: 'LOGIN@example.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.result.user).toMatchObject({ id: u.id, email: 'login@example.com' });
    expect(typeof res.body.result.token).toBe('string');
  });

  it('returns the same 401 for a wrong password and an unknown email', async () => {
    await registerUser(ctx, { email: 'wrongpw@example.com' });
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
    const u = await registerUser(ctx);
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

describe('email verification', () => {
  const register = (email: string, password = 'secret123') =>
    request(ctx.app).post('/api/v1/auth/register').send({ name: 'Verifier', email, password });

  it('blocks login until the email is verified', async () => {
    await register('unverified@example.com');
    const res = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ email: 'unverified@example.com', password: 'secret123' });
    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      success: false,
      message: 'Please verify your email first. Check your inbox for the link.',
      code: 'EMAIL_NOT_VERIFIED',
    });
  });

  it('a wrong password on an unverified account still gets the generic 401', async () => {
    await register('unverified2@example.com');
    const res = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ email: 'unverified2@example.com', password: 'wrongpass1' });
    expect(res.status).toBe(401);
  });

  it('verifies with the emailed token, signs in, and the token is single-use', async () => {
    await register('verify@example.com');
    const token = tokenFromEmail(ctx.mailer, 'verify@example.com');

    const res = await request(ctx.app).post('/api/v1/auth/verify-email').send({ token });
    expect(res.status).toBe(200);
    expect(res.body.result.user).toMatchObject({ email: 'verify@example.com', emailVerified: true });
    expect(typeof res.body.result.token).toBe('string');

    const login = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ email: 'verify@example.com', password: 'secret123' });
    expect(login.status).toBe(200);

    const again = await request(ctx.app).post('/api/v1/auth/verify-email').send({ token });
    expect(again.status).toBe(400);
  });

  it('rejects unknown and expired tokens', async () => {
    const unknown = await request(ctx.app).post('/api/v1/auth/verify-email').send({ token: 'not-a-real-token' });
    expect(unknown.status).toBe(400);
    expect(unknown.body.message).toBe('This link is invalid or has expired. Please request a new one.');

    await register('expired@example.com');
    const token = tokenFromEmail(ctx.mailer, 'expired@example.com');
    await ctx.db.execute(sql`update auth_tokens set expires_at = now() - interval '1 minute'`);
    const expired = await request(ctx.app).post('/api/v1/auth/verify-email').send({ token });
    expect(expired.status).toBe(400);
  });

  it('resend sends a new link that replaces the old one, with a cooldown', async () => {
    await register('resend@example.com');
    const first = tokenFromEmail(ctx.mailer, 'resend@example.com');
    const count = () => ctx.mailer.sent.filter((e) => e.to === 'resend@example.com').length;

    // Inside the cooldown: same generic reply, no new email.
    const tooSoon = await request(ctx.app).post('/api/v1/auth/resend-verification').send({ email: 'resend@example.com' });
    expect(tooSoon.status).toBe(200);
    expect(count()).toBe(1);

    await ctx.db.execute(sql`update auth_tokens set created_at = now() - interval '2 minutes'`);
    const res = await request(ctx.app).post('/api/v1/auth/resend-verification').send({ email: 'RESEND@example.com' });
    expect(res.status).toBe(200);
    expect(count()).toBe(2);

    const second = tokenFromEmail(ctx.mailer, 'resend@example.com');
    expect(second).not.toBe(first);
    expect((await request(ctx.app).post('/api/v1/auth/verify-email').send({ token: first })).status).toBe(400);
    expect((await request(ctx.app).post('/api/v1/auth/verify-email').send({ token: second })).status).toBe(200);
  });

  it('resend gives the same reply for unknown and already verified emails, without sending', async () => {
    const u = await registerUser(ctx);
    const before = ctx.mailer.sent.length;
    for (const email of [u.email, 'ghost@example.com']) {
      const res = await request(ctx.app).post('/api/v1/auth/resend-verification').send({ email });
      expect(res.status).toBe(200);
      expect(res.body.result.message).toBe('If an account exists for that email, we sent a link to it.');
    }
    expect(ctx.mailer.sent.length).toBe(before);
  });
});

describe('password reset', () => {
  it('resets the password with the emailed link and signs in', async () => {
    const u = await registerUser(ctx, { email: 'reset@example.com', password: 'oldpass123' });
    const forgot = await request(ctx.app).post('/api/v1/auth/forgot-password').send({ email: 'Reset@example.com' });
    expect(forgot.status).toBe(200);
    const email = ctx.mailer.last('reset@example.com');
    expect(email?.subject).toBe('Reset your Gantabya password');
    expect(email?.text).toContain('http://localhost:3000/reset-password?token=');
    const token = tokenFromEmail(ctx.mailer, 'reset@example.com');

    const res = await request(ctx.app).post('/api/v1/auth/reset-password').send({ token, password: 'newpass456' });
    expect(res.status).toBe(200);
    expect(res.body.result.user).toMatchObject({ id: u.id, email: 'reset@example.com' });
    expect(typeof res.body.result.token).toBe('string');

    const oldLogin = await request(ctx.app).post('/api/v1/auth/login').send({ email: 'reset@example.com', password: 'oldpass123' });
    expect(oldLogin.status).toBe(401);
    const newLogin = await request(ctx.app).post('/api/v1/auth/login').send({ email: 'reset@example.com', password: 'newpass456' });
    expect(newLogin.status).toBe(200);

    const reuse = await request(ctx.app).post('/api/v1/auth/reset-password').send({ token, password: 'another789' });
    expect(reuse.status).toBe(400);
  });

  it('gives the same reply for unknown emails and sends nothing', async () => {
    const before = ctx.mailer.sent.length;
    const res = await request(ctx.app).post('/api/v1/auth/forgot-password').send({ email: 'nobody-here@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.result.message).toBe('If an account exists for that email, we sent a link to it.');
    expect(ctx.mailer.sent.length).toBe(before);
  });

  it('enforces password rules on the new password', async () => {
    await registerUser(ctx, { email: 'weak@example.com' });
    await request(ctx.app).post('/api/v1/auth/forgot-password').send({ email: 'weak@example.com' });
    const token = tokenFromEmail(ctx.mailer, 'weak@example.com');
    const res = await request(ctx.app).post('/api/v1/auth/reset-password').send({ token, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Password must be at least 8 characters long');
    // A rejected attempt doesn't burn the link.
    const ok = await request(ctx.app).post('/api/v1/auth/reset-password').send({ token, password: 'goodpass123' });
    expect(ok.status).toBe(200);
  });

  it('also verifies an unverified account, since the user proved they own the inbox', async () => {
    await request(ctx.app).post('/api/v1/auth/register').send({ name: 'Late', email: 'late@example.com', password: 'secret123' });
    await request(ctx.app).post('/api/v1/auth/forgot-password').send({ email: 'late@example.com' });
    const token = tokenFromEmail(ctx.mailer, 'late@example.com');
    const res = await request(ctx.app).post('/api/v1/auth/reset-password').send({ token, password: 'newpass456' });
    expect(res.status).toBe(200);
    expect(res.body.result.user.emailVerified).toBe(true);
  });

  it('a reset token cannot be used to verify an email, and vice versa', async () => {
    await registerUser(ctx, { email: 'cross@example.com' });
    await request(ctx.app).post('/api/v1/auth/forgot-password').send({ email: 'cross@example.com' });
    const token = tokenFromEmail(ctx.mailer, 'cross@example.com');
    expect((await request(ctx.app).post('/api/v1/auth/verify-email').send({ token })).status).toBe(400);
  });
});

describe('legacy accounts', () => {
  it('the email verification migration marks existing users as verified', async () => {
    const pg = new PGlite();
    const run = async (file: string) => {
      const text = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      for (const stmt of text.split('--> statement-breakpoint')) if (stmt.trim()) await pg.exec(stmt);
    };
    try {
      await run('0000_init.sql');
      await pg.exec(`insert into users (name, email, password) values ('Old', 'old@example.com', 'x')`);
      await run('0001_email_verification.sql');
      const { rows } = await pg.query<{ verified: boolean }>(`select email_verified_at is not null as verified from users`);
      expect(rows).toEqual([{ verified: true }]);
    } finally {
      await pg.close();
    }
  });
});
