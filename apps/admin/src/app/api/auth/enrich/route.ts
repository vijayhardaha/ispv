/** Requires Node.js runtime for sharp (native addon), dns, and net modules. */
export const runtime = 'nodejs';

import dns from 'node:dns/promises';
import net from 'node:net';

import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { revalidateDashboardStats } from '@/constants/cache';
import { createServiceSupabase, sanitizeFilename, uploadBuffer } from '@/lib/api';
import { enrichVideoBodySchema } from '@/lib/db';
import { detectSource, extractIgId } from '@/lib/utils';

/** Maximum allowed image size in bytes (5 MB) for enrichment. */
const MAX_BYTES = 5 * 1024 * 1024;

/** Timeout in milliseconds for HEAD requests during URL validation. */
const HEAD_TIMEOUT_MS = 8000;

/** Timeout in milliseconds for GET requests during image download. */
const GET_TIMEOUT_MS = 15000;

/**
 * Determines whether an IP address belongs to a private or reserved range.
 *
 * @param {string} ip - IPv4 or IPv6 address string.
 *
 * @returns {boolean} True if the IP is private, loopback, or link-local.
 */
function isPrivateIp(ip: string): boolean {
  if (!ip) {
    return true;
  }
  // IPv4
  if (net.isIP(ip) === 4) {
    const PRIVATE_PREFIXES = ['10.', '127.', '169.254.', '192.168.'];
    if (PRIVATE_PREFIXES.some((prefix) => ip.startsWith(prefix))) {
      return true;
    }
    const m = ip.match(/^172\.(\d+)\./);
    if (m) {
      const second = Number(m[1]);
      if (second >= 16 && second <= 31) {
        return true;
      }
    }
    return false;
  }

  // IPv6
  if (net.isIP(ip) === 6) {
    if (ip === '::1') {
      return true;
    }
    if (ip.startsWith('fc') || ip.startsWith('fd')) {
      return true; // unique local
    }
    if (ip.startsWith('fe80')) {
      return true; // link-local
    }
    return false;
  }

  return true;
}

/**
 * Validates that a URL points to an acceptable image resource.
 *
 * Checks protocol, DNS resolution (blocking private IPs), content-type header,
 * and content-length against the maximum allowed size.
 *
 * @param {string} urlString - URL to validate.
 *
 * @returns {Promise<{ ok: boolean; message?: string }>} Validation result with optional error message.
 */
async function validateUrlAcceptsImage(urlString: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { ok: false, message: 'Invalid protocol' };
    }

    // Resolve hostname and block private IPs
    const lookup = await dns.lookup(url.hostname).catch(() => null);
    if (!lookup) {
      return { ok: false, message: 'Unable to resolve host' };
    }

    if (Array.isArray(lookup)) {
      if (lookup.some((l) => isPrivateIp(l.address))) {
        return { ok: false, message: 'Host resolves to private IP' };
      }
    } else {
      if (isPrivateIp(lookup.address)) {
        return { ok: false, message: 'Host resolves to private IP' };
      }
    }

    // HEAD to check content-length and content-type
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);
    let headResp: Response;
    try {
      headResp = await fetch(urlString, {
        method: 'HEAD',
        headers: { 'User-Agent': 'ISPV/1.0' },
        signal: controller.signal,
      });
    } catch {
      clearTimeout(timeout);
      // Some servers don't allow HEAD — fall back to small GET later, but still allow for now
      return { ok: true };
    }
    clearTimeout(timeout);

    if (!headResp.ok) {
      return { ok: false, message: 'Failed to fetch resource' };
    }

    const ct = headResp.headers.get('content-type') ?? '';
    if (!ct.startsWith('image/') && !ct.includes('image')) {
      return { ok: false, message: `Unsupported content-type: ${ct}` };
    }

    const cl = headResp.headers.get('content-length');
    if (cl) {
      const bytes = Number(cl);
      if (!Number.isNaN(bytes) && bytes > MAX_BYTES) {
        return { ok: false, message: 'Image too large' };
      }
    }

    return { ok: true };
  } catch (err) {
    console.warn('[enrich] URL validation failed:', err instanceof Error ? err.message : err);
    return { ok: false, message: 'Invalid URL' };
  }
}

