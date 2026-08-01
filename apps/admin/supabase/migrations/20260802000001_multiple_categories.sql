-- ============================================================================
-- Multiple categories per video — videos.categories text[] replaces category
-- ============================================================================
-- Converts the single-category videos.category text column into a text[]
-- categories array so each video can belong to several categories at once.
--
-- Changes:
--   1. Add categories text[], backfill from category, drop the old column.
--   2. Replace btree category indexes with a GIN index on categories.
--   3. Rewrite every RPC that referenced the category column:
--        get_videos_for_api (admin list + sort + filter)
--        submit_video (public/auth submission)
--        get_frontend_videos, get_frontend_category_videos
--        get_category_counts, get_dashboard_stats
-- ============================================================================

-- ............................................................................
-- 1. Column migration
-- ............................................................................

ALTER TABLE public.videos
  ADD COLUMN categories text[];

UPDATE public.videos
SET categories = ARRAY[category]
WHERE category IS NOT NULL;

ALTER TABLE public.videos
  DROP COLUMN category;

-- ............................................................................
-- 2. Indexes — GIN on the array for $1 = ANY(categories) lookups
-- ............................................................................

DROP INDEX IF EXISTS public.idx_videos_category;
DROP INDEX IF EXISTS public.idx_videos_status_category_created;
DROP INDEX IF EXISTS public.idx_videos_status_category_post;

CREATE INDEX idx_videos_categories_gin ON public.videos USING GIN (categories);

-- ............................................................................
-- 3. Admin list RPC — category filter matches any array element
-- ............................................................................

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
    WHEN 'category' THEN sort_col := 'categories';
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
        AND (NULLIF($3, '''') IS NULL OR $3 = ANY(v.categories))
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
-- 4. submit_video — single p_category stored as a one-element array
-- ............................................................................

CREATE OR REPLACE FUNCTION public.submit_video(
  p_video_url text,
  p_video_id text DEFAULT NULL,
  p_video_src text DEFAULT 'instagram',
  p_tags text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_video_post_date timestamptz DEFAULT NULL,
  p_thumbnail_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  result jsonb;
BEGIN
  IF p_video_id IS NOT NULL THEN
    SELECT id INTO existing_id FROM public.videos WHERE video_id = p_video_id LIMIT 1;
  END IF;

  IF existing_id IS NULL THEN
    SELECT id INTO existing_id FROM public.videos WHERE video_url = p_video_url LIMIT 1;
  END IF;

  IF existing_id IS NOT NULL THEN
    UPDATE public.videos SET
      video_id        = COALESCE(p_video_id, video_id),
      video_src       = COALESCE(p_video_src, video_src),
      video_post_date = COALESCE(p_video_post_date, video_post_date),
      thumbnail_url   = COALESCE(p_thumbnail_url, thumbnail_url),
      tags            = CASE WHEN tags IS NULL AND p_tags IS NOT NULL THEN string_to_array(p_tags, ',') ELSE tags END,
      categories      = COALESCE(categories, CASE WHEN p_category IS NOT NULL THEN ARRAY[p_category] ELSE NULL END),
      location        = COALESCE(location, p_location),
      city            = COALESCE(city, p_city)
    WHERE id = existing_id;

    SELECT row_to_json(v) INTO result FROM public.videos v WHERE id = existing_id;
    RETURN result;
  END IF;

  INSERT INTO public.videos (video_url, video_id, video_src, tags, categories, location, city, video_post_date, thumbnail_url)
  VALUES (p_video_url, p_video_id, p_video_src,
    CASE WHEN p_tags IS NOT NULL THEN string_to_array(p_tags, ',') ELSE NULL END,
    CASE WHEN p_category IS NOT NULL THEN ARRAY[p_category] ELSE NULL END,
    p_location, p_city, p_video_post_date, p_thumbnail_url)
  RETURNING row_to_json(videos) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_video(text, text, text, text, text, text, text, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_video(text, text, text, text, text, text, text, timestamptz, text) TO authenticated;

-- ............................................................................
-- 5. Frontend listing RPCs — filter/project the categories array
-- ............................................................................

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
        AND ($1 IS NULL OR $1 = ANY(categories))
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
        ''categories'', categories,
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
        'categories', v.categories,
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
        AND slugs.slug = ANY(v.categories)
      LIMIT p_per_category
    ) sub ON true
  ) combined;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_frontend_category_videos(text[],int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_frontend_category_videos(text[],int) TO anon, authenticated;

-- ............................................................................
-- 6. Count RPCs — unnest the categories array
-- ............................................................................

CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE (slug text, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT unnest(categories) AS slug, COUNT(*)::bigint AS count
  FROM public.videos
  WHERE status = 'published' AND categories IS NOT NULL
  GROUP BY 1
  ORDER BY count DESC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_category_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_category_counts() TO anon, authenticated;

-- ............................................................................
-- 7. Dashboard stats — category counts from the un-nested array
-- ............................................................................

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
      SELECT jsonb_agg(jsonb_build_object('slug', c.slug, 'count', c.cnt) ORDER BY c.cnt DESC)
      FROM (
        SELECT unnest(categories) AS slug, COUNT(*)::int AS cnt
        FROM public.videos
        WHERE categories IS NOT NULL AND trashed_at IS NULL
        GROUP BY 1
      ) c
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
