-- ============================================================================
-- Drop objects from initial schema that are unused in application code
-- ============================================================================
-- - purge_old_trashed_videos: never called from app code
-- - active_videos view: replaced by RPC-based queries
-- - trashed_videos view: replaced by RPC-based queries
-- - get_published_video_count: superseded by get_homepage_stats RPC
-- ============================================================================

DROP FUNCTION IF EXISTS public.purge_old_trashed_videos(integer);
DROP VIEW IF EXISTS public.active_videos;
DROP VIEW IF EXISTS public.trashed_videos;
DROP FUNCTION IF EXISTS public.get_published_video_count();

COMMIT;
