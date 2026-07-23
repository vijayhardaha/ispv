import { z } from 'zod/v4';

export const categorySchema = z.object({
  id: z.string(),
  value: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string().nullable(),
});

export type Category = z.infer<typeof categorySchema>;

export const locationSchema = z.object({
  id: z.string(),
  value: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

export type Location = z.infer<typeof locationSchema>;

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

export type VideoEntry = z.infer<typeof videoEntrySchema>;

export const filterStateSchema = z.object({
  query: z.string(),
  category: z.string(),
  location: z.string(),
  tags: z.array(z.string()),
  page: z.number().int().min(1),
  perPage: z.number().int().min(1),
});

export type FilterState = z.infer<typeof filterStateSchema>;

export const submitVideoFormSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  location: z.string().min(1, 'Location is required'),
  city: z.string().max(30, 'City must be 30 characters or less'),
  hashtags: z.string(),
});

export type SubmitVideoForm = z.infer<typeof submitVideoFormSchema>;
