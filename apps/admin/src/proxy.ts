import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Middleware that enforces authentication on all routes except /login and public API endpoints.
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

  // Allow public endpoints through without auth
  const PUBLIC_PATHS = ['/login', '/api/submit', '/api/enrich', '/api/views'];
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
    const res = NextResponse.next();
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  }

  // Allow static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Check for Supabase session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // middleware cannot set cookies (handled by server actions)
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

/**
 * Next.js middleware matcher config — runs on all routes except static assets.
 */
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
