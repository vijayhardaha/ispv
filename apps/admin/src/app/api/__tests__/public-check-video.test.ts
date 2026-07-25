/**
 * @file public-check-video.test.ts
 * Tests for the public check-video endpoint.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/public/check-video/route';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockCreateServiceSupabase = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => ({
  createServiceSupabase: mockCreateServiceSupabase,
  checkRateLimit: vi.fn(async () => true),
}));

vi.mock('@/lib/utils', () => ({
  extractIgId: vi.fn((url: string) => {
    const match = url.match(/\/([a-zA-Z0-9_-]+)\/?$/);
    return match ? match[1] : null;
  }),
  normalizeIgUrl: vi.fn(
    (url: string) => `https://instagram.com/reel/${url.match(/\/([a-zA-Z0-9_-]+)\/?$/)?.[1] || 'unknown'}/`
  ),
  detectSource: vi.fn(() => 'instagram'),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createSupabaseMock(idResult: { data: any; error: any } | null, urlResult: { data: any; error: any } | null) {
  const mockMaybeSingleId = vi.fn().mockResolvedValue(idResult ?? { data: null, error: null });
  const mockEqId = vi.fn(() => ({ maybeSingle: mockMaybeSingleId }));
  const mockSelectId = vi.fn(() => ({ eq: mockEqId }));

  const mockMaybeSingleUrl = vi.fn().mockResolvedValue(urlResult ?? { data: null, error: null });
  const mockEqUrl = vi.fn(() => ({ maybeSingle: mockMaybeSingleUrl }));
  const mockSelectUrl = vi.fn(() => ({ eq: mockEqUrl }));

  const mockFrom = vi.fn();
  mockFrom.mockReturnValueOnce({ select: mockSelectId }).mockReturnValueOnce({ select: mockSelectUrl });

  return { from: mockFrom } as any;
}

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
    mockCreateServiceSupabase.mockReturnValue(createSupabaseMock(null, null));
  });

  it('rejects requests with missing url', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/url is required/i);
  });

  it('returns exists:false when no video found', async () => {
    mockCreateServiceSupabase.mockReturnValueOnce(createSupabaseMock(null, null));

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ exists: false });
  });

  it('returns exists:true with trashed:false for an active video matched by video_id', async () => {
    mockCreateServiceSupabase.mockReturnValueOnce(
      createSupabaseMock(
        { data: { id: '1', trashed_at: null, status: 'published' }, error: null },
        { data: null, error: null }
      )
    );

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ exists: true, trashed: false, status: 'published' });
  });

  it('returns exists:true with trashed:true for a trashed video matched by video_id', async () => {
    mockCreateServiceSupabase.mockReturnValueOnce(
      createSupabaseMock(
        { data: { id: '1', trashed_at: '2024-01-01T00:00:00Z', status: 'published' }, error: null },
        { data: null, error: null }
      )
    );

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/DEF456abc/' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ exists: true, trashed: true, status: 'published' });
  });

  it('falls back to normalized URL when video_id has no match', async () => {
    mockCreateServiceSupabase.mockReturnValueOnce(
      createSupabaseMock(
        { data: null, error: null },
        { data: { id: '2', trashed_at: null, status: 'draft' }, error: null }
      )
    );

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ exists: true, trashed: false, status: 'draft' });
  });

  it('returns 500 when database returns an error', async () => {
    mockCreateServiceSupabase.mockReturnValueOnce(
      createSupabaseMock({ data: null, error: { message: 'DB down' } }, { data: null, error: null })
    );

    const res = await POST(makeRequest({ url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Database lookup failed');
  });
});
