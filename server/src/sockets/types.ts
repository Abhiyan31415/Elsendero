import type { DefaultEventsMap, Server, Socket } from 'socket.io';
import type { Db } from '../db/client.js';
import type { AuthUser } from '../lib/token.js';

export interface SocketData {
  /** Set from handshake.auth.token; null for anonymous (read-only) sockets. */
  user: AuthUser | null;
}

export type IO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;
export type AppSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

export interface SocketDeps {
  db: Db;
}

/** A socket handler file exports one of these; it is called once per connection. */
export type SocketHandler = (io: IO, socket: AppSocket, deps: SocketDeps) => void;
