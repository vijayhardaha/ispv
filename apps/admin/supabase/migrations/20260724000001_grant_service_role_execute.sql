-- Grant EXECUTE on functions called by the service_role via public API routes.
-- The initial migration revoked EXECUTE from PUBLIC and granted it only to
-- authenticated. Public submission and view-count endpoints use the service
-- role key (createServiceSupabase), so they need explicit EXECUTE permission.

GRANT EXECUTE
  ON FUNCTION public.submit_video(text, text, text, text, text, text, text, timestamptz, text)
  TO service_role;

GRANT EXECUTE
  ON FUNCTION public.increment_video_view(uuid)
  TO service_role;
