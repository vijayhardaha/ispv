/**
 * @file public-submit.test.ts
 * Tests for the public video submission endpoint.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/public/submit/route';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockRpc = vi.fn();

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({ rpc: mockRpc })) }));

vi.mock('@/lib/api/rateLimit', () => ({
  checkRateLimit: vi.fn(async () => true), // allow all requests
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
      p_tags: 'protest,delhi',
      p_category: 'delhi',
      p_categories: null,
      p_location: null,
      p_city: 'New Delhi',
    });
  });

  it('passes selected categories to the RPC as an array', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(
      makeRequest({
        video_url: 'https://www.instagram.com/reel/ABC123xyz/',
        categories: ['protest-marches', 'police-conduct'],
      })
    );
    expect(res.status).toBe(200);

    expect(mockRpc).toHaveBeenCalledWith(
      'submit_video',
      expect.objectContaining({ p_categories: ['protest-marches', 'police-conduct'] })
    );
  });

  it('rejects more than three categories', async () => {
    const res = await POST(
      makeRequest({
        video_url: 'https://www.instagram.com/reel/ABC123xyz/',
        categories: ['protest-marches', 'police-conduct', 'gen-z-moments', 'human-rights'],
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/3 categories/i);
  });

  it('passes hashtags to RPC as a comma-separated string', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(
      makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/', hashtags: 'Protest,Delhi,FunnyMoment' })
    );
    expect(res.status).toBe(200);

    expect(mockRpc).toHaveBeenCalledWith(
      'submit_video',
      expect.objectContaining({ p_tags: 'protest,delhi,funnymoment' })
    );
  });

  it('handles RPC errors gracefully', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Database error' } });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Submission failed');
  });

  it('accepts video_url field as an alias for url', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/DEF456abc/', hashtags: 'test' }));
    expect(res.status).toBe(200);
  });

  it('trims tags and title-cases the city before calling the RPC', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(
      makeRequest({
        video_url: 'https://www.instagram.com/reel/GHI789def/',
        hashtags: ' protest , Delhi ,students ',
        city: '  new delhi  ',
      })
    );
    expect(res.status).toBe(200);

    expect(mockRpc).toHaveBeenCalledWith(
      'submit_video',
      expect.objectContaining({ p_tags: 'protest,delhi,students', p_city: 'New Delhi' })
    );
  });

  it('accepts standard post URL format', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/p/DEF456abc/' }));
    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith('submit_video', expect.objectContaining({ p_video_id: 'DEF456abc' }));
  });

  it('cleans dirty comma-separated tags with stray spaces', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(
      makeRequest({ video_url: 'https://www.instagram.com/reel/JKL012mno/', hashtags: 'demo, , cool' })
    );
    expect(res.status).toBe(200);

    expect(mockRpc).toHaveBeenCalledWith('submit_video', expect.objectContaining({ p_tags: 'demo,cool' }));
  });

  it('accepts tags provided as an array', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(
      makeRequest({ video_url: 'https://www.instagram.com/reel/JKL012mno/', tags: [' demo ', 'cool'] })
    );
    expect(res.status).toBe(200);

    expect(mockRpc).toHaveBeenCalledWith('submit_video', expect.objectContaining({ p_tags: 'demo,cool' }));
  });
});
