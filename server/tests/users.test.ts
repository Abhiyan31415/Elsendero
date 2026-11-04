import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { verifyToken } from '../src/lib/token.js';
import { createTestContext, registerUser, type TestContext } from './helpers.js';

let ctx: TestContext;
beforeAll(async () => {
  ctx = await createTestContext();
});
afterAll(async () => {
  await ctx.close();
});

describe('users', () => {
  it('PATCH /users/me updates name/photo and re-issues the token', async () => {
    const u = await registerUser(ctx.app);
    const res = await request(ctx.app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ name: 'Renamed', photoURL: 'https://cdn.example.com/me.png' });
    expect(res.status).toBe(200);
    expect(res.body.result.user).toMatchObject({
      id: u.id,
      name: 'Renamed',
      photoURL: 'https://cdn.example.com/me.png',
    });
    expect(verifyToken(res.body.result.token)).toMatchObject({ id: u.id, name: 'Renamed' });
  });

  it('PATCH /users/me validates input and requires auth', async () => {
    const u = await registerUser(ctx.app);
    const empty = await request(ctx.app).patch('/api/v1/users/me').set('Authorization', `Bearer ${u.token}`).send({});
    expect(empty.status).toBe(400);
    expect(empty.body.message).toBe('Nothing to update');

    const badName = await request(ctx.app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ name: 'x' });
    expect(badName.status).toBe(400);

    expect((await request(ctx.app).patch('/api/v1/users/me').send({ name: 'Nope' })).status).toBe(401);
  });

  it('GET /users/:id returns a public profile without email', async () => {
    const u = await registerUser(ctx.app);
    const res = await request(ctx.app).get(`/api/v1/users/${u.id}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toEqual({
      id: u.id,
      name: u.name,
      photoURL: expect.any(String),
      createdAt: expect.any(String),
    });
    expect((await request(ctx.app).get('/api/v1/users/999999')).status).toBe(404);
    expect((await request(ctx.app).get('/api/v1/users/not-an-id')).status).toBe(404);
  });
});
