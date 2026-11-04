import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** An error that is safe to show to the client with the given HTTP status. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Optional machine-readable code, e.g. EMAIL_NOT_VERIFIED. */
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message = 'Bad request') {
    return new AppError(400, message);
  }
  static unauthorized(message = 'Not authorized, please log in again') {
    return new AppError(401, message);
  }
  static forbidden(message = 'Forbidden', code?: string) {
    return new AppError(403, message, code);
  }
  static notFound(message = 'Not found') {
    return new AppError(404, message);
  }
  static conflict(message = 'Conflict') {
    return new AppError(409, message);
  }
}

/** Success envelope: `{ success: true, result }`. */
export function ok<T>(res: Response, result: T, status = 200): Response {
  return res.status(status).json({ success: true, result });
}

/** Error envelope: `{ success: false, message, code? }`. */
export function fail(res: Response, status: number, message: string, code?: string): Response {
  return res.status(status).json(code ? { success: false, message, code } : { success: false, message });
}

type AsyncFn<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/** Forwards async rejections to the error handler (Express 5 also does this; kept explicit). */
export function asyncHandler<Req extends Request = Request>(fn: AsyncFn<Req>): RequestHandler {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
}

/** Parses a positive integer route id; anything else is treated as not found. */
export function parseId(raw: unknown, what = 'Resource'): number {
  const s = typeof raw === 'string' ? raw : '';
  if (!/^[1-9]\d{0,9}$/.test(s) || Number(s) > 2_147_483_647) {
    throw AppError.notFound(`${what} not found`);
  }
  return Number(s);
}
