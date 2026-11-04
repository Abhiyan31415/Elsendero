// Central place for backend URLs. Set these in frontend/.env.local (dev) or in the
// hosting provider's environment variables. NEXT_PUBLIC_* values are inlined at build
// time, so they must be referenced literally (no dynamic process.env[key] lookups).

/** Backend origin (API + Socket.IO), without trailing slash. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

/** Versioned REST base. */
export const API_BASE = `${API_URL}/api/v1`;

/** Socket.IO connects to the backend root. */
export const SOCKET_URL = API_URL;

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

/** Only needed when the backend is tunnelled through ngrok (skips its HTML interstitial). */
export const IS_NGROK = API_URL.includes('ngrok');
