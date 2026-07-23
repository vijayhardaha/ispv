ALTER TABLE public.videos ADD COLUMN color text;

CREATE OR REPLACE FUNCTION public.get_videos_for_api(filters jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  status_filter text := filters->>'status';
  search_query text := filters->>'search';
  page_num int := COALESCE((filters->>'page')::int, 1);
  per_page int := COALESCE((filters->>'per_page')::int, 50);
  offset_count int := (page_num - 1) * per_page;
  result jsonb;
BEGIN
  SELECT COALESCE(JSONB_AGG(row_to_json(t)), '[]'::jsonb) INTO result
  FROM (
    SELECT
      v.id, v.ig_url, v.ig_id, v.src, v.category, v.state, v.city, v.tags,
      v.description, v.thumbnail_url, v.ig_post_date,
      v.status, v.created_at, v.updated_at,
      v.submitted_tags, v.submitted_category, v.submitted_state, v.submitted_city,
      c.name AS category_name, c.color AS category_color,
      COUNT(*) OVER() AS total_count
    FROM public.videos v
    LEFT JOIN public.categories c ON c.value = v.category
    WHERE (NULLIF(status_filter, '') IS NULL OR v.status = status_filter)
      AND (NULLIF(search_query, '') IS NULL
        OR v.ig_url ILIKE '%' || search_query || '%'
        OR v.ig_id ILIKE '%' || search_query || '%'
        OR v.description ILIKE '%' || search_query || '%'
        OR v.city ILIKE '%' || search_query || '%'
        OR v.tags::text ILIKE '%' || search_query || '%')
    ORDER BY v.created_at DESC
    LIMIT per_page
    OFFSET offset_count
  ) t;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_videos_for_api TO authenticated, anon;
