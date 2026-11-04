import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSocketServer, type IO } from '../src/sockets/index.js';
import { createTestContext, registerUser, type TestContext } from './helpers.js';

let ctx: TestContext;
let server: http.Server;
let io: IO;
let url: string;
const clients: ClientSocket[] = [];

beforeAll(async () => {
  ctx = await createTestContext();
  server = http.createServer(ctx.app);
  io = createSocketServer(server, { db: ctx.db });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  for (const c of clients) c.disconnect();
  await new Promise<void>((resolve) => io.close(() => resolve()));
  await ctx.close();
});

async function connect(token?: string): Promise<ClientSocket> {
  const socket = ioClient(url, { transports: ['websocket'], auth: token ? { token } : {}, forceNew: true });
  clients.push(socket);
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve);
    socket.once('connect_error', reject);
  });
  return socket;
}

function next<T>(socket: ClientSocket, event: string, timeoutMs = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), timeoutMs);
    socket.once(event, (data: T) => {
      clearTimeout(t);
      resolve(data);
    });
  });
}

describe('socket chat', () => {
  it('rejects chat messages from anonymous sockets', async () => {
    const anon = await connect();
    anon.emit('join room', 'evt-sock');
    const err = next<string>(anon, 'error');
    anon.emit('chat message', { eventId: 'evt-sock', content: 'hi' });
    expect(await err).toBe('Not authorized, please log in again');
  });

  it('broadcasts an authenticated message to the room with the author from the token', async () => {
    const u = await registerUser(ctx.app, { name: 'Socket Sam' });
    const sender = await connect(u.token);
    const listener = await connect(); // anonymous sockets can still read

    sender.emit('join room', 'evt-sock');
    listener.emit('join room', 'evt-sock');
    // Give the joins a moment to register server-side.
    await new Promise((r) => setTimeout(r, 100));

    const received = next<Record<string, unknown>>(listener, 'chat message');
    sender.emit('chat message', { eventId: 'evt-sock', content: '  hello room  ', username: 'spoof', userId: '1' });
    const msg = await received;
    expect(msg).toMatchObject({ eventId: 'evt-sock', content: 'hello room', username: 'Socket Sam', userId: u.id });
    expect(msg.id).toEqual(expect.any(String));
  });

  it('validates message length', async () => {
    const u = await registerUser(ctx.app);
    const s = await connect(u.token);
    const err = next<string>(s, 'error');
    s.emit('chat message', { eventId: 'evt-sock', content: 'x'.repeat(2001) });
    expect(await err).toBe('Message must be between 1 and 2000 characters');
  });

  it('treats an invalid token as anonymous', async () => {
    const s = await connect('not-a-jwt');
    const err = next<string>(s, 'error');
    s.emit('chat message', { eventId: 'evt-sock', content: 'hi' });
    expect(await err).toBe('Not authorized, please log in again');
  });
});