/**
 * Downloads an image from a URL, optimizes it via Sharp, and uploads to blob storage.
 *
 * Returns the public URL of the uploaded thumbnail, or null on any failure.
 *
 * @param {string} url - Source image URL to download.
 * @param {string} video_id - Video ID used to derive the thumbnail filename.
 * @param {string} video_src - Source platform ('instagram' | 'youtube') used for filename.
 *
 * @returns {Promise<string | null>} Uploaded thumbnail URL, or null on failure.
 */
async function downloadAndUpload(url: string, video_id: string, video_src: string): Promise<string | null> {
  try {
    // Basic URL validation + private IP checks + content-type/size via HEAD
    const validated = await validateUrlAcceptsImage(url);
    if (!validated.ok) {
      console.warn('[enrich] Image validation failed for', video_id, ':', validated.message);
      return null;
    }

    // Fetch with timeout and size enforcement
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GET_TIMEOUT_MS);
    const res = await fetch(url, { headers: { 'User-Agent': 'ISPV/1.0' }, signal: controller.signal }).finally(() =>
      clearTimeout(timeout)
    );
    if (!res.ok) {
      console.warn('[enrich] Image download failed for', video_id, '- status:', res.status);
      return null;
    }

    // If content-length present, enforce again
    const cl = res.headers.get('content-length');
    if (cl) {
      const bytes = Number(cl);
      if (!Number.isNaN(bytes) && bytes > MAX_BYTES) {
        console.warn('[enrich] Image too large for', video_id, '- size:', cl);
        return null;
      }
    }

    const ab = await res.arrayBuffer();
    if (ab.byteLength > MAX_BYTES) {
      console.warn('[enrich] Downloaded image too large for', video_id, '- bytes:', ab.byteLength);
      return null;
    }

    const buffer = Buffer.from(ab);
    // limitInputPixels prevents decompression bombs from consuming excessive memory
    const optimized = await sharp(buffer, { limitInputPixels: 50_000_000 }).webp({ quality: 80 }).toBuffer();
    const uploadedUrl = await uploadBuffer(optimized, `${sanitizeFilename(`${video_src}-${video_id}`)}.webp`);
    if (!uploadedUrl) {
      console.warn('[enrich] Vercel Blob upload returned null for', video_id);
    }
    return uploadedUrl;
  } catch (err) {
    console.error('[enrich] downloadAndUpload failed for', video_id, ':', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Handles POST requests to enrich video metadata from an Instagram URL.
 *
 * @param {Request} req - The incoming HTTP request object.
 *
 * @returns {Promise<NextResponse>} A JSON response with the enriched result or an error message.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (token !== process.env.ENRICH_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = enrichVideoBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 });
    }

    const { video_url, video_post_date, og_image } = parsed.data;

    const video_id = extractIgId(video_url);
    const video_src = detectSource(video_url);
    if (!video_id) {
      return NextResponse.json({ error: 'invalid instagram url' }, { status: 400 });
    }

    if (og_image) {
      console.log('[enrich] Downloading thumbnail for', video_id, 'from', og_image);
    }
    const thumbnail_url = og_image ? await downloadAndUpload(og_image, video_id, video_src) : null;

    const supabase = createServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const { data, error } = await supabase.rpc('submit_video', {
      p_video_url: video_url,
      p_video_id: video_id,
      p_video_src: video_src,
      p_video_post_date: video_post_date || null,
      p_thumbnail_url: thumbnail_url || null,
    });

    if (error) {
      console.error('[enrich] RPC submit_video failed for', video_id, ':', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateDashboardStats();

    if (thumbnail_url) {
      console.log('[enrich] Successfully enriched', video_id, '- thumbnail:', thumbnail_url);
    } else if (og_image) {
      console.warn('[enrich] Enriched', video_id, 'but thumbnail upload failed (missing BLOB_READ_WRITE_TOKEN?)');
    }

    return NextResponse.json(data ?? { ok: true, thumbnail_url });
  } catch (e) {
    console.error('[enrich] POST handler error:', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
