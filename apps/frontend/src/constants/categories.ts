import type { DbCategory } from '@/lib/db';

export type VideoCategory = string;

export { type DbCategory as CategoryEntry, getCategories } from '@/lib/db';
