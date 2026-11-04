import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let client: Redis | null | undefined;

/** Shared Redis client, or null when REDIS_URL is not set. */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  if (!env.REDIS_URL) {
    client = null;
    return client;
  }
  client = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 3 });
  client.on('error', (err: Error) => console.error('[redis]', err.message));
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit().catch(() => client?.disconnect());
  }
  client = undefined;
}
