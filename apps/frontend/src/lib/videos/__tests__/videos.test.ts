import { describe, expect, it, vi, beforeEach } from 'vitest';

import { supabase } from '@/lib/db';
import { getPublishedVideos } from '@/lib/videos';

vi.mock('@/lib/db/supabase', () => ({ supabase: { rpc: vi.fn() } }));

describe('videos data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty result when Supabase returns an error', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'RPC error' } });

    const result = await getPublishedVideos();

    expect(supabase.rpc).toHaveBeenCalledWith('get_frontend_videos', {
      p_category: null,
      p_location: null,
      p_tag: null,
      p_query: null,
      p_sort: 'posted_date_desc',
      p_page: 1,
      p_per_page: 72,
    });
    expect(result).toEqual({ videos: [], total: 0 });
  });

  it('fetches and adapts published videos via RPC', async () => {
    const rawData = [
      {
        id: 'vid-1',
        description: 'Test video',
        video_url: 'https://instagram.com/reel/123',
        thumbnail_url: 'https://example.com/thumb.jpg',
        city: 'Mumbai',
        location: 'Azad Maidan',
        categories: ['protest-marches'],
        tags: ['student'],
        view_count: 500,
        status: 'published',
        created_at: '2026-07-01T10:00:00Z',
      },
    ];

    (supabase.rpc as any).mockResolvedValue({ data: { videos: rawData, total: 1 }, error: null });

    const result = await getPublishedVideos();

    expect(result.videos).toHaveLength(1);
    expect(result.videos[0]).toMatchObject({
      id: 'vid-1',
      description: 'Test video',
      city: 'Mumbai',
      categories: ['protest-marches'],
      category: 'protest-marches',
      categoryName: 'Protest Marches',
    });
    expect(result.total).toBe(1);
  });

  it('applies filters to the RPC call', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: { videos: [], total: 0 }, error: null });

    await getPublishedVideos({
      category: 'police-conduct',
      location: 'delhi',
      tag: 'student',
      query: 'protest',
      sort: 'views_desc',
      page: 2,
      perPage: 24,
    });

    expect(supabase.rpc).toHaveBeenCalledWith('get_frontend_videos', {
      p_category: 'police-conduct',
      p_location: 'delhi',
      p_tag: 'student',
      p_query: 'protest',
      p_sort: 'views_desc',
      p_page: 2,
      p_per_page: 24,
    });
  });
});
