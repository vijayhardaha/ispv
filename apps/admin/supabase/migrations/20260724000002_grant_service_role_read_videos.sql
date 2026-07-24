-- Fix permission denied on public.videos for service_role clients.
-- Public API routes like /api/public/check-video use createServiceSupabase(),
-- which authenticates as service_role. That role needs explicit table grants.

GRANT SELECT ON public.videos TO service_role;
