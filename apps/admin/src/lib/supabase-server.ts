import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase server client with cookie-based auth for server components.
 *
 * @returns {Promise<ReturnType<typeof createServerClient>>} Configured server client.
 */
export const createServerSupabase = async (): Promise<ReturnType<typeof createServerClient>> => {
  const cookieStore = await cookies();
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch {
        // Called from a Server Component where cookies() is read-only.
        // Session refresh is handled by middleware on the next request.
      }
    },
  };
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: cookieMethods,
  });
};
