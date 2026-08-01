/**
 * @file instagram.test.ts
 * Unit tests for Instagram URL parsing utilities.
 */

import { describe, expect, it } from 'vitest';

import { detectSource, displayVideoUrl, extractIgId, normalizeIgUrl, reconstructIgUrl } from '@/lib/utils';

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
  it('returns video_url for youtube source', () => {
    const result = displayVideoUrl({ video_src: 'youtube', video_url: 'https://youtu.be/abc123' });
    expect(result).toBe('https://youtu.be/abc123');
  });

  it('returns empty string for youtube source without video_url', () => {
    const result = displayVideoUrl({ video_src: 'youtube' });
    expect(result).toBe('');
  });

  it('reconstructs Instagram URL from video_id', () => {
    const result = displayVideoUrl({ video_src: 'instagram', video_id: 'ABC123xyz' });
    expect(result).toBe('https://www.instagram.com/p/ABC123xyz/');
  });

  it('falls back to video_url when no video_id', () => {
    const result = displayVideoUrl({
      video_src: 'instagram',
      video_id: null,
      video_url: 'https://www.instagram.com/p/ABC123xyz/',
    });
    expect(result).toBe('https://www.instagram.com/p/ABC123xyz/');
  });

  it('returns empty string when neither video_id nor video_url', () => {
    const result = displayVideoUrl({ video_src: 'instagram' });
    expect(result).toBe('');
  });

  it('prefers video_id over video_url for instagram source', () => {
    const result = displayVideoUrl({
      video_src: 'instagram',
      video_id: 'ID_FROM_ID',
      video_url: 'https://www.instagram.com/p/ID_FROM_URL/',
    });
    expect(result).toBe('https://www.instagram.com/p/ID_FROM_ID/');
  });
});

describe('normalizeIgUrl', () => {
  it('strips www prefix and lowercases the hostname', () => {
    expect(normalizeIgUrl('https://www.Instagram.com/p/ABC123xyz/')).toBe('https://instagram.com/p/ABC123xyz/');
  });

  it('strips query parameters and hash fragments', () => {
    expect(normalizeIgUrl('https://www.instagram.com/p/ABC123xyz/?utm_source=ig_web_copy_link#top')).toBe(
      'https://instagram.com/p/ABC123xyz/'
    );
  });

  it('ensures a single trailing slash on the path', () => {
    expect(normalizeIgUrl('https://www.instagram.com/p/ABC123xyz')).toBe('https://instagram.com/p/ABC123xyz/');
    expect(normalizeIgUrl('https://www.instagram.com/p/ABC123xyz///')).toBe('https://instagram.com/p/ABC123xyz/');
  });

  it('normalizes reel and reels URLs', () => {
    expect(normalizeIgUrl('https://www.instagram.com/reel/DEF456abc/')).toBe('https://instagram.com/reel/DEF456abc/');
    expect(normalizeIgUrl('https://www.instagram.com/reels/GHI789mno/')).toBe('https://instagram.com/reels/GHI789mno/');
  });

  it('returns the original string for invalid URLs', () => {
    expect(normalizeIgUrl('not-a-url')).toBe('not-a-url');
  });

  it('handles the bare domain path', () => {
    expect(normalizeIgUrl('https://www.instagram.com/')).toBe('https://instagram.com/');
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
