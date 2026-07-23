import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { submitVideoBodySchema } from '@/lib/schemas';
import { extractIgId, detectSource } from '@/lib/instagram';

/**
 * Simple in-memory rate limiter fallback (per-instance).
 * For global/distributed limits, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * and implement the Upstash logic in tryUseUpstashRateLimit().
 */
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Extracts the client IP from forwarded headers.
 *
 * @param {Request} req - Incoming request.
 *
 * @returns {string} IP address string.
 */
function getIpKey(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  return ip.split(',')[0].trim();
}

import { tryUseUpstashRateLimit } from '@/lib/rateLimit';

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
  const entry = inMemoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
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
  const key = `rl:${ip}`;

  const upstashAllowed = await tryUseUpstashRateLimit(key, limit, windowSec);
  if (upstashAllowed) {
    return true;
  }

  return checkInMemoryLimit(key, limit, windowSec);
}

/**
 * Handles public video submission from the frontend submit dialog.
 * Validates the request body, extracts Instagram metadata, and calls the submit_video RPC.
 *
 * @param {Request} req - Incoming request with video URL, location, city, and hashtags.
 *
 * @returns {Promise<NextResponse>} JSON response with the submitted video record.
 */
export async function POST(req: Request) {
  try {
    // Rate limit: 5 submissions per minute per IP
    const allowed = await checkRateLimit(req, 5, 60); // 5 submissions per minute per IP
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = submitVideoBodySchema.safeParse({
      video_url: body.url ?? body.video_url,
      tags: body.hashtags ? body.hashtags.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
      category: body.location ?? null,
      location: null,
      city: body.city ?? null,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }

    const video_url = parsed.data.video_url as string;
    const video_id = extractIgId(video_url);
    const video_src = detectSource(video_url);
    if (!video_id) {
      return NextResponse.json({ error: 'Invalid instagram url' }, { status: 400 });
    }

    // Use server-only service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, serviceKey, { "global": { fetch } } as any);

    const { data, error } = await sb.rpc('submit_video', {
      p_video_url: video_url,
      p_video_id: video_id,
      p_video_src: video_src,
      p_tags: parsed.data.tags ? parsed.data.tags.join(',') : null,
      p_category: parsed.data.category ?? null,
      p_location: null,
      p_city: parsed.data.city ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? { ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
