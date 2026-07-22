CREATE OR REPLACE FUNCTION public.increment_video_view(p_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.videos
  SET view_count = view_count + 1
  WHERE id = p_video_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_video_view TO anon;
