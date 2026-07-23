import dns from 'node:dns/promises';
import net from 'node:net';

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { detectSource, extractIgId } from '@/lib/instagram';
import { enrichVideoBodySchema } from '@/lib/schemas';
import { uploadBuffer } from '@/lib/upload';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const HEAD_TIMEOUT_MS = 8000;
const GET_TIMEOUT_MS = 15000;

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  // IPv4
  if (net.isIP(ip) === 4) {
    if (ip.startsWith('10.')) return true;
    if (ip.startsWith('127.')) return true;
    if (ip.startsWith('169.254.')) return true;
    if (ip.startsWith('192.168.')) return true;
    const m = ip.match(/^172\.(\d+)\./);
    if (m) {
      const second = Number(m[1]);
      if (second >= 16 && second <= 31) return true;
    }
    return false;
  }

  // IPv6
  if (net.isIP(ip) === 6) {
    if (ip === '::1') return true;
    if (ip.startsWith('fc') || ip.startsWith('fd')) return true; // unique local
    if (ip.startsWith('fe80')) return true; // link-local
    return false;
  }

  return true;
}

async function validateUrlAcceptsImage(urlString: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) return { ok: false, message: 'Invalid protocol' };

    // Resolve hostname and block private IPs
    const lookup = await dns.lookup(url.hostname).catch(() => null);
    if (!lookup) return { ok: false, message: 'Unable to resolve host' };
    if (Array.isArray(lookup)) {
      if (lookup.some((l) => isPrivateIp(l.address))) return { ok: false, message: 'Host resolves to private IP' };
    } else {
      if (isPrivateIp(lookup.address)) return { ok: false, message: 'Host resolves to private IP' };
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

    if (!headResp.ok) return { ok: false, message: 'Failed to fetch resource' };

    const ct = headResp.headers.get('content-type') ?? '';
    if (!ct.startsWith('image/') && !ct.includes('image'))
      return { ok: false, message: `Unsupported content-type: ${ct}` };

    const cl = headResp.headers.get('content-length');
    if (cl) {
      const bytes = Number(cl);
      if (!Number.isNaN(bytes) && bytes > MAX_BYTES) return { ok: false, message: 'Image too large' };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: 'Invalid URL' };
  }
}

async function downloadAndUpload(url: string, video_id: string): Promise<string | null> {
  try {
    // Basic URL validation + private IP checks + content-type/size via HEAD
    const validated = await validateUrlAcceptsImage(url);
    if (!validated.ok) return null;

    // Fetch with timeout and size enforcement
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GET_TIMEOUT_MS);
    const res = await fetch(url, { headers: { 'User-Agent': 'ISPV/1.0' }, signal: controller.signal }).finally(() =>
      clearTimeout(timeout)
    );
    if (!res.ok) return null;

    // If content-length present, enforce again
    const cl = res.headers.get('content-length');
    if (cl) {
      const bytes = Number(cl);
      if (!Number.isNaN(bytes) && bytes > MAX_BYTES) return null;
    }

    const ab = await res.arrayBuffer();
    if (ab.byteLength > MAX_BYTES) return null;

    const buffer = Buffer.from(ab);
    const optimized = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    return await uploadBuffer(optimized, `thumbs/${video_id}.webp`);
  } catch {
    // swallow errors and return null to keep enrichment best-effort
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
export async function POST(req: Request) {
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
    if (!video_id) return NextResponse.json({ error: 'invalid instagram url' }, { status: 400 });

    const thumbnail_url = og_image ? await downloadAndUpload(og_image, video_id) : null;

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data, error } = await supabase.rpc('submit_video', {
      p_video_url: video_url,
      p_video_id: video_id,
      p_video_src: video_src,
      p_video_post_date: video_post_date || null,
      p_thumbnail_url: thumbnail_url || null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? { ok: true, thumbnail_url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
