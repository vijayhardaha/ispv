CREATE OR REPLACE FUNCTION public.submit_video(
  p_ig_url text,
  p_tags text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_city text DEFAULT NULL
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
  -- Check if already exists
  SELECT id INTO existing_id FROM public.videos WHERE ig_url = p_ig_url LIMIT 1;

  IF existing_id IS NOT NULL THEN
    UPDATE public.videos SET
      submitted_tags = COALESCE(p_tags, submitted_tags),
      submitted_category = COALESCE(p_category, submitted_category),
      submitted_state = COALESCE(p_state, submitted_state),
      submitted_city = COALESCE(p_city, submitted_city)
    WHERE id = existing_id;

    SELECT row_to_json(v) INTO result FROM public.videos v WHERE id = existing_id;
    RETURN result;
  END IF;

  INSERT INTO public.videos (ig_url, submitted_tags, submitted_category, submitted_state, submitted_city)
  VALUES (p_ig_url, p_tags, p_category, p_state, p_city)
  RETURNING row_to_json(videos) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_video TO anon;
