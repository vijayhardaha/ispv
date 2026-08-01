/**
 * @file auth-submit-views.test.ts
 * Tests for the authenticated submit and views endpoints.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST as submitPost } from '@/app/api/auth/submit/route';
import { POST as viewsPost } from '@/app/api/auth/views/route';

// ─── Shared Mocks ──────────────────────────────────────────────────────────

const mockRpc = vi.fn();
const mockGetUser = vi.fn();

const mockSupabase = { auth: { getUser: mockGetUser }, from: vi.fn(), rpc: mockRpc };

vi.mock('@/lib/db/supabase-server', () => ({ createServerSupabase: vi.fn(async () => mockSupabase) }));

// ─── Submit Tests ──────────────────────────────────────────────────────────

describe('POST /api/auth/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
  });

  function makeRequest(body: unknown): Request {
    return new Request('http://localhost:3001/api/auth/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('rejects requests with missing video_url', async () => {
    const res = await submitPost(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it('rejects non-Instagram URLs', async () => {
    const res = await submitPost(makeRequest({ video_url: 'https://example.com/video' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid instagram url/i);
  });

  it('submits a video with full metadata', async () => {
    mockRpc.mockResolvedValue({ data: { id: 'new-vid' }, error: null });

    const res = await submitPost(
      makeRequest({
        video_url: 'https://www.instagram.com/reel/ABC123xyz/',
        tags: ['protest', 'delhi'],
        category: 'protest-marches',
        location: 'delhi',
        city: 'New Delhi',
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('new-vid');

    expect(mockRpc).toHaveBeenCalledWith('submit_video', {
      p_video_url: 'https://www.instagram.com/reel/ABC123xyz/',
      p_video_id: 'ABC123xyz',
      p_video_src: 'instagram',
      p_tags: ['protest', 'delhi'],
      p_category: 'protest-marches',
      p_categories: null,
      p_location: 'delhi',
      p_city: 'New Delhi',
    });
  });

  it('submits a video with multiple categories', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await submitPost(
      makeRequest({
        video_url: 'https://www.instagram.com/reel/ABC123xyz/',
        categories: ['protest-marches', 'police-conduct', 'gen-z-moments'],
      })
    );
    expect(res.status).toBe(200);

    expect(mockRpc).toHaveBeenCalledWith(
      'submit_video',
      expect.objectContaining({ p_categories: ['protest-marches', 'police-conduct', 'gen-z-moments'] })
    );
  });

  it('submits a video with minimal metadata', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await submitPost(makeRequest({ video_url: 'https://www.instagram.com/reel/DEF456abc/' }));
    expect(res.status).toBe(200);
  });

  it('handles RPC errors', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } });

    const res = await submitPost(makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Submission failed');
  });
});

// ─── Views Tests ───────────────────────────────────────────────────────────

describe('POST /api/auth/views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeRequest(body: unknown): Request {
    return new Request('http://localhost:3001/api/auth/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('rejects requests with missing video_id', async () => {
    const res = await viewsPost(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/video_id/i);
  });

  it('increments view count successfully', async () => {
    mockRpc.mockResolvedValue({ error: null });

    const res = await viewsPost(makeRequest({ video_id: 'vid-1' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    expect(mockRpc).toHaveBeenCalledWith('increment_video_view', { p_video_id: 'vid-1' });
  });

  it('handles RPC errors', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'View increment failed' } });

    const res = await viewsPost(makeRequest({ video_id: 'vid-1' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to record view');
  });
});
