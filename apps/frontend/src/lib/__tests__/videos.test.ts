import { describe, expect, it, vi, beforeEach } from 'vitest';

import { supabase } from '@/lib/supabase';
import { getAllVideosFromDb } from '@/lib/videos';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

describe('videos data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when Supabase returns an error', async () => {
    const errorResult = { data: null, error: { message: 'Database error' } };
    const mockThen = vi.fn().mockImplementation((resolve) => resolve(errorResult));
    const mockOrder2 = vi.fn().mockReturnValue({ then: mockThen });
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder1 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const videos = await getAllVideosFromDb();

    expect(supabase.from).toHaveBeenCalledWith('videos');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('status', 'published');
    expect(mockOrder1).toHaveBeenCalledWith('video_post_date', { ascending: false, nullsFirst: false });
    expect(mockOrder2).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(videos).toEqual([]);
  });

  it('fetches and adapts published videos from Supabase', async () => {
    const rawData = [
      {
        id: 'vid-1',
        description: 'Test video',
        video_url: 'https://instagram.com/reel/123',
        thumbnail_url: 'https://example.com/thumb.jpg',
        city: 'Mumbai',
        location: 'Azad Maidan',
        category: 'protest-marches',
        tags: ['student'],
        view_count: 500,
        status: 'published',
        created_at: '2026-07-01T10:00:00Z',
        updated_at: '2026-07-01T10:00:00Z',
      },
    ];

    const mockThen = vi.fn().mockImplementation((resolve) => resolve({ data: rawData, error: null }));
    const mockOrder2 = vi.fn().mockReturnValue({ then: mockThen });
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder1 });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    (supabase.from as any).mockReturnValue({ select: mockSelect });

    const videos = await getAllVideosFromDb();

    expect(videos).toHaveLength(1);
    expect(videos[0]).toMatchObject({
      id: 'vid-1',
      description: 'Test video',
      city: 'Mumbai',
      category: 'protest-marches',
      categoryName: 'Protest Marches',
    });
  });
});
