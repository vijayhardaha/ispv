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
 * Inferred type from the submit-video request body schema.
 *
 * @type {SubmitVideoBody}
 */
export type SubmitVideoBody = z.infer<typeof submitVideoBodySchema>;

/**
 * Zod schema validating the video enrichment request body.
 */
export const enrichVideoBodySchema = z.object({
  video_url: z.string().min(1, 'video_url is required'),
  video_post_date: z.string().nullable().optional(),
  og_image: z.string().nullable().optional(),
});

/**
 * Inferred type from the video enrichment request body schema.
 *
 * @type {EnrichVideoBody}
 */
export type EnrichVideoBody = z.infer<typeof enrichVideoBodySchema>;

/**
 * Zod schema matching the CategoryRecord interface for validation.
 */
export const categoryRecordSchema = z.object({
  id: z.string(),
  value: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string().nullable(),
});

/**
 * Inferred type from the category record schema.
 *
 * @type {CategoryRecord}
 */
export type CategoryRecord = z.infer<typeof categoryRecordSchema>;

/**
 * Zod schema matching the LocationRecord interface for validation.
 */
export const locationRecordSchema = z.object({
  id: z.string(),
  value: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

/**
 * Inferred type from the location record schema.
 *
 * @type {LocationRecord}
 */
export type LocationRecord = z.infer<typeof locationRecordSchema>;

/**
 * Zod schema matching the VideoRecord interface for validation.
 */
export const videoRecordSchema = z.object({
  id: z.string(),
  video_url: z.string(),
  video_id: z.string().nullable(),
  video_src: z.string(),
  category: z.string().nullable(),
  location: z.string().nullable(),
  city: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  description: z.string().nullable(),
  thumbnail_url: z.string().nullable(),
  video_post_date: z.string().nullable(),
  status: z.enum(['draft', 'pending_review', 'published', 'rejected']),
  created_at: z.string(),
  updated_at: z.string(),
  category_name: z.string().nullable(),
  category_color: z.string().nullable(),
  view_count: z.number(),
  total_count: z.number().optional(),
});

/**
 * Inferred type from the video record schema.
 *
 * @type {VideoRecord}
 */
export type VideoRecord = z.infer<typeof videoRecordSchema>;

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

/**
 * Inferred type from the video form schema.
 *
 * @type {VideoFormData}
 */
export type VideoFormData = z.infer<typeof videoFormSchema>;
