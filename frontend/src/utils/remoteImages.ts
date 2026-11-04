import { API_URL } from '@/config';

/** Hosts next/image may optimise. Keep in sync with `images.remotePatterns` in next.config.ts. */
export const OPTIMIZABLE_HOST_SUFFIXES = ['.r2.dev', '.r2.cloudflarestorage.com'] as const;
export const OPTIMIZABLE_HOSTS = ['api.mapbox.com'] as const;

const apiHost = (() => {
  try {
    return new URL(API_URL).hostname;
  } catch {
    return '';
  }
})();

/**
 * True when `url` is on a host configured for next/image. Anything else (e.g. legacy
 * Firebase URLs) must be rendered with a plain <img>, or next/image would throw.
 */
export const isOptimizableImage = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'https:' && protocol !== 'http:') return false;
    return (
      hostname === apiHost ||
      (OPTIMIZABLE_HOSTS as readonly string[]).includes(hostname) ||
      OPTIMIZABLE_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
};
