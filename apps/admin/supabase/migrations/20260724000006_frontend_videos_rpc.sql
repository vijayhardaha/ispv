-- ============================================================================
-- RPC: get_frontend_videos — paginated, filtered, sorted public videos
-- ============================================================================
-- Single RPC to replace the Supabase JS query chain in getPublishedVideos.
-- Avoids PostgREST overhead, uses COUNT(*) OVER for the total count (no
-- separate scan), and uses dynamic SQL with safe %I quoting for ORDER BY.
-- ============================================================================

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

  -- Build the aggregate JSON result using dynamic ORDER BY
  -- %I safely quotes the column identifier; v_sort_dir contains only
  -- literal SQL fragments we control.
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

-- ============================================================================
-- RPC: get_frontend_category_videos — batch category-section video fetch
-- ============================================================================
-- Fetches up to `per_category` published videos for each given category slug.
-- Uses a LATERAL join for clean per-category limiting, returns a JSON object
-- keyed by slug. Replaces getCategorySectionVideos.
-- ============================================================================

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

COMMIT;
