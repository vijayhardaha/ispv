/**
 * @file public-views.test.ts
 * Tests for the public view-count increment endpoint.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/public/views/route';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockRpc = vi.fn();

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({ rpc: mockRpc })) }));

vi.mock('@/lib/rateLimit', () => ({
  tryUseUpstashRateLimit: vi.fn(async () => false), // falls back to in-memory
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(body: unknown, ip = '127.0.0.1'): Request {
  return new Request('http://localhost:3001/api/public/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/public/views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  it('rejects requests with missing video_id', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/video_id/);
  });

  it('rejects requests with empty video_id', async () => {
    const res = await POST(makeRequest({ video_id: '' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/video_id/);
  });

  it('increments view count successfully', async () => {
    mockRpc.mockResolvedValue({ error: null });

    const res = await POST(makeRequest({ video_id: 'abc-123' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    expect(mockRpc).toHaveBeenCalledWith('increment_video_view', { p_video_id: 'abc-123' });
  });

  it('handles RPC errors gracefully', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'Video not found' } });

    const res = await POST(makeRequest({ video_id: 'nonexistent' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Video not found');
  });

  it('returns 500 when env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const res = await POST(makeRequest({ video_id: 'abc-123' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/misconfigured/i);
  });
});
