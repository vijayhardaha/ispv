-- ============================================================================
-- Optimize get_videos_for_api — narrow projection + targeted partial indexes
-- ============================================================================
-- Why this is slow:
--   1. The filtered CTE used SELECT * on every matching row, and the
--      COUNT(*) OVER() window forced Postgres to materialize ALL matching
--      rows (heavy text columns like description, thumbnail_url, tags) just
--      to compute the total — even though only per_page (15) rows are shown.
--   2. row_to_json(t) serialized the window's total_count column into every
--      data row, inflating the payload.
--   3. The new sort columns (updated_at, video_post_date) had no index
--      matching the `trashed_at IS NULL + ORDER BY col DESC NULLS LAST`
--      admin-list pattern, forcing a full sort.
--
-- Fixes:
--   - Narrow count/sort pass: only id, the sort key, and created_at are
--     scanned and sorted to compute the page + total_count.
--   - Join back to the full video rows ONLY for the returned page.
--   - Use %I for the whitelisted sort column and %s for the fixed direction.
--   - Drop the leaked total_count column from data rows (VideoRecord has no
--     such field — it was an accidental extra key).
--   - Partial indexes on the uncovered admin sort columns for the active
--     (non-trashed) list, which is the common case. The default created_at
--     ordering is already covered by idx_videos_admin_list.

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
  sort_dir_sql    text;
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

  sort_dir_sql := CASE WHEN sort_dir = 'asc' THEN 'ASC NULLS LAST' ELSE 'DESC NULLS LAST' END;

  EXECUTE format(
    'WITH filtered AS (
      SELECT v.id, v.%1$I AS sort_key, v.created_at
      FROM public.videos v
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
      SELECT id, sort_key, created_at, COUNT(*) OVER() AS total_count
      FROM filtered
      ORDER BY sort_key %2$s, created_at DESC
      LIMIT $6 OFFSET $7
    )
    SELECT jsonb_build_object(
      ''data'', COALESCE((
        SELECT jsonb_agg(row_to_json(p) ORDER BY c.sort_key %2$s, p.created_at DESC)
        FROM counted c
        JOIN public.videos p ON p.id = c.id
      ), ''[]''::jsonb),
      ''pagination'', jsonb_build_object(
        ''page'', $8,
        ''per_page'', $9,
        ''total_count'', COALESCE((SELECT total_count FROM counted LIMIT 1), 0),
        ''total_pages'', GREATEST(1, CEIL(COALESCE((SELECT total_count FROM counted LIMIT 1), 0)::float / $9)::int),
        ''has_next'', ($8 * $9) < COALESCE((SELECT total_count FROM counted LIMIT 1), 0),
        ''has_previous'', $8 > 1
      )
    )',
    sort_col, sort_dir_sql
  ) INTO result
  USING trashed_filter, status_filter, category_filter, location_filter, search_query, per_page, offset_count, page_num, per_page;

  RETURN COALESCE(result, '{"data":[],"pagination":{"page":1,"per_page":50,"total_count":0,"total_pages":1,"has_next":false,"has_previous":false}}'::jsonb);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_videos_for_api(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_videos_for_api(jsonb) TO authenticated, anon;

-- ............................................................................
-- Partial indexes for admin sort columns on the active (non-trashed) list.
-- created_at is covered by idx_videos_admin_list (trashed_at, status,
-- created_at DESC); these cover the remaining sortable timestamp columns.
-- ............................................................................

CREATE INDEX IF NOT EXISTS idx_videos_admin_updated_active
  ON public.videos (updated_at DESC NULLS LAST, created_at DESC)
  WHERE trashed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_videos_admin_posted_active
  ON public.videos (video_post_date DESC NULLS LAST, created_at DESC)
  WHERE trashed_at IS NULL;

COMMIT;
