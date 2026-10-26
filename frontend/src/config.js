// Backend address. Override with VITE_API_URL in a .env file for local dev
// (e.g. VITE_API_URL=http://localhost:5000).
export const API_URL = (import.meta.env.VITE_API_URL || 'https://api.abhiyankhanal1.com.np').replace(/\/$/, '');
