-- ============================================================================
-- submit_video accepts multiple categories (p_categories text[])
-- ============================================================================
-- Extends the public submission RPC so callers can pass up to three category
-- slugs. The legacy single p_category argument remains for backward
-- compatibility: when p_categories is null/empty, p_category is used.
--
-- Changes:
--   1. Rewrite submit_video with an added p_categories text[] DEFAULT NULL.
--   2. Grant the new function signature to authenticated, anon, service_role.

CREATE OR REPLACE FUNCTION public.submit_video(
  p_video_url text,
  p_video_id text DEFAULT NULL,
  p_video_src text DEFAULT 'instagram',
  p_tags text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_video_post_date timestamptz DEFAULT NULL,
  p_thumbnail_url text DEFAULT NULL,
  p_categories text[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  result jsonb;
  v_categories text[];
BEGIN
  v_categories := COALESCE(NULLIF(p_categories, '{}'), CASE WHEN p_category IS NOT NULL THEN ARRAY[p_category] ELSE NULL END);

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
      categories      = COALESCE(categories, v_categories),
      location        = COALESCE(location, p_location),
      city            = COALESCE(city, p_city)
    WHERE id = existing_id;

    SELECT row_to_json(v) INTO result FROM public.videos v WHERE id = existing_id;
    RETURN result;
  END IF;

  INSERT INTO public.videos (video_url, video_id, video_src, tags, categories, location, city, video_post_date, thumbnail_url)
  VALUES (p_video_url, p_video_id, p_video_src,
    CASE WHEN p_tags IS NOT NULL THEN string_to_array(p_tags, ',') ELSE NULL END,
    v_categories,
    p_location, p_city, p_video_post_date, p_thumbnail_url)
  RETURNING row_to_json(videos) INTO result;

  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_video(text, text, text, text, text, text, text, timestamptz, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_video(text, text, text, text, text, text, text, timestamptz, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_video(text, text, text, text, text, text, text, timestamptz, text, text[]) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_video(text, text, text, text, text, text, text, timestamptz, text, text[]) TO service_role;

COMMIT;
