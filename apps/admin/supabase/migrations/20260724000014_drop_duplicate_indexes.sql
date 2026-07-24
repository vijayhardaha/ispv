-- ============================================================================
-- Remove duplicate and redundant GIN indexes
-- ============================================================================
-- The initial schema created GIN trgm indexes with the prefix idx_videos_*
-- (idx_videos_video_url_trgm, idx_videos_video_id_trgm, idx_videos_description_trgm).
-- The consolidated migration added differently-named equivalents with prefix
-- idx_videos_admin_search_*. Both sets index the same columns with the same
-- operator class — doubling storage and write cost.
--
-- Dropping the initial-schema names, keeping the admin-prefixed ones.
-- Also drops idx_videos_trashed_at which is fully covered by the composite
-- idx_videos_admin_list (trashed_at, status, created_at DESC).
-- ============================================================================

DROP INDEX IF EXISTS public.idx_videos_video_url_trgm;
DROP INDEX IF EXISTS public.idx_videos_video_id_trgm;
DROP INDEX IF EXISTS public.idx_videos_description_trgm;
DROP INDEX IF EXISTS public.idx_videos_trashed_at;

COMMIT;
