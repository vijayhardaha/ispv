import { z } from 'zod/v4';

/**
 * Zod schema validating the category record shape.
 */
export const categorySchema = z.object({
  id: z.string(),
  value: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string().nullable(),
});

/**
 * Inferred type from the category schema.
 *
 * @type {Category}
 */
export type Category = z.infer<typeof categorySchema>;

/**
 * Zod schema validating the location record shape.
 */
export const locationSchema = z.object({
  id: z.string(),
  value: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

/**
 * Inferred type from the location schema.
 *
 * @type {Location}
 */
export type Location = z.infer<typeof locationSchema>;

/**
 * Zod schema validating a video entry for the frontend archive.
 */
export const videoEntrySchema = z.object({
  id: z.string(),
  description: z.string(),
  url: z.string().url(),
  thumbnail: z.string(),
  city: z.string(),
  location: z.string(),
  category: z.string(),
  categoryName: z.string(),
  tags: z.array(z.string()),
  hashtags: z.array(z.string()),
  duration: z.number(),
  featured: z.boolean().optional(),
});

/**
 * Inferred type from the video entry schema.
 *
 * @type {VideoEntry}
 */
export type VideoEntry = z.infer<typeof videoEntrySchema>;

/**
 * Zod schema validating the filter state for the video archive.
 */
export const filterStateSchema = z.object({
  query: z.string(),
  category: z.string(),
  location: z.string(),
  tags: z.array(z.string()),
  page: z.number().int().min(1),
  perPage: z.number().int().min(1),
});

/**
 * Inferred type from the filter state schema.
 *
 * @type {FilterState}
 */
export type FilterState = z.infer<typeof filterStateSchema>;

/**
 * Zod schema validating the public video submission form.
 */
export const submitVideoFormSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  location: z.string().min(1, 'Location is required'),
  city: z.string().max(30, 'City must be 30 characters or less'),
  hashtags: z.string(),
});

/**
 * Inferred type from the submit-video form schema.
 *
 * @type {SubmitVideoForm}
 */
export type SubmitVideoForm = z.infer<typeof submitVideoFormSchema>;
