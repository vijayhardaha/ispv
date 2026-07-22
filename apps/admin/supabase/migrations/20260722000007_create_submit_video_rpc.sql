CREATE OR REPLACE FUNCTION public.submit_video(
  p_ig_url text,
  p_ig_id text DEFAULT NULL,
  p_src text DEFAULT 'instagram',
  p_tags text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_ig_post_date timestamptz DEFAULT NULL,
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
  IF p_ig_id IS NOT NULL THEN
    SELECT id INTO existing_id FROM public.videos WHERE ig_id = p_ig_id LIMIT 1;
  END IF;

  IF existing_id IS NULL THEN
    SELECT id INTO existing_id FROM public.videos WHERE ig_url = p_ig_url LIMIT 1;
  END IF;

  IF existing_id IS NOT NULL THEN
    UPDATE public.videos SET
      ig_id = COALESCE(p_ig_id, ig_id),
      src = COALESCE(p_src, src),
      submitted_tags = COALESCE(p_tags, submitted_tags),
      submitted_category = COALESCE(p_category, submitted_category),
      submitted_state = COALESCE(p_state, submitted_state),
      submitted_city = COALESCE(p_city, submitted_city),
      ig_post_date = COALESCE(p_ig_post_date, ig_post_date),
      thumbnail_url = COALESCE(p_thumbnail_url, thumbnail_url)
    WHERE id = existing_id;

    SELECT row_to_json(v) INTO result FROM public.videos v WHERE id = existing_id;
    RETURN result;
  END IF;

  INSERT INTO public.videos (ig_url, ig_id, src, submitted_tags, submitted_category, submitted_state, submitted_city, ig_post_date, thumbnail_url)
  VALUES (p_ig_url, p_ig_id, p_src, p_tags, p_category, p_state, p_city, p_ig_post_date, p_thumbnail_url)
  RETURNING row_to_json(videos) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_video TO anon;
