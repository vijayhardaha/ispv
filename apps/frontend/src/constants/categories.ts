import { getCategories } from '@/lib/db';

export type VideoCategory = string;
export type CategoryEntry = import('@/lib/db').DbCategory;
export { getCategories };
