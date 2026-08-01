export { supabase } from './supabase';
export {
  getCategories,
  getFeaturedCategories,
  getCategoryByValue,
  getCategoryVideoCounts,
  getTags,
  getLocations,
  getLocationVideoCounts,
  checkVideoExists,
  getHomepageStats,
} from './db';
export type { DbCategory, DbLocation } from './db';
