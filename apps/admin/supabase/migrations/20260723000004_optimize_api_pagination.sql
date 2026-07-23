-- Migration: Optimize RPC pagination and search performance
-- Date: 2026-07-23
-- Purpose:
--   1. Fix unbounded pagination in get_videos_for_api
--   2. Exclude trashed videos from results
--   3. Return total_count separately (not in each row)
--   4. Add optional category and location filters
--   5. Improve query performance with better WHERE conditions

-- ============================================================================
-- Improved get_videos_for_api RPC with pagination and trashing support
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_videos_for_api(filters jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  status_filter text := filters->>'status';
  search_query text := filters->>'search';
  category_filter text := filters->>'category';
  location_filter text := filters->>'location';
  page_num int := COALESCE((filters->>'page')::int, 1);
  per_page int := COALESCE((filters->>'per_page')::int, 50);
  max_per_page int := 500;  -- Safety limit to prevent abuse
  offset_count int;
  total_count_val bigint;
  result jsonb;
BEGIN
  -- =========================================================================
  -- Input Validation and Normalization
  -- =========================================================================
  
  -- Enforce maximum page size to prevent resource exhaustion
  IF per_page > max_per_page THEN
    per_page := max_per_page;
  END IF;
  
  -- Page number must be >= 1
  IF page_num < 1 THEN
    page_num := 1;
  END IF;
  
  offset_count := (page_num - 1) * per_page;
  
  -- =========================================================================
  -- Get total count (for pagination metadata)
  -- =========================================================================
  
  SELECT COUNT(*) INTO total_count_val
  FROM public.videos v
  WHERE 
    -- Exclude trashed videos
    v.trashed_at IS NULL
    -- Status filter
    AND (NULLIF(status_filter, '') IS NULL OR v.status = status_filter)
    -- Category filter
    AND (NULLIF(category_filter, '') IS NULL OR v.category = category_filter)
    -- Location filter
    AND (NULLIF(location_filter, '') IS NULL OR v.location = location_filter)
    -- Search filter (multi-column search)
    AND (
      NULLIF(search_query, '') IS NULL
      OR v.video_url ILIKE '%' || search_query || '%'
      OR v.video_id ILIKE '%' || search_query || '%'
      OR v.description ILIKE '%' || search_query || '%'
      OR v.city ILIKE '%' || search_query || '%'
    );
  
  -- =========================================================================
  -- Get paginated results with metadata
  -- =========================================================================
  
  SELECT jsonb_build_object(
    'data', COALESCE(videos_data, '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', page_num,
      'per_page', per_page,
      'total_count', total_count_val,
      'total_pages', CEIL(total_count_val::float / per_page)::int,
      'has_next', (page_num * per_page) < total_count_val,
      'has_previous', page_num > 1
    )
  ) INTO result
  FROM (
    SELECT COALESCE(JSONB_AGG(row_to_json(t) ORDER BY t.created_at DESC), '[]'::jsonb) AS videos_data
    FROM (
      SELECT
        v.id, 
        v.video_url, 
        v.video_id, 
        v.video_src, 
        v.category, 
        v.location, 
        v.city, 
        v.tags,
        v.description, 
        v.thumbnail_url, 
        v.video_post_date,
        v.view_count,
        v.status, 
        v.created_at, 
        v.updated_at,
        c.name AS category_name, 
        c.color AS category_color
      FROM public.videos v
      LEFT JOIN public.categories c ON c.value = v.category
      WHERE 
        -- Exclude trashed videos
        v.trashed_at IS NULL
        -- Status filter
        AND (NULLIF(status_filter, '') IS NULL OR v.status = status_filter)
        -- Category filter
        AND (NULLIF(category_filter, '') IS NULL OR v.category = category_filter)
        -- Location filter
        AND (NULLIF(location_filter, '') IS NULL OR v.location = location_filter)
        -- Search filter (multi-column search)
        AND (
          NULLIF(search_query, '') IS NULL
          OR v.video_url ILIKE '%' || search_query || '%'
          OR v.video_id ILIKE '%' || search_query || '%'
          OR v.description ILIKE '%' || search_query || '%'
          OR v.city ILIKE '%' || search_query || '%'
        )
      ORDER BY v.created_at DESC
      LIMIT per_page
      OFFSET offset_count
    ) t
  ) subquery;
  
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_videos_for_api(jsonb) TO authenticated, anon;

-- ============================================================================
-- Documentation for improved pagination
-- ============================================================================
--
-- OLD USAGE (returns total_count in each row):
--   SELECT get_videos_for_api('{"status": "published", "page": 1, "per_page": 20}');
--
-- NEW USAGE (returns separate pagination metadata):
--   SELECT get_videos_for_api('{
--     "status": "published",
--     "category": "protests",
--     "location": "maharashtra",
--     "search": "farmers",
--     "page": 1,
--     "per_page": 20
--   }');
--
-- RESPONSE FORMAT:
--   {
--     "data": [ { video object }, ... ],
--     "pagination": {
--       "page": 1,
--       "per_page": 20,
--       "total_count": 150,
--       "total_pages": 8,
--       "has_next": true,
--       "has_previous": false
--     }
--   }
--
-- SAFETY FEATURES:
--   - per_page capped at 500 to prevent abuse
--   - Trashed videos automatically excluded
--   - Invalid filters gracefully ignored
--   - Page number normalized to >= 1

COMMIT;
