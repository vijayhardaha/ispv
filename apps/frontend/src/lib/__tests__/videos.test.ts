import { describe, expect, it, vi, beforeEach } from 'vitest';

import { supabase } from '@/lib/supabase';
import { getAllVideosFromDb } from '@/lib/videos';

vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }));

describe('videos data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when Supabase returns an error', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

    const videos = await getAllVideosFromDb();

    expect(supabase.from).toHaveBeenCalledWith('videos');
    expect(mockSelect).toHaveBeenCalledWith('*, categories(name, color)');
    expect(mockEq).toHaveBeenCalledWith('status', 'published');
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(videos).toEqual([]);
  });

  it('fetches and adapts published videos from Supabase', async () => {
    const rawData = [
      {
        id: 'vid-1',
        description: 'Test video',
        url: 'https://instagram.com/reel/123',
        thumbnail_url: 'https://example.com/thumb.jpg',
        city: 'Mumbai',
        location: 'Azad Maidan',
        category: 'education',
        categories: { name: 'Education', color: '#ff0000' },
        tags: ['student'],
        hashtags: ['#protest'],
        duration: 30,
        featured: true,
      },
    ];

    const mockOrder = vi.fn().mockResolvedValue({ data: rawData, error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any);

    const videos = await getAllVideosFromDb();

    expect(videos).toHaveLength(1);
    expect(videos[0]).toMatchObject({
      id: 'vid-1',
      description: 'Test video',
      city: 'Mumbai',
      category: 'education',
      categoryName: 'Education',
    });
  });
});
