import { API_URL } from '@/config';

/**
 * Turn a backend-relative path like "/uploads/abc.jpg" into an absolute URL on the
 * API host. Absolute (http/https, protocol-relative), blob: and data: URLs are returned unchanged.
 */
export function toImageUrl(path: string): string;
export function toImageUrl(path: string | null | undefined): string | undefined;
export function toImageUrl(path: string | null | undefined): string | undefined {
  if (!path || typeof path !== 'string') return undefined;
  if (/^(https?:|blob:|data:|\/\/)/i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Trail images may be stored nested (legacy [[String]]); flatten to a list of absolute URLs. */
export const trailImages = (images: unknown): string[] =>
  (Array.isArray(images) ? (images.flat(Infinity) as unknown[]) : [])
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .map((x) => toImageUrl(x));

export default toImageUrl;
