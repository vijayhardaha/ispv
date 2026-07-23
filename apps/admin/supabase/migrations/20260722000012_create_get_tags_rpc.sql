-- Returns published video tags with occurrence counts, sorted by frequency descending.
CREATE OR REPLACE FUNCTION public.get_tags()
RETURNS TABLE (tag text, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT unnest(tags) AS tag, COUNT(*)::bigint AS count
  FROM public.videos
  WHERE status = 'published' AND tags IS NOT NULL
  GROUP BY tag
  ORDER BY count DESC, tag ASC;
$$;
