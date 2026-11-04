import { describe, expect, it } from 'vitest';
import { API_URL } from '@/config';
import { toImageUrl, trailImages } from './imageUrl';

describe('toImageUrl', () => {
  it('prefixes relative upload paths with the API URL', () => {
    expect(toImageUrl('/uploads/a.jpg')).toBe(`${API_URL}/uploads/a.jpg`);
    expect(toImageUrl('uploads/a.jpg')).toBe(`${API_URL}/uploads/a.jpg`);
  });

  it('leaves absolute, blob and data URLs unchanged', () => {
    for (const url of [
      'https://pub-123.r2.dev/trails/a.webp',
      'http://example.com/a.png',
      'blob:http://localhost/abc',
      'data:image/png;base64,AAAA',
    ]) {
      expect(toImageUrl(url)).toBe(url);
    }
  });

  it('returns undefined for empty values', () => {
    expect(toImageUrl('')).toBeUndefined();
    expect(toImageUrl(null)).toBeUndefined();
    expect(toImageUrl(undefined)).toBeUndefined();
  });
});

describe('trailImages', () => {
  it('flattens legacy nested arrays and resolves each URL', () => {
    expect(trailImages([['/uploads/a.jpg'], 'https://x.r2.dev/b.jpg', '', null])).toEqual([
      `${API_URL}/uploads/a.jpg`,
      'https://x.r2.dev/b.jpg',
    ]);
  });
  it('tolerates non-arrays', () => {
    expect(trailImages(undefined)).toEqual([]);
  });
});
