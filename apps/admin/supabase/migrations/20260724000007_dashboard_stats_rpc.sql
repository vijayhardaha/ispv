-- ============================================================================
-- RPC: get_dashboard_stats — aggregated dashboard data
-- ============================================================================
-- Replaces 60+ individual Supabase queries (5 status + 18 category + 37
-- location count queries) with a single JSON response.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT jsonb_build_object(
    'total_videos', (SELECT COUNT(*)::int FROM public.videos),
    'status_counts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('status', v.status, 'count', v.cnt) ORDER BY v.status)
      FROM (SELECT status, COUNT(*)::int AS cnt FROM public.videos GROUP BY status) v
    ), '[]'::jsonb),
    'category_counts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('slug', v.category, 'count', v.cnt) ORDER BY v.cnt DESC)
      FROM (SELECT category, COUNT(*)::int AS cnt FROM public.videos WHERE category IS NOT NULL GROUP BY category) v
    ), '[]'::jsonb),
    'location_counts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('slug', v.location, 'count', v.cnt) ORDER BY v.cnt DESC)
      FROM (SELECT location, COUNT(*)::int AS cnt FROM public.videos WHERE location IS NOT NULL GROUP BY location) v
    ), '[]'::jsonb)
  );
$function$;

REVOKE EXECUTE ON FUNCTION public.get_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;

COMMIT;
