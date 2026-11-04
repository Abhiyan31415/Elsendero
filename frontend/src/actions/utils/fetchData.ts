import { IS_NGROK } from '@/config';
import type { Dispatch } from '@/context/state';

export const NETWORK_ERROR_MESSAGE = "Can't reach the server. Please check your connection and try again.";
export const SESSION_EXPIRED_MESSAGE = 'Session expired, please log in again';

// Endpoints where a 401 means "bad credentials", not "expired session".
const AUTH_ENDPOINT_RE = /\/auth\/(login|register|google)\/?$/;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export interface FetchOptions {
  url: string;
  /** Defaults to POST (GET/HEAD never send a body). */
  method?: HttpMethod;
  /** Adds `Authorization: Bearer <token>`. */
  token?: string | null;
  /** JSON-serialisable payload, or FormData for multipart uploads. */
  body?: unknown;
  /** Don't show an alert when the server can't be reached. */
  silentNetworkError?: boolean;
  /**
   * Called with the server's error `code` (e.g. EMAIL_NOT_VERIFIED).
   * Return true to handle it yourself and skip the error alert.
   */
  onErrorCode?: (code: string) => boolean;
}

const pathnameOf = (url: string): string => {
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    return new URL(url, base).pathname;
  } catch {
    return url;
  }
};

/**
 * Small fetch wrapper used by all client actions.
 * Returns `data.result` on success, or `null` on any failure (after showing an alert).
 * A 401 on an authenticated, non-login request logs the user out.
 */
const fetchData = async <T>(
  { url, method = 'POST', token = '', body = null, silentNetworkError = false, onErrorCode }: FetchOptions,
  dispatch: Dispatch,
): Promise<T | null> => {
  const canHaveBody = body !== null && body !== undefined && method !== 'GET' && method !== 'HEAD';
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {
    ...(IS_NGROK ? { 'ngrok-skip-browser-warning': 'true' } : {}),
    ...(canHaveBody && !isForm ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const showError = (message: string) =>
    dispatch({ type: 'UPDATE_ALERT', payload: { open: true, message, severity: 'error' } });

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      ...(canHaveBody ? { body: isForm ? (body as FormData) : JSON.stringify(body) } : {}),
    });
  } catch (error) {
    console.error(error);
    if (!silentNetworkError) showError(NETWORK_ERROR_MESSAGE);
    return null;
  }

  let data: { success?: boolean; result?: T; message?: string; code?: string } | null = null;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null; // non-JSON response (HTML error page, proxy error...)
  }

  const isAuthEndpoint = AUTH_ENDPOINT_RE.test(pathnameOf(url));

  if (response.status === 401 && token && !isAuthEndpoint) {
    dispatch({ type: 'LOGOUT' });
    dispatch({
      type: 'UPDATE_ALERT',
      payload: { open: true, message: SESSION_EXPIRED_MESSAGE, severity: 'warning' },
    });
    return null;
  }

  if (!response.ok || !data || data.success === false) {
    if (data?.code && onErrorCode?.(data.code)) return null;
    let message = data?.message;
    if (!message) {
      if (response.status >= 500 || response.status === 0) {
        message = 'The server ran into a problem. Please try again later.';
      } else if (!data) {
        message = response.ok ? 'Unexpected response from the server.' : `Request failed (${response.status}).`;
      } else {
        message = `Request failed (${response.status}).`;
      }
    }
    showError(message);
    return null;
  }

  return data.result ?? null;
};

export default fetchData;
