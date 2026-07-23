/**
 * @file auth-videos-id.test.ts
 * Tests for the authenticated single-video endpoints
 * (PUT /api/auth/videos/[id], POST /api/auth/videos/[id], DELETE /api/auth/videos/[id]).
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DELETE, POST, PUT } from '@/app/api/auth/videos/[id]/route';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockGetUser = vi.fn();
const mockRpc = vi.fn();

/** Queue of response values consumed in order by `await` on any chain link. */
const mockFromDataQueue: unknown[] = [];

/**
 * Creates a thenable chain object mimicking the Supabase query builder.
 * Each method logs calls to its corresponding mock and returns the chain.
 * `await chain` consumes and resolves to the next value in `mockFromDataQueue`.
 *
 * @returns {{ then: Function, select: Function, eq: Function, neq: Function, update: Function, delete: Function, single: Function, maybeSingle: Function }} Thenable chain.
 */
function makeChain() {
  const chain = {
    then: (resolve: (v: unknown) => void) => resolve(mockFromDataQueue.shift() ?? { data: null, error: null }),
    select: (...a: unknown[]) => {
      mockSelect(...a);
      return chain;
    },
    eq: (...a: unknown[]) => {
      mockEq(...a);
      return chain;
    },
    neq: (...a: unknown[]) => {
      mockEq(...a);
      return chain;
    },
    update: (...a: unknown[]) => {
      mockUpdate(...a);
      return chain;
    },
    delete: (...a: unknown[]) => {
      mockDelete(...a);
      return chain;
    },
    single: (...a: unknown[]) => {
      mockSingle(...a);
      return chain;
    },
    maybeSingle: (...a: unknown[]) => {
      mockMaybeSingle(...a);
      return chain;
    },
  };
  return chain;
}

const mockSupabase = { auth: { getUser: mockGetUser }, from: vi.fn(() => makeChain()), rpc: mockRpc };

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn(async () => mockSupabase) }));

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3001/api/auth/videos/vid-1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeParams(id = 'vid-1') {
  return { params: Promise.resolve({ id }) };
}

const mockVideo = {
  id: 'vid-1',
  video_url: 'https://www.instagram.com/reel/ABC123xyz/',
  video_id: 'ABC123xyz',
  video_src: 'instagram',
  status: 'draft',
  category: null,
  location: null,
  city: null,
  tags: null,
  description: null,
  thumbnail_url: null,
  video_post_date: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  category_name: null,
  category_color: null,
  view_count: 0,
};

// ─── PUT Tests ─────────────────────────────────────────────────────────────

describe('PUT /api/auth/videos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockFromDataQueue.length = 0;
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new Request('http://localhost:3001/api/auth/videos/vid-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });
    const res = await PUT(req, makeParams());
    expect(res.status).toBe(401);
  });

  it('updates a video successfully', async () => {
    mockFromDataQueue.push(
      { data: null, error: null }, // URL duplicate check
      { data: null, error: null }, // ID duplicate check
      { data: mockVideo, error: null } // Update result
    );

    const req = new Request('http://localhost:3001/api/auth/videos/vid-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });
    const res = await PUT(req, makeParams());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('vid-1');
  });

  it('rejects duplicate video_url on update', async () => {
    mockFromDataQueue.push({ data: { id: 'other-vid' }, error: null });

    const req = new Request('http://localhost:3001/api/auth/videos/vid-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: 'https://www.instagram.com/reel/DUPLICATE/' }),
    });
    const res = await PUT(req, makeParams());
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already exists/i);
  });

  it('rejects invalid request body', async () => {
    const req = new Request('http://localhost:3001/api/auth/videos/vid-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'super-published' }),
    });
    const res = await PUT(req, makeParams());
    expect(res.status).toBe(400);
  });
});

// ─── POST (actions) Tests ──────────────────────────────────────────────────

describe('POST /api/auth/videos/[id] (actions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockFromDataQueue.length = 0;
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ action: 'trash' }), makeParams());
    expect(res.status).toBe(401);
  });

  it('trashes a video via RPC', async () => {
    mockRpc.mockResolvedValue({ error: null });

    const res = await POST(makeRequest({ action: 'trash', reason: 'Duplicate' }), makeParams());
    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith('trash_video', { p_video_id: 'vid-1', p_reason: 'Duplicate' });
  });

  it('restores a video via RPC', async () => {
    mockRpc.mockResolvedValue({ error: null });

    const res = await POST(makeRequest({ action: 'restore' }), makeParams());
    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith('restore_video', { p_video_id: 'vid-1' });
  });

  it('permanently deletes a video via supabase delete', async () => {
    mockFromDataQueue.push({ error: null });

    const res = await POST(makeRequest({ action: 'delete' }), makeParams());
    expect(res.status).toBe(200);
  });

  it('rejects unknown actions', async () => {
    const res = await POST(makeRequest({ action: 'unknown-action' }), makeParams());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/unknown/i);
  });

  it('handles trash RPC errors', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'RPC failed' } });

    const res = await POST(makeRequest({ action: 'trash' }), makeParams());
    expect(res.status).toBe(500);
  });
});

// ─── DELETE Tests ──────────────────────────────────────────────────────────

describe('DELETE /api/auth/videos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockFromDataQueue.length = 0;
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new Request('http://localhost:3001/api/auth/videos/vid-1', { method: 'DELETE' });
    const res = await DELETE(req, makeParams());
    expect(res.status).toBe(401);
  });

  it('deletes a video permanently', async () => {
    mockFromDataQueue.push({ error: null });

    const req = new Request('http://localhost:3001/api/auth/videos/vid-1', { method: 'DELETE' });
    const res = await DELETE(req, makeParams());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('handles delete errors', async () => {
    mockFromDataQueue.push({ error: { message: 'Delete failed' } });

    const req = new Request('http://localhost:3001/api/auth/videos/vid-1', { method: 'DELETE' });
    const res = await DELETE(req, makeParams());
    expect(res.status).toBe(500);
  });
});
