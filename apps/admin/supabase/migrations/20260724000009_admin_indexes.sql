-- ============================================================================
-- Indexes for admin panel queries
-- ============================================================================
-- Targets the get_videos_for_api RPC which queries:
--   WHERE trashed_at IS [NOT] NULL
--     [AND status = X]
--     [AND category = X]
--     [AND location = X]
--     [AND ILIKE search on video_url, video_id, description, city]
--   ORDER BY created_at DESC [or trashed_at DESC for trashed view]
-- ============================================================================

-- Core index for non-trashed admin listing: trashed + status + created_at
CREATE INDEX IF NOT EXISTS idx_videos_admin_list
  ON public.videos (trashed_at, status, created_at DESC);

-- Covering index for trashed view (ordered by trashed_at DESC)
CREATE INDEX IF NOT EXISTS idx_videos_admin_trashed
  ON public.videos (trashed_at, created_at DESC);

-- pg_trgm indexes for ILIKE search on text columns
-- pg_trgm is already enabled in the initial schema
CREATE INDEX IF NOT EXISTS idx_videos_admin_search_url
  ON public.videos USING gin (video_url extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_videos_admin_search_id
  ON public.videos USING gin (video_id extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_videos_admin_search_desc
  ON public.videos USING gin (description extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_videos_admin_search_city
  ON public.videos USING gin (city extensions.gin_trgm_ops);

COMMIT;
