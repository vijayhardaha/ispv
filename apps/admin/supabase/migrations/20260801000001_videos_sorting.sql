-- ============================================================================
-- Admin videos sorting — add sort_by / sort_dir support to get_videos_for_api
-- ============================================================================
-- Replaces get_videos_for_api so the admin videos table can be sorted by
-- column via URL params (sort_by / sort_dir) instead of the hardcoded
-- created_at ordering. Column keys are whitelisted in a CASE expression to
-- prevent SQL injection through the dynamic ORDER BY.
--
-- Defaults preserved: non-trashed list sorts by created_at DESC, trashed
-- list sorts by trashed_at DESC, unless sort_by is explicitly provided.

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
  sort_by         text := lower(COALESCE(filters->>'sort_by', CASE WHEN filters->>'trashed' = 'only' THEN 'trashed' ELSE 'created' END));
  sort_dir        text := lower(COALESCE(filters->>'sort_dir', 'desc'));
  page_num        int  := COALESCE((filters->>'page')::int, 1);
  per_page        int  := COALESCE((filters->>'per_page')::int, 50);
  max_per_page    int  := 500;
  offset_count    int;
  sort_col        text;
  sort_sql        text;
  result          jsonb;
BEGIN
  IF per_page > max_per_page THEN per_page := max_per_page; END IF;
  IF page_num < 1 THEN page_num := 1; END IF;
  offset_count := (page_num - 1) * per_page;

  -- Whitelist sort columns; anything unknown falls back to created_at.
  CASE sort_by
    WHEN 'status' THEN sort_col := 'status';
    WHEN 'created' THEN sort_col := 'created_at';
    WHEN 'updated' THEN sort_col := 'updated_at';
    WHEN 'posted' THEN sort_col := 'video_post_date';
    WHEN 'city' THEN sort_col := 'city';
    WHEN 'category' THEN sort_col := 'category';
    WHEN 'location' THEN sort_col := 'location';
    WHEN 'trashed' THEN sort_col := 'trashed_at';
    ELSE sort_col := 'created_at';
  END CASE;

  sort_sql := sort_col || CASE WHEN sort_dir = 'asc' THEN ' ASC NULLS LAST' ELSE ' DESC NULLS LAST' END;

  EXECUTE format(
    'WITH filtered AS (
      SELECT * FROM public.videos v
      WHERE
        CASE
          WHEN $1 = ''only'' THEN v.trashed_at IS NOT NULL
          ELSE v.trashed_at IS NULL
        END
        AND (NULLIF($2, '''') IS NULL OR v.status = $2)
        AND (NULLIF($3, '''') IS NULL OR v.category = $3)
        AND (NULLIF($4, '''') IS NULL OR v.location = $4)
        AND (NULLIF($5, '''') IS NULL
          OR v.video_url ILIKE ''%%'' || $5 || ''%%''
          OR v.video_id ILIKE ''%%'' || $5 || ''%%''
          OR v.description ILIKE ''%%'' || $5 || ''%%''
          OR v.city ILIKE ''%%'' || $5 || ''%%'')
    ),
    counted AS (
      SELECT filtered.*, COUNT(*) OVER() AS total_count
      FROM filtered
      ORDER BY %s, filtered.created_at DESC
      LIMIT $6 OFFSET $7
    )
    SELECT jsonb_build_object(
      ''data'', COALESCE(jsonb_agg(row_to_json(t) ORDER BY %s, t.created_at DESC), ''[]''::jsonb),
      ''pagination'', jsonb_build_object(
        ''page'', $8,
        ''per_page'', $9,
        ''total_count'', COALESCE((SELECT total_count FROM counted LIMIT 1), 0),
        ''total_pages'', GREATEST(1, CEIL(COALESCE((SELECT total_count FROM counted LIMIT 1), 0)::float / $9)::int),
        ''has_next'', ($8 * $9) < COALESCE((SELECT total_count FROM counted LIMIT 1), 0),
        ''has_previous'', $8 > 1
      )
    ) FROM counted t',
    sort_sql, sort_sql
  ) INTO result
  USING trashed_filter, status_filter, category_filter, location_filter, search_query, per_page, offset_count, page_num, per_page;

  RETURN COALESCE(result, '{"data":[],"pagination":{"page":1,"per_page":50,"total_count":0,"total_pages":1,"has_next":false,"has_previous":false}}'::jsonb);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_videos_for_api(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_videos_for_api(jsonb) TO authenticated, anon;
