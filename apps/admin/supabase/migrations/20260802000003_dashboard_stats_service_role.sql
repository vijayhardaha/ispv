-- ============================================================================
-- Allow service_role to execute get_dashboard_stats
-- ============================================================================
-- The admin dashboard caches get_dashboard_stats via unstable_cache. The cached
-- callback must not read request-scope cookies(), so it uses the service-role
-- client instead of the cookie-based server client. This mirrors the existing
-- service_role grant for submit_video and increment_video_view.

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO service_role;

COMMIT;
