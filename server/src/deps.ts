import type { Db } from './db/client.js';
import type { Mailer } from './lib/mailer.js';
import type { Storage } from './lib/storage.js';

/** Everything a module needs at runtime. Injected so tests can swap implementations. */
export interface AppDeps {
  db: Db;
  storage: Storage;
  mailer: Mailer;
}
