-- ============================================================================
-- Consolidated migrations — combines all post-initial-schema migrations into
-- one file. Duplicates (superseded RPC versions) have been removed.
--
-- Source files combined:
--   00001 (service_role EXECUTE grants)
--   00002 (service_role SELECT grant)
--   00003 (standalone count RPCs)
--   00004 (video query indexes)
--   00005 (homepage stats RPC)
--   00006 (frontend videos RPCs)
--   00009 (admin indexes)
--   00010 (get_videos_for_api — fixed, replaces 00008)
--   00011 (get_dashboard_stats — fixed, replaces 00007)
-- ============================================================================

-- ............................................................................
-- 1. Grants for service_role
-- ............................................................................
-- Public API routes (submit, view-count, check-video) use createServiceSupabase
-- which authenticates as service_role. These functions and tables need explicit grants.

GRANT EXECUTE
  ON FUNCTION public.submit_video(text, text, text, text, text, text, text, timestamptz, text)
  TO service_role;

GRANT EXECUTE
  ON FUNCTION public.increment_video_view(uuid)
  TO service_role;

GRANT SELECT ON public.videos TO service_role;

-- ............................................................................
-- 2. Indexes for frontend video listing queries
-- ............................................................................
-- getCategorySectionVideos: WHERE status='published' AND category IN (…) ORDER BY video_post_date DESC
-- getPublishedVideos (default): WHERE status='published' ORDER BY video_post_date DESC

