import 'server-only';
import { cache } from 'react';
import { API_BASE } from '@/config';
import type { ApiResponse, Trail } from '@/types';
import { unwrapOne } from '@/actions/utils/unwrap';

export type TrailLookup =
  | { status: 'ok'; trail: Trail }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

/**
 * Server-side fetch of one trail, cached for 60s (ISR). Never throws: a missing trail
 * yields 'not-found', and an unreachable/broken backend yields 'error' so the page can
 * render a friendly message instead of crashing the request.
 * Wrapped in React `cache` so generateMetadata and the page share one request.
 */
export const getTrail = cache(async (id: string): Promise<TrailLookup> => {
  // Ids are opaque, but reject obviously bogus values without hitting the backend.
  if (!id || id.length > 100 || !/^[\w-]+$/.test(id)) return { status: 'not-found' };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/trails/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.error(`[trail ${id}] backend unreachable:`, error);
    return { status: 'error', message: "We couldn't reach the server. Please try again in a moment." };
  }

  if (res.status === 404 || res.status === 400) return { status: 'not-found' };

  let data: ApiResponse<unknown> | null = null;
  try {
    data = (await res.json()) as ApiResponse<unknown>;
  } catch {
    data = null;
  }

  if (!res.ok || !data || data.success !== true) {
    return { status: 'error', message: 'The server ran into a problem loading this trail.' };
  }
  const trail = unwrapOne<Trail>(data.result, 'trail');
  return trail ? { status: 'ok', trail } : { status: 'not-found' };
});
