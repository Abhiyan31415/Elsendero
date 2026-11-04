import { API_URL } from '../config';
import toImageUrl from '../utils/imageUrl';

const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem('currentUser'))?.token || '';
  } catch {
    return '';
  }
};

// Uploads an image to the backend (POST /upload) and returns its absolute URL.
// `filePath` is kept for backwards compatibility with existing callers; the server
// chooses the stored filename.
const uploadFile = async (file, filePath) => {
  const formData = new FormData();
  formData.append('image', file);
  if (filePath) formData.append('filePath', filePath);

  const token = getToken();
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON response
  }

  if (!response.ok || !data?.filePath) {
    throw new Error(data?.message || 'Failed to upload file');
  }

  return toImageUrl(data.filePath);
};

export default uploadFile;
