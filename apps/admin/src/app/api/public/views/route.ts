/** Run on Edge Runtime for faster cold starts and global availability. */
export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { tryUseUpstashRateLimit } from '@/lib/rateLimit';

/**
 * Lightweight rate limiter for view increments. Views are higher-volume so limits are higher.
 */
const inMemoryViews = new Map<string, { count: number; resetAt: number }>();

/**
 * Extracts the client IP from forwarded headers.
 *
 * @param {Request} req - Incoming request.
 *
 * @returns {string} IP address string.
 */
function getIpKey(req: Request) {
  // Prefer x-real-ip (set by edge/CDN) over x-forwarded-for (can be spoofed)
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown';
  return ip.split(',')[0].trim();
}

/**
 * Checks whether a request is within the in-memory rate limit.
 *
 * @param {string} key - Rate-limit key (usually IP-based).
 * @param {number} limit - Maximum allowed requests within the window.
 * @param {number} windowSec - Time window in seconds.
 *
 * @returns {boolean} True if the request is allowed.
 */
function checkInMemoryLimit(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const entry = inMemoryViews.get(key);
  if (!entry || entry.resetAt <= now) {
    inMemoryViews.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

/**
 * Checks rate limit using Upstash Redis with in-memory fallback.
 *
 * @param {Request} req - Incoming request for IP extraction.
 * @param {number} limit - Maximum allowed requests within the window.
 * @param {number} windowSec - Time window in seconds.
 *
 * @returns {Promise<boolean>} True if the request is allowed.
 */
async function checkRateLimit(req: Request, limit: number, windowSec: number): Promise<boolean> {
  const ip = getIpKey(req);
  const key = `views:${ip}`;

  const upstashAllowed = await tryUseUpstashRateLimit(key, limit, windowSec);
  if (upstashAllowed) {
    return true;
  }

  return checkInMemoryLimit(key, limit, windowSec);
}

/**
 * Increments the view count for a video via the increment_video_view RPC.
 * Rate-limited to 120 increments per minute per IP.
 *
 * @param {Request} req - Incoming request with video_id in the body.
 *
 * @returns {Promise<NextResponse>} JSON response indicating success or error.
 */
export async function POST(req: Request) {
  try {
    const { video_id } = await req.json();
    if (!video_id) {
      return NextResponse.json({ error: 'video_id required' }, { status: 400 });
    }

    // Allow high view increments — users skip videos fast
    const allowed = await checkRateLimit(req, 120, 60); // 120 increments per minute per IP
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, serviceKey, { "global": { fetch } } as any);

    const { error } = await sb.rpc('increment_video_view', { p_video_id: video_id });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
