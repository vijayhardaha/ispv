-- ============================================================================
-- Fix get_videos_for_api — correct CTE alias references
-- ============================================================================
-- The original v. prefix inside the counted CTE referenced a table alias
-- that is scoped inside the filtered CTE and not visible outside it.
-- Replaced with filtered.* and filtered.column references.
-- ============================================================================

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

COMMIT;
