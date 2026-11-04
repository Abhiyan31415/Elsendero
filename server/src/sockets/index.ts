import type { Server as HttpServer } from 'node:http';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { getRedis } from '../lib/redis.js';
import { extractBearer, verifyToken } from '../lib/token.js';
import { registerChat } from './chat.js';
import type { IO, SocketDeps, SocketHandler } from './types.js';

export type { IO, AppSocket, SocketDeps, SocketHandler } from './types.js';

/**
 * Socket handler files. To add one, create src/sockets/<name>.ts exporting a
 * SocketHandler and add ONE line here.
 */
const handlers: SocketHandler[] = [
  registerChat,
];

export function createSocketServer(httpServer: HttpServer, deps: SocketDeps): IO {
  const io: IO = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGINS,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      credentials: true,
    },
    maxHttpBufferSize: 1e5,
  });

  const redis = getRedis();
  if (redis) {
    // Share rooms/broadcasts across multiple server instances.
    io.adapter(createAdapter(redis.duplicate(), redis.duplicate()));
  }

  // Optional auth: valid handshake.auth.token → socket.data.user; otherwise anonymous (read-only).
  io.use((socket, next) => {
    socket.data.user = null;
    const auth = socket.handshake.auth as { token?: unknown } | undefined;
    const token = extractBearer(auth?.token);
    if (token) {
      try {
        socket.data.user = verifyToken(token);
      } catch {
        socket.data.user = null;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    for (const register of handlers) register(io, socket, deps);
  });

  return io;
}
