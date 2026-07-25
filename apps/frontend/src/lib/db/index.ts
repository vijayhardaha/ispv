export { supabase } from './supabase';
export {
  getCategories,
  getLocations,
  getCategoryByValue,
  getFeaturedCategories,
  getTags,
  checkVideoExists,
  getPublishedVideoCount,
  getCityCounts,
  getLocationCounts,
  getLocationVideoCounts,
  getCategoryCounts,
  getHomepageStats,
  type HomepageStats,
} from './db';
export type { DbCategory, DbLocation } from './db';
