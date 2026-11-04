import { API_URL } from '../config';

// Turn a backend-relative path like "/uploads/abc.jpg" into an absolute URL on the
// API host. Absolute (http/https), blob: and data: URLs are returned unchanged.
export const toImageUrl = (path) => {
  if (!path || typeof path !== 'string') return path;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Trail images are stored as [[String]] on the server; flatten to a simple list of URLs.
export const trailImages = (images) =>
  (Array.isArray(images) ? images.flat(Infinity) : []).filter(Boolean).map(toImageUrl);

export default toImageUrl;
