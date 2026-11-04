import dotenv from 'dotenv';
import { z } from 'zod';

// Real environment variables always win over server/.env.
if (process.env.NODE_ENV !== 'test') dotenv.config({ quiet: true });

const DEFAULT_ORIGINS = 'http://localhost:3000,http://localhost:5173';

const bool = z
  .enum(['true', 'false', '1', '0', 'yes', 'no'])
  .transform((v) => v === 'true' || v === '1' || v === 'yes');

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const stripSlash = (v: string) => v.replace(/\/+$/, '');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),

  DATABASE_URL: z.string({ error: 'DATABASE_URL is required' }).min(1, 'DATABASE_URL is required'),
  DATABASE_SSL: bool.optional(),

  JWT_SECRET: z.string({ error: 'JWT_SECRET is required' }).min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CLIENT_URL: optionalString,
  /** @deprecated legacy name from the pre-v1 server; appended to CLIENT_URL. */
  EXTRA_ORIGINS: optionalString,
  PUBLIC_API_URL: optionalString,
  /** @deprecated legacy name for PUBLIC_API_URL. */
  PUBLIC_URL: optionalString,

  R2_ENDPOINT: z.url().default('https://cef3bc5e60493c2cde2fa645dac8c39f.r2.cloudflarestorage.com'),
  R2_BUCKET: z.string().min(1).default('gantabya'),
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_PUBLIC_URL: optionalString.pipe(z.url().optional()),

  LOCAL_STORAGE_DIR: optionalString,
  REDIS_URL: optionalString,

  RESEND_API_KEY: optionalString,
  EMAIL_FROM: z.string().trim().min(1).default('Gantabya <onboarding@resend.dev>'),
  /** Frontend base URL used in email links. Defaults to the first CLIENT_URL origin. */
  APP_URL: optionalString,
});

export type Env = Omit<
  z.infer<typeof schema>,
  'DATABASE_SSL' | 'CLIENT_URL' | 'EXTRA_ORIGINS' | 'PUBLIC_API_URL' | 'PUBLIC_URL' | 'APP_URL'
> & {
  /** Frontend base URL for links in emails, no trailing slash. */
  APP_URL: string;
  DATABASE_SSL: boolean;
  /** Allowed browser origins (CORS + Socket.io). */
  CLIENT_ORIGINS: string[];
  /** Absolute base URL of this API, no trailing slash. */
  PUBLIC_API_URL: string;
  /** 'r2' when both R2 keys are set, otherwise local disk (never in production). */
  STORAGE_DRIVER: 'r2' | 'disk';
};

export class EnvError extends Error {}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
    throw new EnvError(`Invalid environment configuration:\n${lines.join('\n')}`);
  }
  const e = parsed.data;
  const isProd = e.NODE_ENV === 'production';

  const hasKey = Boolean(e.R2_ACCESS_KEY_ID);
  const hasSecret = Boolean(e.R2_SECRET_ACCESS_KEY);
  if (hasKey !== hasSecret) {
    throw new EnvError(
      'Invalid environment configuration:\n  - R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be set together',
    );
  }
  if (isProd && !e.RESEND_API_KEY) {
    throw new EnvError('Invalid environment configuration:\n  - RESEND_API_KEY is required in production');
  }
  if (isProd && !hasKey) {
    throw new EnvError(
      'Invalid environment configuration:\n  - R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY are required in production',
    );
  }

  const origins = (e.CLIENT_URL ?? DEFAULT_ORIGINS)
    .split(',')
    .concat(e.EXTRA_ORIGINS ? e.EXTRA_ORIGINS.split(',') : [])
    .map((o) => stripSlash(o.trim()))
    .filter(Boolean);

  return {
    NODE_ENV: e.NODE_ENV,
    HOST: e.HOST,
    PORT: e.PORT,
    DATABASE_URL: e.DATABASE_URL,
    DATABASE_SSL: e.DATABASE_SSL ?? isProd,
    JWT_SECRET: e.JWT_SECRET,
    JWT_EXPIRES_IN: e.JWT_EXPIRES_IN,
    CLIENT_ORIGINS: [...new Set(origins)],
    PUBLIC_API_URL: stripSlash(e.PUBLIC_API_URL ?? e.PUBLIC_URL ?? `http://localhost:${e.PORT}`),
    R2_ENDPOINT: stripSlash(e.R2_ENDPOINT),
    R2_BUCKET: e.R2_BUCKET,
    R2_ACCESS_KEY_ID: e.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: e.R2_SECRET_ACCESS_KEY,
    R2_PUBLIC_URL: e.R2_PUBLIC_URL ? stripSlash(e.R2_PUBLIC_URL) : undefined,
    LOCAL_STORAGE_DIR: e.LOCAL_STORAGE_DIR,
    REDIS_URL: e.REDIS_URL,
    RESEND_API_KEY: e.RESEND_API_KEY,
    EMAIL_FROM: e.EMAIL_FROM,
    APP_URL: stripSlash(e.APP_URL ?? origins[0] ?? 'http://localhost:3000'),
    STORAGE_DRIVER: hasKey ? 'r2' : 'disk',
  };
}

function loadOrExit(): Env {
  try {
    const env = loadEnv();
    if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) {
      console.warn('[env] JWT_SECRET is shorter than 32 characters; use a long random string.');
    }
    return env;
  } catch (err) {
    if (err instanceof EnvError) {
      console.error(`FATAL: ${err.message}\nSee server/.env.example for every variable.`);
      process.exit(1);
    }
    throw err;
  }
}

export const env: Env = loadOrExit();
