/**
 * @file auth-videos.test.ts
 * Tests for the authenticated videos endpoints (GET/POST /api/auth/videos).
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GET, POST } from '@/app/api/auth/videos/route';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockEq = vi.fn();
const mockGetUser = vi.fn();

/**
 * Queue of response values consumed in order by `await` on any chain link.
 * Each call to `chain.then()` shifts the next value off the queue.
 */
const mockFromDataQueue: unknown[] = [];

/**
 * Creates a thenable chain object mimicking the Supabase query builder.
 * Each method logs calls to its corresponding top-level mock function
 * and returns the same chain object. `await chain` consumes and resolves
 * to the next value in `mockFromDataQueue`.
 *
 * @returns {Record<string, (...args: unknown[]) => unknown>} Thenable chain.
 */
function makeChain(): Record<string, (...args: unknown[]) => unknown> {
  const chain: Record<string, any> = {
    then: (resolve: (v: unknown) => void) => resolve(mockFromDataQueue.shift() ?? { data: null, error: null }),
    select: (..._a: unknown[]) => {
      mockSelect(..._a);
      return chain;
    },
    eq: (..._a: unknown[]) => {
      mockEq(..._a);
      return chain;
    },
    order: (..._a: unknown[]) => {
      mockOrder(..._a);
      return chain;
    },
    insert: (..._a: unknown[]) => {
      mockInsert(..._a);
      return chain;
    },
    single: (..._a: unknown[]) => {
      mockSingle(..._a);
      return chain;
    },
    maybeSingle: (..._a: unknown[]) => {
      mockMaybeSingle(..._a);
      return chain;
    },
  };
  return chain;
}

const mockSupabase = { auth: { getUser: mockGetUser }, from: vi.fn(() => makeChain()), rpc: vi.fn() };

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn(async () => mockSupabase) }));

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3001/api/auth/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const mockVideo = {
  id: 'vid-1',
  video_url: 'https://www.instagram.com/reel/ABC123xyz/',
  video_id: 'ABC123xyz',
  video_src: 'instagram',
  category: null,
  location: null,
  city: null,
  tags: null,
  description: null,
  thumbnail_url: null,
  video_post_date: null,
  status: 'draft',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  category_name: null,
  category_color: null,
  view_count: 0,
};

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('GET /api/auth/videos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFromDataQueue.length = 0;
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it('returns video list for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockFromDataQueue.push({ data: [mockVideo], error: null });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe('vid-1');
  });

  it('handles database errors gracefully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockFromDataQueue.push({ data: null, error: { message: 'Connection failed' } });

    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Connection failed');
  });
});

describe('POST /api/auth/videos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockFromDataQueue.length = 0;
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(401);
  });

  it('creates a new video successfully', async () => {
    // Queue: [URL duplicate check null, ID duplicate check null, insert returns mockVideo]
    mockFromDataQueue.push(
      { data: null, error: null }, // URL duplicate check
      { data: null, error: null }, // ID duplicate check
      { data: mockVideo, error: null } // Insert
    );

    const res = await POST(
      makeRequest({
        video_url: 'https://www.instagram.com/reel/ABC123xyz/',
        video_id: 'ABC123xyz',
        video_src: 'instagram',
        status: 'draft',
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('vid-1');
  });

  it('rejects duplicate video_url', async () => {
    mockFromDataQueue.push({ data: { id: 'existing-vid' }, error: null });

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already exists/i);
  });

  it('rejects invalid request body', async () => {
    const res = await POST(makeRequest({ status: 'invalid-status' }));
    expect(res.status).toBe(400);
  });
  it('handles database insert errors', async () => {
    mockFromDataQueue.push(
      { data: null, error: null }, // URL duplicate check
      { data: null, error: { message: 'Insert failed' } } // Insert error (no video_id in body)
    );

    const res = await POST(makeRequest({ video_url: 'https://www.instagram.com/reel/ABC123xyz/' }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Insert failed');
  });
});
