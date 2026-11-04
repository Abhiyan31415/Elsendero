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

const trailBody = {
  title: 'Nagarkot sunrise',
  description: 'Drive up for the sunrise.',
  sloc: [85.324, 27.7172],
  floc: [85.5206, 27.7154],
  checkp: [[85.4298, 27.671, 'Bhaktapur']],
  price: 1500,
  images: [['https://example.com/a.jpg'], 'https://example.com/b.jpg'],
};

describe('trails', () => {
  it('POST /trails requires auth', async () => {
    const res = await request(ctx.app).post('/api/v1/trails').send(trailBody);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('creates, lists and gets trails; creator comes from the token', async () => {
    const u = await registerUser(ctx.app, { name: 'Trail Maker' });
    const created = await request(ctx.app)
      .post('/api/v1/trails')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ ...trailBody, uid: 'spoofed', uName: 'Spoofed', currentUser: { id: 'x' } });
    expect(created.status).toBe(201);
    const trail = created.body.result;
    expect(trail).toMatchObject({
      id: expect.any(String),
      title: 'Nagarkot sunrise',
      sloc: [85.324, 27.7172],
      price: 1500,
      images: [['https://example.com/a.jpg'], ['https://example.com/b.jpg']],
      uid: u.id,
      uName: 'Trail Maker',
    });

    const list = await request(ctx.app).get('/api/v1/trails');
    expect(list.status).toBe(200);
    expect(list.body.success).toBe(true);
    expect(list.body.result.map((t: { id: string }) => t.id)).toContain(trail.id);

    const one = await request(ctx.app).get(`/api/v1/trails/${trail.id}`);
    expect(one.status).toBe(200);
    expect(one.body.result.id).toBe(trail.id);
  });

  it('GET /trails/:id is 404 for missing or invalid ids', async () => {
    expect((await request(ctx.app).get('/api/v1/trails/999999')).status).toBe(404);
    expect((await request(ctx.app).get('/api/v1/trails/abc')).status).toBe(404);
  });

  it('validates trail input', async () => {
    const u = await registerUser(ctx.app);
    const res = await request(ctx.app)
      .post('/api/v1/trails')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ ...trailBody, title: '' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: 'Title is required' });
  });

  it('POST /rooms is an authenticated alias for creating a trail', async () => {
    expect((await request(ctx.app).post('/api/v1/rooms').send(trailBody)).status).toBe(401);
    const u = await registerUser(ctx.app);
    const res = await request(ctx.app).post('/api/v1/rooms').set('Authorization', `Bearer ${u.token}`).send(trailBody);
    expect(res.status).toBe(201);
    expect(res.body.result.uid).toBe(u.id);
  });
});

describe('events & messages', () => {
  it('creates and lists events (auth required to create)', async () => {
    const body = {
      title: 'Weekend trip',
      description: 'Leaving at 5',
      from: '2030-01-01T05:00:00.000Z',
      to: '2030-01-02T18:00:00.000Z',
      location: 'Nagarkot',
      participants: ['A', ' ', 'B'],
    };
    expect((await request(ctx.app).post('/api/v1/events').send(body)).status).toBe(401);
    const u = await registerUser(ctx.app);
    const res = await request(ctx.app).post('/api/v1/events').set('Authorization', `Bearer ${u.token}`).send(body);
    expect(res.status).toBe(201);
    expect(res.body.result).toMatchObject({ title: 'Weekend trip', participants: ['A', 'B'], createdBy: u.id });

    const bad = await request(ctx.app)
      .post('/api/v1/events')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ ...body, to: '2029-01-01T00:00:00.000Z' });
    expect(bad.status).toBe(400);
    expect(bad.body.message).toBe('End date must be after start date');

    const list = await request(ctx.app).get('/api/v1/events');
    expect(list.status).toBe(200);
    expect(list.body.result.length).toBeGreaterThan(0);
  });

  it('posts and lists messages oldest-first', async () => {
    const u = await registerUser(ctx.app, { name: 'Chatter' });
    for (const content of ['one', 'two', 'three']) {
      const res = await request(ctx.app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${u.token}`)
        .send({ eventId: 'evt-1', content, username: 'spoofed' });
      expect(res.status).toBe(201);
      expect(res.body.result).toMatchObject({ username: 'Chatter', userId: u.id });
    }
    const list = await request(ctx.app).get('/api/v1/messages').query({ eventId: 'evt-1' });
    expect(list.status).toBe(200);
    expect(list.body.result.map((m: { content: string }) => m.content)).toEqual(['one', 'two', 'three']);

    expect((await request(ctx.app).get('/api/v1/messages')).status).toBe(400);
  });
});
