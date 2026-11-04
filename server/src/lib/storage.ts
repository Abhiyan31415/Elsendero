import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import type { Readable } from 'node:stream';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { Env } from '../config/env.js';
import { LEGACY_UPLOADS_DIR } from '../config/paths.js';

export interface StoredObject {
  body: Readable;
  contentType: string;
  contentLength?: number;
}

/** Object storage used for user media. Keys look like `uploads/<userId>/<uuid>.png`. */
export interface Storage {
  readonly driver: 'r2' | 'disk';
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Resolves to null when the object does not exist. */
  getObjectStream(key: string): Promise<StoredObject | null>;
  deleteObject(key: string): Promise<void>;
  /** Absolute URL clients can use to fetch the object. */
  publicUrl(key: string): string;
}

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export function contentTypeFor(key: string): string {
  return MIME_BY_EXT[path.extname(key).toLowerCase()] ?? 'application/octet-stream';
}

/** Rejects absolute paths, traversal segments and control characters. */
export function isSafeKey(key: string): boolean {
  if (!key || key.length > 1024 || key.startsWith('/') || key.includes('\\')) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(key)) return false;
  return key.split('/').every((seg) => seg !== '' && seg !== '.' && seg !== '..');
}

function assertSafeKey(key: string): void {
  if (!isSafeKey(key)) throw new Error(`Unsafe storage key: ${JSON.stringify(key)}`);
}

export function encodeKey(key: string): string {
  return key.split('/').map(encodeURIComponent).join('/');
}

function makePublicUrl(key: string, opts: { publicBase?: string; apiBase: string }): string {
  const encoded = encodeKey(key);
  return opts.publicBase ? `${opts.publicBase}/${encoded}` : `${opts.apiBase}/media/${encoded}`;
}

export class DiskStorage implements Storage {
  readonly driver = 'disk' as const;
  private readonly root: string;

  constructor(
    root: string,
    private readonly apiBase: string,
  ) {
    this.root = path.resolve(root);
  }

  private resolve(key: string): string {
    assertSafeKey(key);
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error('Storage key escapes root');
    return full;
  }

  async putObject(key: string, body: Buffer): Promise<void> {
    const file = this.resolve(key);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, body);
  }

  async getObjectStream(key: string): Promise<StoredObject | null> {
    const file = this.resolve(key);
    try {
      const stat = await fsp.stat(file);
      if (!stat.isFile()) return null;
      return {
        body: fs.createReadStream(file),
        contentType: contentTypeFor(key),
        contentLength: stat.size,
      };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await fsp.rm(this.resolve(key), { force: true });
  }

  publicUrl(key: string): string {
    return makePublicUrl(key, { apiBase: this.apiBase });
  }
}

export class R2Storage implements Storage {
  readonly driver = 'r2' as const;
  private readonly client: S3Client;

  constructor(
    private readonly opts: {
      endpoint: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      publicBase?: string;
      apiBase: string;
    },
  ) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: opts.endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId: opts.accessKeyId, secretAccessKey: opts.secretAccessKey },
    });
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    assertSafeKey(key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.opts.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  }

  async getObjectStream(key: string): Promise<StoredObject | null> {
    assertSafeKey(key);
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.opts.bucket, Key: key }));
      if (!res.Body) return null;
      return {
        body: res.Body as Readable,
        contentType: res.ContentType ?? contentTypeFor(key),
        contentLength: res.ContentLength,
      };
    } catch (err) {
      const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (e.name === 'NoSuchKey' || e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    assertSafeKey(key);
    await this.client.send(new DeleteObjectCommand({ Bucket: this.opts.bucket, Key: key }));
  }

  publicUrl(key: string): string {
    return makePublicUrl(key, { publicBase: this.opts.publicBase, apiBase: this.opts.apiBase });
  }
}

/** R2 when both keys are configured, otherwise local disk (env.ts forbids that in production). */
export function createStorage(env: Env): Storage {
  if (env.STORAGE_DRIVER === 'r2' && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY) {
    return new R2Storage({
      endpoint: env.R2_ENDPOINT,
      bucket: env.R2_BUCKET,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      publicBase: env.R2_PUBLIC_URL,
      apiBase: env.PUBLIC_API_URL,
    });
  }
  const root = env.LOCAL_STORAGE_DIR ? path.resolve(env.LOCAL_STORAGE_DIR) : LEGACY_UPLOADS_DIR;
  if (env.NODE_ENV === 'development') {
    console.warn(
      `[storage] R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY not set; storing uploads on local disk at ${root}`,
    );
  }
  return new DiskStorage(root, env.PUBLIC_API_URL);
}
