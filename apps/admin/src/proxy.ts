import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Adds common security headers to a response object.
 *
 * @param {NextResponse} res - Response to add headers to.
 *
 * @returns {NextResponse} The response with security headers attached.
 */
function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

/** Maximum request body size in bytes (100 KB) for API requests. */
const MAX_BODY_BYTES = 100_000;

/**
 * Routes that bypass authentication entirely.
 */
const PUBLIC_PATHS = ['/login', '/api/public', '/api/auth/enrich'];

/**
 * Next.js middleware matcher config — runs on all routes except static assets.
 */
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };

/**
 * Middleware that enforces authentication on all routes except /login and public API endpoints.
 *
 * The `@supabase/ssr` client refreshes the session automatically when `getUser()` is
 * called with an expired access token. For the refreshed tokens to persist across
 * requests, the `set` callback MUST write the new cookies onto the response object.
 *
 * - Page routes (non-API): redirect to /login if unauthenticated
 * - API routes: return 401 JSON if unauthenticated
 * - /api/public/*: public (bypass auth check)
 * - /api/auth/enrich: public (self-authenticates via Bearer token)
 *
 * @param {NextRequest} req - Incoming request to evaluate.
 *
 * @returns {Promise<NextResponse>} Response, redirect, or passthrough.
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Build the response early so Supabase can write session cookies onto it.
  let response = NextResponse.next({ request: { headers: req.headers } });

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return req.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        req.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      });
      // Rebuild response so downstream middleware sees updated cookies
      response = NextResponse.next({ request: req });
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set({ name, value, ...options });
      });
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );

  // Apply security headers to all responses
  response = addSecurityHeaders(response);

  // Enforce maximum request body size for non-GET requests to API routes
  if (pathname.startsWith('/api/') && req.method !== 'GET') {
    const contentLength = req.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return addSecurityHeaders(NextResponse.json({ error: 'Request body too large' }, { status: 413 }));
    }
  }

  // Allow public endpoints through without auth
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (req.method === 'OPTIONS') {
      return addSecurityHeaders(
        new NextResponse(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        })
      );
    }
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return addSecurityHeaders(response);
  }

  // Allow static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/uploads')) {
    return addSecurityHeaders(response);
  }

  // CSRF protection: validate Origin header for state-changing requests
  // Prevents a malicious site from using an authenticated admin's session cookie
  // to make cross-origin POST/PUT/DELETE requests against internal API routes.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host && !origin.includes(host)) {
      return addSecurityHeaders(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
    }
  }

  // Check for Supabase session — triggers refresh if access token is expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return addSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }
    return addSecurityHeaders(NextResponse.redirect(new URL('/login', req.url)));
  }

  return addSecurityHeaders(response);
}
