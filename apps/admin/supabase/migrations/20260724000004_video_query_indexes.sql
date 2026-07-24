-- ============================================================================
-- Indexes for video listing & category section queries
-- ============================================================================
--
-- getCategorySectionVideos queries:
--   WHERE status = 'published' AND category IN (...)
--   ORDER BY video_post_date DESC NULLS LAST, created_at DESC
--   LIMIT 72
--
-- getPublishedVideos (default sort) queries:
--   WHERE status = 'published'
--   ORDER BY video_post_date DESC NULLS LAST, created_at DESC
--   LIMIT 72
--
-- The existing idx_videos_status_category_created covers (status, category, created_at)
-- but does not help ordering by video_post_date.
-- ============================================================================

-- Covering index for category-section queries: status + category + video_post_date
CREATE INDEX IF NOT EXISTS idx_videos_status_category_post
  ON public.videos (status, category, video_post_date DESC NULLS LAST);

-- Covering index for default published-video listing (no category filter)
CREATE INDEX IF NOT EXISTS idx_videos_status_post
  ON public.videos (status, video_post_date DESC NULLS LAST, created_at DESC);

COMMIT;
