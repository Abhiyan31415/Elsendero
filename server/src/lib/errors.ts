import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError, fail } from './http.js';

/** Postgres error code, also when wrapped by drizzle (DrizzleQueryError.cause). */
export function pgErrorCode(err: unknown): string | undefined {
  for (let e: unknown = err, depth = 0; e && depth < 3; depth++) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) return code;
    e = (e as { cause?: unknown }).cause;
  }
  return undefined;
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  fail(res, 404, 'Route not found');
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) return fail(res, err.status, err.message, err.code);
  if (err instanceof ZodError) {
    return fail(res, 400, err.issues[0]?.message ?? 'Invalid request');
  }
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return fail(res, 413, 'File is too large (max 5MB)');
    return fail(res, 400, err.message);
  }
  // body-parser errors (malformed JSON, payload too large) carry a status/type.
  const status = (err as { status?: unknown }).status;
  const type = (err as { type?: unknown }).type;
  if (type === 'entity.parse.failed') return fail(res, 400, 'Malformed JSON body');
  if (type === 'entity.too.large') return fail(res, 413, 'Request body is too large');
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return fail(res, status, (err as Error).message || 'Bad request');
  }

  switch (pgErrorCode(err)) {
    case '23505':
      return fail(res, 409, 'Resource already exists');
    case '22P02':
    case '23502':
    case '23514':
      return fail(res, 400, 'Invalid request');
  }

  console.error('[error]', err);
  return fail(res, 500, 'Server error');
};
