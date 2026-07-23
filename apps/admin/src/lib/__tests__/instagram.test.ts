/**
 * @file instagram.test.ts
 * Unit tests for Instagram URL parsing utilities.
 */

import { describe, expect, it } from 'vitest';

import { detectSource, displayVideoUrl, extractIgId, reconstructIgUrl } from '@/lib/instagram';

describe('extractIgId', () => {
  it('extracts ID from a standard post URL', () => {
    expect(extractIgId('https://www.instagram.com/p/ABC123xyz/')).toBe('ABC123xyz');
  });

  it('extracts ID from a reel URL', () => {
    expect(extractIgId('https://www.instagram.com/reel/DEF456abc/')).toBe('DEF456abc');
  });

  it('extracts ID from a reels URL (plural)', () => {
    expect(extractIgId('https://www.instagram.com/reels/GHI789mno/')).toBe('GHI789mno');
  });

  it('extracts ID from a URL without www prefix', () => {
    expect(extractIgId('https://instagram.com/p/JKL012pqr/')).toBe('JKL012pqr');
  });

  it('extracts IDs with hyphens and underscores', () => {
    expect(extractIgId('https://www.instagram.com/p/AbC-123_xyZ/')).toBe('AbC-123_xyZ');
  });

  it('returns null for non-Instagram URLs', () => {
    expect(extractIgId('https://youtube.com/watch?v=12345')).toBeNull();
  });

  it('returns null for Instagram profile URLs', () => {
    expect(extractIgId('https://www.instagram.com/username/')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractIgId('')).toBeNull();
  });

  it('returns null for malformed Instagram URLs', () => {
    expect(extractIgId('https://www.instagram.com/p/')).toBeNull();
  });
});

describe('detectSource', () => {
  it('detects youtube from youtube.com', () => {
    expect(detectSource('https://www.youtube.com/watch?v=abc123')).toBe('youtube');
  });

  it('detects youtube from youtu.be', () => {
    expect(detectSource('https://youtu.be/abc123')).toBe('youtube');
  });

  it('detects instagram from instagram.com/p/ URL', () => {
    expect(detectSource('https://www.instagram.com/p/ABC123/')).toBe('instagram');
  });

  it('detects instagram from instagram.com/reel/ URL', () => {
    expect(detectSource('https://www.instagram.com/reel/DEF456/')).toBe('instagram');
  });

  it('defaults to instagram for unknown URLs', () => {
    expect(detectSource('https://example.com/video')).toBe('instagram');
  });
});

describe('displayVideoUrl', () => {
  it('returns ig_url for youtube source', () => {
    const result = displayVideoUrl({
      src: 'youtube',
      ig_url: 'https://youtu.be/abc123',
    });
    expect(result).toBe('https://youtu.be/abc123');
  });

  it('returns empty string for youtube source without ig_url', () => {
    const result = displayVideoUrl({ src: 'youtube' });
    expect(result).toBe('');
  });

  it('reconstructs Instagram URL from ig_id', () => {
    const result = displayVideoUrl({
      src: 'instagram',
      ig_id: 'ABC123xyz',
    });
    expect(result).toBe('https://www.instagram.com/p/ABC123xyz/');
  });

  it('falls back to ig_url when no ig_id', () => {
    const result = displayVideoUrl({
      src: 'instagram',
      ig_id: null,
      ig_url: 'https://www.instagram.com/p/ABC123xyz/',
    });
    expect(result).toBe('https://www.instagram.com/p/ABC123xyz/');
  });

  it('returns empty string when neither ig_id nor ig_url', () => {
    const result = displayVideoUrl({ src: 'instagram' });
    expect(result).toBe('');
  });

  it('prefers ig_id over ig_url for instagram source', () => {
    const result = displayVideoUrl({
      src: 'instagram',
      ig_id: 'ID_FROM_ID',
      ig_url: 'https://www.instagram.com/p/ID_FROM_URL/',
    });
    expect(result).toBe('https://www.instagram.com/p/ID_FROM_ID/');
  });
});

describe('reconstructIgUrl', () => {
  it('builds a full Instagram post URL from a media ID', () => {
    expect(reconstructIgUrl('ABC123xyz')).toBe('https://www.instagram.com/p/ABC123xyz/');
  });

  it('handles IDs with special characters', () => {
    expect(reconstructIgUrl('AbC-123_xyZ')).toBe('https://www.instagram.com/p/AbC-123_xyZ/');
  });
});
