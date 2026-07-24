-- ============================================================================
-- RPCs: City & Location Counts for Published Videos
-- ============================================================================

-- ............................................................................
-- get_city_counts – unique cities with video count, ordered by count desc
-- ............................................................................
CREATE OR REPLACE FUNCTION public.get_city_counts()
RETURNS TABLE (city text, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT v.city, COUNT(*)::bigint AS count
  FROM public.videos v
  WHERE v.status = 'published' AND v.city IS NOT NULL
  GROUP BY v.city
  ORDER BY count DESC, v.city ASC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_city_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_city_counts() TO anon, authenticated;

-- ............................................................................
-- get_location_counts – unique locations with video count, ordered by count desc
-- ............................................................................
CREATE OR REPLACE FUNCTION public.get_location_counts()
RETURNS TABLE (location text, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT v.location, COUNT(*)::bigint AS count
  FROM public.videos v
  WHERE v.status = 'published' AND v.location IS NOT NULL
  GROUP BY v.location
  ORDER BY count DESC, v.location ASC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_location_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_location_counts() TO anon, authenticated;

-- ............................................................................
-- get_published_video_count – total count of published videos
-- ............................................................................
CREATE OR REPLACE FUNCTION public.get_published_video_count()
RETURNS bigint
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT COUNT(*)::bigint
  FROM public.videos v
  WHERE v.status = 'published';
$function$;

REVOKE EXECUTE ON FUNCTION public.get_published_video_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_published_video_count() TO anon, authenticated;

-- ............................................................................
-- get_category_counts – unique categories with video count, ordered by count desc
-- ............................................................................
CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS TABLE (slug text, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT v.category, COUNT(*)::bigint AS count
  FROM public.videos v
  WHERE v.status = 'published' AND v.category IS NOT NULL
  GROUP BY v.category
  ORDER BY count DESC;
$function$;

REVOKE EXECUTE ON FUNCTION public.get_category_counts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_category_counts() TO anon, authenticated;

COMMIT;
