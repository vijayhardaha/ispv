import { describe, expect, it, vi } from 'vitest';

import { getVideosForApi } from '../rpc';

const mockRpc = vi.fn();
const mockSupabase = { rpc: mockRpc } as any;

describe('getVideosForApi', () => {
  it('calls get_videos_for_api with default filters', async () => {
    mockRpc.mockResolvedValue({
      data: { data: [], pagination: { page: 1, per_page: 50, total_count: 0, total_pages: 0 } },
      error: null,
    });

    const result = await getVideosForApi(mockSupabase);

    expect(mockRpc).toHaveBeenCalledWith('get_videos_for_api', {
      filters: { status: null, search: null, category: null, location: null, page: 1, per_page: 50 },
    });
    expect(result).toEqual({ data: [], pagination: { page: 1, per_page: 50, total_count: 0, total_pages: 0 } });
  });

  it('passes filter values to the RPC', async () => {
    mockRpc.mockResolvedValue({
      data: { data: [], pagination: { page: 2, per_page: 20, total_count: 10, total_pages: 1 } },
      error: null,
    });

    await getVideosForApi(mockSupabase, {
      status: 'published',
      search: 'protest',
      category: 'police-conduct',
      location: 'delhi',
      page: 2,
      per_page: 20,
    });

    expect(mockRpc).toHaveBeenCalledWith('get_videos_for_api', {
      filters: {
        status: 'published',
        search: 'protest',
        category: 'police-conduct',
        location: 'delhi',
        page: 2,
        per_page: 20,
      },
    });
  });

  it('normalizes null/undefined filter values to null', async () => {
    mockRpc.mockResolvedValue({
      data: { data: [], pagination: { page: 1, per_page: 50, total_count: 0, total_pages: 0 } },
      error: null,
    });

    await getVideosForApi(mockSupabase, { status: undefined, search: null, category: '', location: undefined } as any);

    expect(mockRpc).toHaveBeenCalledWith('get_videos_for_api', {
      filters: { status: null, search: null, category: null, location: null, page: 1, per_page: 50 },
    });
  });

  it('returns paginated response with metadata', async () => {
    const mockResponse = {
      data: [
        { id: '1', video_url: 'https://instagram.com/reel/abc', status: 'published' },
        { id: '2', video_url: 'https://instagram.com/reel/xyz', status: 'published' },
      ],
      pagination: { page: 1, per_page: 50, total_count: 2, total_pages: 1 },
    };

    mockRpc.mockResolvedValue({ data: mockResponse, error: null });

    const result = await getVideosForApi(mockSupabase);

    expect(result).toEqual(mockResponse);
    expect(result?.data).toHaveLength(2);
    expect(result?.pagination.total_count).toBe(2);
  });

  it('returns null when RPC returns an error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await getVideosForApi(mockSupabase);
    consoleSpy.mockRestore();

    expect(result).toBeNull();
  });

  it('logs error to console on RPC failure', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await getVideosForApi(mockSupabase);
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching videos:', { message: 'RPC failed' });
    consoleSpy.mockRestore();
  });
});
