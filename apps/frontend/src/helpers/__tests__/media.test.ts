import { describe, expect, it } from 'vitest';

import { getThumbnailSrc } from '@/helpers/media';

describe('getThumbnailSrc', () => {
  it('returns the thumbnail URL when provided', () => {
    expect(getThumbnailSrc('https://example.com/thumb.jpg')).toBe('https://example.com/thumb.jpg');
  });

  it('returns default fallback when thumbnail is null', () => {
    expect(getThumbnailSrc(null)).toBe('/sample.svg');
  });

  it('returns default fallback when thumbnail is undefined', () => {
    expect(getThumbnailSrc(undefined)).toBe('/sample.svg');
  });

  it('returns default fallback when thumbnail is empty string', () => {
    expect(getThumbnailSrc('')).toBe('/sample.svg');
  });

  it('returns custom fallback when provided and thumbnail is null', () => {
    expect(getThumbnailSrc(null, '/custom-placeholder.png')).toBe('/custom-placeholder.png');
  });

  it('returns custom fallback when provided and thumbnail is empty', () => {
    expect(getThumbnailSrc('', '/fallback.jpg')).toBe('/fallback.jpg');
  });

  it('returns thumbnail even when custom fallback is provided', () => {
    expect(getThumbnailSrc('https://example.com/thumb.jpg', '/fallback.jpg')).toBe('https://example.com/thumb.jpg');
  });
});
