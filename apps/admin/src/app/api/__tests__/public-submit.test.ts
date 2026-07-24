/**
 * @file public-submit.test.ts
 * Tests for the public video submission endpoint.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/public/submit/route';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockRpc = vi.fn();

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({ rpc: mockRpc })) }));

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(async () => true), // allow all requests
  tryUseUpstashRateLimit: vi.fn(async () => false), // falls back to in-memory
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

let ipCounter = 0;

function makeRequest(body: unknown): Request {
  ipCounter += 1;
  return new Request('http://localhost:3001/api/public/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `127.0.0.${ipCounter}` },
    body: JSON.stringify(body),
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/public/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  it('rejects requests with missing video_url', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it('rejects requests with empty video_url', async () => {
    const res = await POST(makeRequest({ video_url: '' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/required/i);
  });

  it('rejects non-Instagram URLs', async () => {
    const res = await POST(makeRequest({ video_url: 'https://example.com/video' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid instagram url/i);
  });

  it('accepts a valid Instagram reel URL and calls submit_video RPC', async () => {
    mockRpc.mockResolvedValue({ data: { id: 'new-video-id' }, error: null });

    const res = await POST(
      makeRequest({
        video_url: 'https://www.instagram.com/reel/ABC123xyz/',
        hashtags: 'Protest,Delhi',
        location: 'delhi',
        city: 'New Delhi',
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('new-video-id');

    expect(mockRpc).toHaveBeenCalledWith('submit_video', {
      p_video_url: 'https://www.instagram.com/reel/ABC123xyz/',
      p_video_id: 'ABC123xyz',
      p_video_src: 'instagram',
      p_tags: 'Protest,Delhi',
      p_category: 'delhi',
      p_location: null,
      p_city: 'New Delhi',
    });
  });

  it('passes hashtags to RPC as a comma-separated string', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(
      makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/', hashtags: 'Protest,Delhi,FunnyMoment' })
    );
    expect(res.status).toBe(200);

    expect(mockRpc).toHaveBeenCalledWith(
      'submit_video',
      expect.objectContaining({ p_tags: 'Protest,Delhi,FunnyMoment' })
    );
  });

  it('handles RPC errors gracefully', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Database error' } });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Database error');
  });

  it('accepts video_url field as an alias for url', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/DEF456abc/', hashtags: 'test' }));
    expect(res.status).toBe(200);
  });

  it('accepts standard post URL format', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/p/DEF456abc/' }));
    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith('submit_video', expect.objectContaining({ p_video_id: 'DEF456abc' }));
  });
});
