-- ============================================================================
-- RPC: Homepage aggregate stats
-- ============================================================================
-- Replaces 4 separate queries (published count, city count, location count,
-- location counts) with a single JSON response. The homepage server component
-- calls this once instead of 4 parallel RPCs.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_homepage_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT jsonb_build_object(
    'total_videos',  (SELECT COUNT(*)::int FROM public.videos WHERE status = 'published'),
    'total_cities',  (SELECT COUNT(DISTINCT city)::int FROM public.videos WHERE status = 'published' AND city IS NOT NULL),
    'total_locations', (SELECT COUNT(DISTINCT location)::int FROM public.videos WHERE status = 'published' AND location IS NOT NULL),
    'location_counts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('slug', v.location, 'count', v.cnt) ORDER BY v.cnt DESC)
      FROM (SELECT location, COUNT(*)::int AS cnt FROM public.videos WHERE status = 'published' AND location IS NOT NULL GROUP BY location) v
    ), '[]'::jsonb)
  );
$function$;

REVOKE EXECUTE ON FUNCTION public.get_homepage_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_homepage_stats() TO anon, authenticated;

COMMIT;
