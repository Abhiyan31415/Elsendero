// Central place for backend URLs. Set VITE_API_URL in frontend/.env (dev) or
// in the Netlify site environment variables (production).
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// Socket.io connects to the same backend host.
export const SOCKET_URL = API_URL;

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
