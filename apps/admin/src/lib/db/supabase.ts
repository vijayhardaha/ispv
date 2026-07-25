import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase browser client for client-side usage.
 *
 * @returns {ReturnType<typeof createBrowserClient>} Configured browser client.
 */
export const createClient = (): ReturnType<typeof createBrowserClient> => {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
};
