import { z } from 'zod/v4';

/**
 * Zod schema validating the public video submission request body.
 */
export const submitVideoBodySchema = z.object({
  video_url: z.string().min(1, 'video_url is required'),
  tags: z.array(z.string()).nullable().optional(),
  category: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
});

/**
 * Zod schema validating the video enrichment request body.
 */
export const enrichVideoBodySchema = z.object({
  video_url: z.string().min(1, 'video_url is required'),
  video_post_date: z.string().nullable().optional(),
  og_image: z.string().nullable().optional(),
});

/**
 * Video record returned by the Supabase RPC queries.
 *
 * @type {VideoRecord}
 * @property {string} id - Unique video identifier.
 * @property {string} video_url - Original video URL.
 * @property {string | null} video_id - Platform-specific video ID.
 * @property {string} video_src - Source platform identifier.
 * @property {string | null} category - Category slug.
 * @property {string | null} location - Location slug.
 * @property {string | null} city - City name.
 * @property {string[] | null} tags - Searchable tags array.
 * @property {string | null} description - Video description text.
 * @property {string | null} thumbnail_url - Thumbnail image URL.
 * @property {string | null} video_post_date - Original post date.
 * @property {'draft' | 'pending_review' | 'published' | 'rejected'} status - Moderation status.
 * @property {string} created_at - Record creation timestamp.
 * @property {string} updated_at - Record last update timestamp.
 * @property {string | null} category_name - Resolved category display name.
 * @property {string | null} category_color - Resolved category colour.
 * @property {number} view_count - Total view count.
 * @property {number} [total_count] - Optional total count for paginated results.
 * @property {string | null} [trashed_at] - Trash timestamp if soft-deleted.
 */
export interface VideoRecord {
  id: string;
  video_url: string;
  video_id: string | null;
  video_src: string;
  category: string | null;
  location: string | null;
  city: string | null;
  tags: string[] | null;
  description: string | null;
  thumbnail_url: string | null;
  video_post_date: string | null;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  category_name: string | null;
  category_color: string | null;
  view_count: number;
  total_count?: number;
  trashed_at?: string | null;
}

/**
 * Zod schema validating the admin video create/edit form submission.
 */
export const videoFormSchema = z.object({
  video_url: z.string().optional(),
  video_id: z.string().optional(),
  video_src: z.string().optional(),
  category: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'pending_review', 'published', 'rejected']).optional(),
});
