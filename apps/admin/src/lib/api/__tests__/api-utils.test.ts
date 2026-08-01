import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { checkDuplicate, createServiceSupabase, deleteVideoById, jsonError, requireUser } from '../api-utils';
import { deleteBlob } from '../upload';

vi.mock('../upload', () => ({ deleteBlob: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({})) }));

/**
 * Builds a minimal Supabase mock supporting the auth and query chains used by api-utils.
 *
 * @param {Record<string, unknown>} overrides - Extra properties merged onto the base mock.
 *
 * @returns {Record<string, unknown>} Supabase mock with auth and from methods.
 */
function makeSupabase(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { auth: { getUser: vi.fn() }, from: vi.fn(), ...overrides };
}

/**
 * Builds a chained query mock for the from() select/delete builders.
 *
 * @param {object} options - Result overrides for the query chain.
 * @param {unknown} [options.deleteResult] - Result resolved by the delete chain.
 * @param {unknown} [options.maybeSingleResult] - Result resolved by maybeSingle.
 *
 * @returns {object} Query chain mock with select, delete, and eq/neq/maybeSingle methods.
 */
function makeQueryChain(options: { deleteResult?: unknown; maybeSingleResult?: unknown } = {}): object {
  const chain = { eq: vi.fn(), neq: vi.fn(), maybeSingle: vi.fn() };
  chain.eq.mockReturnValue(chain);
  chain.neq.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue(options.maybeSingleResult ?? { data: null, error: null });

  const select = vi.fn().mockReturnValue(chain);
  const delete_ = vi
    .fn()
    .mockReturnValue({ eq: vi.fn().mockResolvedValue(options.deleteResult ?? { data: null, error: null }) });

  return { select, delete: delete_, chain };
}

describe('requireUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when a user is authenticated', async () => {
    const supabase = makeSupabase();
    (supabase.auth as { getUser: ReturnType<typeof vi.fn> }).getUser.mockResolvedValue({
      data: { user: { id: 'u1' } },
    });

    await expect(requireUser(supabase as any)).resolves.toBeNull();
  });

  it('returns a 401 response when no user is found', async () => {
    const supabase = makeSupabase();
    (supabase.auth as { getUser: ReturnType<typeof vi.fn> }).getUser.mockResolvedValue({ data: { user: null } });

    const res = await requireUser(supabase as any);
    expect(res?.status).toBe(401);
    await expect(res?.json()).resolves.toEqual({ error: 'Unauthorized' });
  });
});

describe('jsonError', () => {
  it('returns null when error is null', () => {
    expect(jsonError(null)).toBeNull();
  });

  it('returns a 500 response with a generic message for an error', async () => {
    const res = jsonError({ message: 'boom' });
    expect(res?.status).toBe(500);
    await expect(res?.json()).resolves.toEqual({ error: 'Operation failed' });
  });

  it('uses the provided status code', async () => {
    const res = jsonError({ message: 'boom' }, 409);
    expect(res?.status).toBe(409);
  });
});

describe('deleteVideoById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the record and its blob thumbnail', async () => {
    const supabase = makeSupabase();
    const q = makeQueryChain({
      maybeSingleResult: { data: { thumbnail_url: 'https://blob.vercel-storage.com/t.jpg' } },
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: (q as any).select,
      delete: (q as any).delete,
    });

    const res = await deleteVideoById(supabase as any, 'abc');

    expect(supabase.from).toHaveBeenCalledWith('videos');
    expect((q as any).select).toHaveBeenCalledWith('thumbnail_url');
    expect((q as any).chain.eq).toHaveBeenCalledWith('id', 'abc');
    expect(deleteBlob).toHaveBeenCalledWith('https://blob.vercel-storage.com/t.jpg');
    expect((q as any).delete).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('skips blob deletion when the video has no thumbnail', async () => {
    const supabase = makeSupabase();
    const q = makeQueryChain({ maybeSingleResult: { data: { thumbnail_url: null } } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: (q as any).select,
      delete: (q as any).delete,
    });

    await deleteVideoById(supabase as any, 'abc');

    expect(deleteBlob).not.toHaveBeenCalled();
  });

  it('returns a 500 response when the delete query fails', async () => {
    const supabase = makeSupabase();
    const q = makeQueryChain({
      maybeSingleResult: { data: null },
      deleteResult: { data: null, error: { message: 'x' } },
    });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: (q as any).select,
      delete: (q as any).delete,
    });

    const res = await deleteVideoById(supabase as any, 'abc');

    expect(res.status).toBe(500);
  });
});

describe('createServiceSupabase', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns null when env vars are missing', () => {
    expect(createServiceSupabase()).toBeNull();
  });

  it('returns a client when env vars are present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    expect(createServiceSupabase()).not.toBeNull();
  });
});

describe('checkDuplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no existing record matches', async () => {
    const supabase = makeSupabase();
    const q = makeQueryChain({ maybeSingleResult: { data: null } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: (q as any).select, delete: vi.fn() });

    const res = await checkDuplicate(supabase as any, 'video_url', 'https://x.com/v');

    expect((q as any).chain.eq).toHaveBeenCalledWith('video_url', 'https://x.com/v');
    expect((q as any).chain.neq).not.toHaveBeenCalled();
    expect(res).toBeNull();
  });

  it('returns a 409 response when a duplicate is found', async () => {
    const supabase = makeSupabase();
    const q = makeQueryChain({ maybeSingleResult: { data: { id: 'existing' } } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: (q as any).select, delete: vi.fn() });

    const res = await checkDuplicate(supabase as any, 'video_url', 'https://x.com/v');

    expect(res?.status).toBe(409);
    await expect(res?.json()).resolves.toEqual({ error: 'A video with this URL already exists' });
  });

  it('excludes the given id from the duplicate check', async () => {
    const supabase = makeSupabase();
    const q = makeQueryChain({ maybeSingleResult: { data: null } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: (q as any).select, delete: vi.fn() });

    await checkDuplicate(supabase as any, 'video_id', 'ig123', 'self-id');

    expect((q as any).chain.eq).toHaveBeenCalledWith('video_id', 'ig123');
    expect((q as any).chain.neq).toHaveBeenCalledWith('id', 'self-id');
  });

  it('uses the ID label for video_id duplicates', async () => {
    const supabase = makeSupabase();
    const q = makeQueryChain({ maybeSingleResult: { data: { id: 'existing' } } });
    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select: (q as any).select, delete: vi.fn() });

    const res = await checkDuplicate(supabase as any, 'video_id', 'ig123');

    await expect(res?.json()).resolves.toEqual({ error: 'A video with this ID already exists' });
  });
});
