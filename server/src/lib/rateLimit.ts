import { rateLimit, type RateLimitRequestHandler } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { env } from '../config/env.js';
import { getRedis } from './redis.js';

export interface RateLimitOptions {
  /** Unique name; used as the Redis key prefix. */
  name: string;
  windowMs: number;
  limit: number;
  message?: string;
}

/**
 * express-rate-limit middleware. Uses a Redis store when REDIS_URL is set
 * (shared across instances), in-memory otherwise. Disabled in tests.
 */
export function createRateLimiter(opts: RateLimitOptions): RateLimitRequestHandler {
  const redis = getRedis();
  return rateLimit({
    windowMs: opts.windowMs,
    limit: opts.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    message: { success: false, message: opts.message ?? 'Too many requests, please try again later' },
    store: redis
      ? new RedisStore({
          prefix: `rl:${opts.name}:`,
          sendCommand: (command: string, ...args: string[]) =>
            redis.call(command, ...args) as Promise<RedisReply>,
        })
      : undefined,
  });
}