CREATE INDEX IF NOT EXISTS idx_videos_status_category_post
  ON public.videos (status, category, video_post_date DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_videos_status_post
  ON public.videos (status, video_post_date DESC NULLS LAST, created_at DESC);

-- ............................................................................
-- 3. Indexes for admin panel queries
-- ............................................................................
-- Targets get_videos_for_api: WHERE trashed_at IS [NOT] NULL [AND status = X]
--                             [AND category = X] [AND ILIKE search on 4 columns]
--                             ORDER BY created_at DESC [or trashed_at DESC]

CREATE INDEX IF NOT EXISTS idx_videos_admin_list
  ON public.videos (trashed_at, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_admin_trashed
  ON public.videos (trashed_at, created_at DESC);

-- GIN trigram indexes for ILIKE search (pg_trgm must be enabled)

CREATE INDEX IF NOT EXISTS idx_videos_admin_search_url
  ON public.videos USING gin (video_url extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_videos_admin_search_id
  ON public.videos USING gin (video_id extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_videos_admin_search_desc
  ON public.videos USING gin (description extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_videos_admin_search_city
  ON public.videos USING gin (city extensions.gin_trgm_ops);

-- ............................................................................
-- 4. Standalone count RPCs for published videos
-- ............................................................................
-- These simple aggregate RPCs are still used by the frontend constants system.

CREATE OR REPLACE FUNCTION public.get_city_counts()
RETURNS TABLE (city text, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT v.city, COUNT(*)::bigint AS count
  FROM public.videos v
  WHERE v.status = 'published' AND v.city IS NOT NULL
  GROUP BY v.city
  ORDER BY count DESC, v.city ASC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_city_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_city_counts() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_location_counts()
RETURNS TABLE (location text, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT v.location, COUNT(*)::bigint AS count
  FROM public.videos v
  WHERE v.status = 'published' AND v.location IS NOT NULL
  GROUP BY v.location
  ORDER BY count DESC, v.location ASC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_location_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_location_counts() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE (slug text, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT v.category, COUNT(*)::bigint AS count
  FROM public.videos v
  WHERE v.status = 'published' AND v.category IS NOT NULL
  GROUP BY v.category
  ORDER BY count DESC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_category_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_category_counts() TO anon, authenticated;

-- ............................................................................
-- 5. Homepage aggregate stats RPC
-- ............................................................................
-- Replaces 4 separate queries (published count, city count, location count,
-- location counts) with a single JSON response.

CREATE OR REPLACE FUNCTION public.get_homepage_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT jsonb_build_object(
    'total_videos',  (SELECT COUNT(*)::int FROM public.videos WHERE status = 'published'),
    'total_cities',  (SELECT COUNT(DISTINCT city)::int FROM public.videos WHERE status = 'published' AND city IS NOT NULL),
    'total_locations', (SELECT COUNT(DISTINCT location)::int FROM public.videos WHERE status = 'published' AND location IS NOT NULL),
    'location_counts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('slug', v.location, 'count', v.cnt) ORDER BY v.cnt DESC)
      FROM (SELECT location, COUNT(*)::int AS cnt FROM public.videos WHERE status = 'published' AND location IS NOT NULL GROUP BY location) v
    ), '[]'::jsonb)
  );
$function$;

REVOKE EXECUTE ON FUNCTION public.get_homepage_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_homepage_stats() TO anon, authenticated;

-- ............................................................................
-- 6. Frontend video listing RPCs
-- ............................................................................
-- get_frontend_videos: paginated, filtered, multi-sort public video list.
-- Uses COUNT(*) OVER() for single-pass pagination and dynamic ORDER BY.
--
-- get_frontend_category_videos: batch fetch per-category for homepage sections.
-- Replaces 18 individual per-category queries with one LATERAL join.

CREATE OR REPLACE FUNCTION public.get_frontend_videos(
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_tag text DEFAULT NULL,
  p_query text DEFAULT NULL,
  p_sort text DEFAULT 'posted_date_desc',
  p_page int DEFAULT 1,
  p_per_page int DEFAULT 72
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_offset int := (p_page - 1) * p_per_page;
  v_sort_col text;
  v_sort_dir text;
  result jsonb;
BEGIN
  CASE p_sort
    WHEN 'views_desc' THEN v_sort_col := 'view_count'; v_sort_dir := 'DESC NULLS LAST';
    WHEN 'views_asc' THEN v_sort_col := 'view_count'; v_sort_dir := 'ASC NULLS LAST';
    WHEN 'posted_date_desc' THEN v_sort_col := 'video_post_date'; v_sort_dir := 'DESC NULLS LAST';
    WHEN 'posted_date_asc' THEN v_sort_col := 'video_post_date'; v_sort_dir := 'ASC NULLS LAST';
    WHEN 'created_date_desc' THEN v_sort_col := 'created_at'; v_sort_dir := 'DESC NULLS LAST';
    WHEN 'created_date_asc' THEN v_sort_col := 'created_at'; v_sort_dir := 'ASC NULLS LAST';
    WHEN 'city_asc' THEN v_sort_col := 'city'; v_sort_dir := 'ASC NULLS LAST';
    WHEN 'city_desc' THEN v_sort_col := 'city'; v_sort_dir := 'DESC NULLS LAST';
    WHEN 'location_asc' THEN v_sort_col := 'location'; v_sort_dir := 'ASC NULLS LAST';
    WHEN 'location_desc' THEN v_sort_col := 'location'; v_sort_dir := 'DESC NULLS LAST';
    ELSE v_sort_col := 'video_post_date'; v_sort_dir := 'DESC NULLS LAST';
  END CASE;

  EXECUTE format(
    'WITH filtered AS (
      SELECT * FROM public.videos
      WHERE status = ''published''
        AND ($1 IS NULL OR category = $1)
        AND ($2 IS NULL OR location = $2)
        AND ($3 IS NULL OR tags @> ARRAY[$3])
        AND ($4 IS NULL
          OR description ILIKE ''%%'' || $4 || ''%%''
          OR city ILIKE ''%%'' || $4 || ''%%''
          OR location ILIKE ''%%'' || $4 || ''%%'')
    ),
    counted AS (
      SELECT *, COUNT(*) OVER() AS total_count
      FROM filtered
      ORDER BY %I %s, created_at DESC
      LIMIT $5 OFFSET $6
    )
    SELECT jsonb_build_object(
      ''videos'', COALESCE(jsonb_agg(jsonb_build_object(
        ''id'', id,
        ''video_url'', video_url,
        ''video_id'', video_id,
        ''video_src'', video_src,
        ''category'', category,
        ''location'', location,
        ''city'', city,
        ''tags'', tags,
        ''description'', description,
        ''thumbnail_url'', thumbnail_url,
        ''video_post_date'', video_post_date,
        ''view_count'', view_count,
        ''status'', status,
        ''created_at'', created_at
      ) ORDER BY %I %s, created_at DESC), ''[]''::jsonb),
      ''total'', COALESCE((SELECT total_count FROM counted LIMIT 1), 0)
    ) FROM counted',
    v_sort_col, v_sort_dir, v_sort_col, v_sort_dir
  ) INTO result
  USING p_category, p_location, p_tag, p_query, p_per_page, v_offset;

  RETURN COALESCE(result, '{"videos":[],"total":0}'::jsonb);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_frontend_videos(text,text,text,text,text,int,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_frontend_videos(text,text,text,text,text,int,int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_frontend_category_videos(
  p_slugs text[],
  p_per_category int DEFAULT 4
)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT COALESCE(jsonb_object_agg(slug, videos), '{}'::jsonb)
  FROM (
    SELECT slugs.slug, COALESCE(sub.videos, '[]'::jsonb) AS videos
    FROM unnest(p_slugs) slugs(slug)
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(jsonb_build_object(
        'id', v.id,
        'video_url', v.video_url,
        'video_id', v.video_id,
        'video_src', v.video_src,
        'category', v.category,
        'location', v.location,
        'city', v.city,
        'tags', v.tags,
        'description', v.description,
        'thumbnail_url', v.thumbnail_url,
        'video_post_date', v.video_post_date,
        'view_count', v.view_count,
        'status', v.status,
        'created_at', v.created_at
      ) ORDER BY v.video_post_date DESC NULLS LAST, v.created_at DESC) AS videos
      FROM public.videos v
      WHERE v.status = 'published'
        AND v.category = slugs.slug
      LIMIT p_per_category
    ) sub ON true
  ) combined;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_frontend_category_videos(text[],int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_frontend_category_videos(text[],int) TO anon, authenticated;

-- ............................................................................
-- 7. Admin videos listing RPC — single pass with COUNT(*) OVER(), trashed support
-- ............................................................................
-- Replaces separate paginated SELECT + SELECT COUNT(*) with one query.
-- Supports trashed/exclude filter for the trashed videos view.

CREATE OR REPLACE FUNCTION public.get_videos_for_api(filters jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  status_filter   text := filters->>'status';
  search_query    text := filters->>'search';
  category_filter text := filters->>'category';
  location_filter text := filters->>'location';
  trashed_filter  text := filters->>'trashed';
  page_num        int  := COALESCE((filters->>'page')::int, 1);
  per_page        int  := COALESCE((filters->>'per_page')::int, 50);
  max_per_page    int  := 500;
  offset_count    int;
  result          jsonb;
BEGIN
  IF per_page > max_per_page THEN per_page := max_per_page; END IF;
  IF page_num < 1 THEN page_num := 1; END IF;
  offset_count := (page_num - 1) * per_page;

  WITH filtered AS (
    SELECT *
    FROM public.videos v
    WHERE
      CASE
        WHEN trashed_filter = 'only' THEN v.trashed_at IS NOT NULL
        ELSE v.trashed_at IS NULL
      END
      AND (NULLIF(status_filter, '') IS NULL OR v.status = status_filter)
      AND (NULLIF(category_filter, '') IS NULL OR v.category = category_filter)
      AND (NULLIF(location_filter, '') IS NULL OR v.location = location_filter)
      AND (NULLIF(search_query, '') IS NULL
        OR v.video_url ILIKE '%' || search_query || '%'
        OR v.video_id ILIKE '%' || search_query || '%'
        OR v.description ILIKE '%' || search_query || '%'
        OR v.city ILIKE '%' || search_query || '%')
  ),
  counted AS (
    SELECT filtered.*, COUNT(*) OVER() AS total_count
    FROM filtered
    ORDER BY
      CASE WHEN trashed_filter = 'only' THEN filtered.trashed_at END DESC NULLS LAST,
      filtered.created_at DESC
    LIMIT per_page
    OFFSET offset_count
  )
  SELECT jsonb_build_object(
    'data', COALESCE(jsonb_agg(row_to_json(t) ORDER BY
      CASE WHEN trashed_filter = 'only' THEN t.trashed_at END DESC NULLS LAST,
      t.created_at DESC), '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', page_num,
      'per_page', per_page,
      'total_count', COALESCE((SELECT total_count FROM counted LIMIT 1), 0),
      'total_pages', GREATEST(1, CEIL(COALESCE((SELECT total_count FROM counted LIMIT 1), 0)::float / per_page)::int),
      'has_next', (page_num * per_page) < COALESCE((SELECT total_count FROM counted LIMIT 1), 0),
      'has_previous', page_num > 1
    )
  ) INTO result
  FROM counted t;

  RETURN COALESCE(result, '{"data":[],"pagination":{"page":1,"per_page":50,"total_count":0,"total_pages":1,"has_next":false,"has_previous":false}}'::jsonb);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_videos_for_api(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_videos_for_api(jsonb) TO authenticated, anon;

-- ............................................................................
-- 8. Dashboard aggregate stats RPC — excludes trashed from status counts
-- ............................................................................
-- Replaces 60+ individual Supabase queries (5 status + 18 category + 37
-- location counts) with a single JSON response.
--
-- trashed_count is separate; status/category/location counts exclude trashed.

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT jsonb_build_object(
    'total_videos', (SELECT COUNT(*)::int FROM public.videos),
    'trashed_count', (SELECT COUNT(*)::int FROM public.videos WHERE trashed_at IS NOT NULL),
    'status_counts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('status', v.status, 'count', v.cnt) ORDER BY v.status)
      FROM (
        SELECT status, COUNT(*)::int AS cnt
        FROM public.videos
        WHERE trashed_at IS NULL
        GROUP BY status
      ) v
    ), '[]'::jsonb),
    'category_counts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('slug', v.category, 'count', v.cnt) ORDER BY v.cnt DESC)
      FROM (
        SELECT category, COUNT(*)::int AS cnt
        FROM public.videos
        WHERE category IS NOT NULL AND trashed_at IS NULL
        GROUP BY category
      ) v
    ), '[]'::jsonb),
    'location_counts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('slug', v.location, 'count', v.cnt) ORDER BY v.cnt DESC)
      FROM (
        SELECT location, COUNT(*)::int AS cnt
        FROM public.videos
        WHERE location IS NOT NULL AND trashed_at IS NULL
        GROUP BY location
      ) v
    ), '[]'::jsonb)
  );
$function$;

REVOKE EXECUTE ON FUNCTION public.get_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;

COMMIT;
