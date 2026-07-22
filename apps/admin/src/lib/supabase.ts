import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase browser client for client-side usage.
 *
 * @returns {ReturnType<typeof createBrowserClient>} Configured browser client.
 */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
