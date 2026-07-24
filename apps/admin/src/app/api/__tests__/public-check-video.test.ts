/**
 * @file public-check-video.test.ts
 * Tests for the public check-video endpoint.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/public/check-video/route';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockFrom = vi.fn();

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({ from: mockFrom })) }));

vi.mock('@/lib/rateLimit', () => ({
  checkRateLimit: vi.fn(async () => true),
  tryUseUpstashRateLimit: vi.fn(async () => false),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

let ipCounter = 0;

function makeRequest(body: unknown): Request {
  ipCounter += 1;
  return new Request('http://localhost:3001/api/public/check-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `127.0.0.${ipCounter}` },
    body: JSON.stringify(body),
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('POST /api/public/check-video', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    mockFrom.mockReturnValue({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })) });
  });

  it('rejects requests with missing url', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/url is required/i);
  });

  it('returns exists:false when no video found', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) })),
        })),
      })
      .mockReturnValueOnce({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })) });

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ exists: false });
  });

  it('returns exists:true with trashed:false for an active video', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { trashed_at: null, status: 'published' } }),
          })),
        })),
      })
      .mockReturnValueOnce({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })) });

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ exists: true, trashed: false, status: 'published' });
  });

  it('returns exists:true with trashed:true for a trashed video', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: { trashed_at: '2024-01-01T00:00:00Z', status: 'published' } }),
          })),
        })),
      })
      .mockReturnValueOnce({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })) });

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/DEF456abc/' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ exists: true, trashed: true, status: 'published' });
  });

  it('returns exists:true when matched by video_id', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { trashed_at: null, status: 'draft' } }),
          })),
        })),
      });

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ exists: true, trashed: false, status: 'draft' });
  });
});
