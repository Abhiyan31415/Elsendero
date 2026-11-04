import { API_BASE } from '@/config';
import type { Dispatch } from '@/context/state';
import type { UploadResult } from '@/types';
import fetchData from './utils/fetchData';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_MB = 5;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

/** Returns an error message, or '' if the file can be uploaded. */
export const checkImageFile = (file: File): string => {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'Only JPEG, PNG or WebP images are allowed';
  }
  if (file.size > MAX_IMAGE_BYTES) return `Image must be under ${MAX_IMAGE_MB} MB`;
  return '';
};

/** POST /uploads (multipart field `image`). Returns the absolute URL, or null on failure. */
export const uploadImage = async (file: File, token: string, dispatch: Dispatch): Promise<string | null> => {
  const body = new FormData();
  body.append('image', file);
  const result = await fetchData<UploadResult>({ url: `${API_BASE}/uploads`, body, token }, dispatch);
  return result?.url ?? null;
};
