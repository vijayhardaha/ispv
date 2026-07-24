/**
 * @file auth-enrich.test.ts
 * Tests for the video enrichment endpoint (POST /api/auth/enrich).
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/auth/enrich/route';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockRpc = vi.fn();

// Use vi.hoisted to avoid "Cannot access before initialization" with vi.mock hoisting
const mockUploadBuffer = vi.hoisted(() => vi.fn());

const mockSharp = vi.hoisted(() =>
  vi.fn(() => ({ webp: vi.fn(() => ({ toBuffer: vi.fn(async () => Buffer.from('optimized')) })) }))
);

vi.mock('@/lib/api-utils', () => ({ createServiceSupabase: vi.fn(() => ({ rpc: mockRpc })) }));

vi.mock('@/lib/upload', () => ({ uploadBuffer: mockUploadBuffer }));

vi.mock('sharp', () => ({ default: mockSharp }));

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(body: unknown, token = 'valid-token'): Request {
  return new Request('http://localhost:3001/api/auth/enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/auth/enrich', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ENRICH_API_TOKEN = 'valid-token';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  it('returns 401 when bearer token is invalid', async () => {
    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }, 'wrong-token'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('returns 401 when no bearer token is provided', async () => {
    const req = new Request('http://localhost:3001/api/auth/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects requests with missing video_url', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it('rejects non-Instagram URLs', async () => {
    const res = await POST(makeRequest({ video_url: 'https://example.com/video' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid instagram url/i);
  });

  it('submits enrichment data without og_image', async () => {
    mockRpc.mockResolvedValue({ data: { id: 'enriched-vid' }, error: null });

    const res = await POST(
      makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/', video_post_date: '2025-06-01T00:00:00Z' })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('enriched-vid');

    expect(mockRpc).toHaveBeenCalledWith('submit_video', {
      p_video_url: 'https://www.instagram.com/reel/ABC123xyz/',
      p_video_id: 'ABC123xyz',
      p_video_src: 'instagram',
      p_video_post_date: '2025-06-01T00:00:00Z',
      p_thumbnail_url: null,
    });
  });

  it('handles RPC errors', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Enrich failed' } });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Enrich failed');
  });

  it('submits enrichment with optional og_image', async () => {
    mockRpc.mockResolvedValue({ data: { ok: true }, error: null });

    const res = await POST(
      makeRequest({
        video_url: 'https://www.instagram.com/reel/ABC123xyz/',
        og_image: 'https://example.com/image.jpg',
        video_post_date: null,
      })
    );
    expect(res.status).toBe(200);
  });
});
