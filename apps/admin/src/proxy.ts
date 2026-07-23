import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Middleware that enforces authentication on all routes except /login and public API endpoints.
 *
 * The `@supabase/ssr` client refreshes the session automatically when `getUser()` is
 * called with an expired access token. For the refreshed tokens to persist across
 * requests, the `set` callback MUST write the new cookies onto the response object.
 *
 * - Page routes (non-API): redirect to /login if unauthenticated
 * - API routes: return 401 JSON if unauthenticated
 * - /api/submit, /api/enrich, /api/views: public (bypass auth check)
 *
 * @param {NextRequest} req - Incoming request to evaluate.
 *
 * @returns {Promise<NextResponse>} Response, redirect, or passthrough.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Build the response early so Supabase can write session cookies onto it.
  let response = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update the request (for downstream middleware logic) and the response
          // (so the browser receives the Set-Cookie header).
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: req });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: req });
          response.cookies.set({ name, value: '', ...options });
        },
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Allow public endpoints through without auth
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // Allow static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/uploads')) {
    return response;
  }

  // Check for Supabase session — triggers refresh if access token is expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return response;
}

/**
 * Routes that bypass authentication entirely.
 */
const PUBLIC_PATHS = ['/login', '/api/submit', '/api/enrich', '/api/views'];

/**
 * Next.js middleware matcher config — runs on all routes except static assets.
 */
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
