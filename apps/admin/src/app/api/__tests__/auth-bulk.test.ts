/**
 * @file auth-bulk.test.ts
 * Tests for the bulk video operations endpoint (POST /api/auth/videos/bulk).
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST } from '@/app/api/auth/videos/bulk/route';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockIn = vi.fn();
const mockGetUser = vi.fn();

/** Queue of response values consumed in order by `await` on any chain link. */
const mockFromDataQueue: unknown[] = [];

/**
 * Creates a thenable chain object mimicking the Supabase query builder.
 * Each method logs calls to its corresponding mock and returns the chain.
 * `await chain` consumes and resolves to the next value in `mockFromDataQueue`.
 *
 * @returns {Record<string, (...args: unknown[]) => unknown>} Thenable chain.
 */
function makeChain(): Record<string, (...args: unknown[]) => unknown> {
  const chain: Record<string, any> = {
    then: (resolve: (v: unknown) => void) => resolve(mockFromDataQueue.shift() ?? { error: null }),
    update: (..._a: unknown[]) => {
      mockUpdate(..._a);
      return chain;
    },
    delete: (..._a: unknown[]) => {
      mockDelete(..._a);
      return chain;
    },
    in: (..._a: unknown[]) => {
      mockIn(..._a);
      return chain;
    },
    select: () => chain,
    eq: () => chain,
    insert: () => chain,
    order: () => chain,
    single: () => chain,
    maybeSingle: () => chain,
  };
  return chain;
}

const mockSupabase = { auth: { getUser: mockGetUser }, from: vi.fn(() => makeChain()), rpc: vi.fn() };

vi.mock('@/lib/db/supabase-server', () => ({ createServerSupabase: vi.fn(async () => mockSupabase) }));

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3001/api/auth/videos/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('POST /api/auth/videos/bulk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    mockFromDataQueue.length = 0;
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest({ action: 'delete', ids: ['vid-1'] }));
    expect(res.status).toBe(401);
  });

  it('rejects empty ids array', async () => {
    const res = await POST(makeRequest({ action: 'delete', ids: [] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/non-empty/i);
  });

  it('rejects missing ids field', async () => {
    const res = await POST(makeRequest({ action: 'delete' }));
    expect(res.status).toBe(400);
  });

  it('bulk deletes videos', async () => {
    // select(thumbnail_url) resolves first, then delete() resolves
    mockFromDataQueue.push({ data: null, error: null });
    mockFromDataQueue.push({ error: null });

    const res = await POST(makeRequest({ action: 'delete', ids: ['vid-1', 'vid-2'] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(2);
  });

  it('bulk updates status', async () => {
    mockFromDataQueue.push({ error: null });

    const res = await POST(makeRequest({ action: 'update_status', ids: ['vid-1', 'vid-2'], status: 'published' }));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'published' });
  });

  it('rejects invalid status for update_status action', async () => {
    const res = await POST(makeRequest({ action: 'update_status', ids: ['vid-1'], status: 'bogus' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it('bulk trashes videos and sets trashed_at timestamp', async () => {
    mockFromDataQueue.push({ error: null });

    const res = await POST(makeRequest({ action: 'trash', ids: ['vid-1'] }));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalled();
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg).toHaveProperty('trashed_at');
    expect(updateArg).toHaveProperty('trash_reason');
  });

  it('bulk restores videos by nullifying trashed fields', async () => {
    mockFromDataQueue.push({ error: null });

    const res = await POST(makeRequest({ action: 'restore', ids: ['vid-1'] }));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({ trashed_at: null, trash_reason: null });
  });

  it('rejects unknown actions', async () => {
    const res = await POST(makeRequest({ action: 'unknown', ids: ['vid-1'] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/unknown/i);
  });

  it('handles database errors on delete', async () => {
    // select(thumbnail_url) resolves first, then delete() fails
    mockFromDataQueue.push({ data: null, error: null });
    mockFromDataQueue.push({ error: { message: 'Delete failed' } });

    const res = await POST(makeRequest({ action: 'delete', ids: ['vid-1'] }));
    expect(res.status).toBe(500);
  });
});
