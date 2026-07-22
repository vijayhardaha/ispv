import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { detectSource, extractIgId } from '@/lib/instagram';
import { uploadBuffer } from '@/lib/upload';

async function downloadAndUpload(url: string, ig_id: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const optimized = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    return await uploadBuffer(optimized, `thumbs/${ig_id}.webp`);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (token !== process.env.ENRICH_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ig_url, ig_post_date, og_image } = await req.json();
    if (!ig_url) return NextResponse.json({ error: 'ig_url required' }, { status: 400 });

    const ig_id = extractIgId(ig_url);
    const src = detectSource(ig_url);
    if (!ig_id) return NextResponse.json({ error: 'invalid instagram url' }, { status: 400 });

    const thumbnail_url = og_image ? await downloadAndUpload(og_image, ig_id) : null;

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data, error } = await supabase.rpc('submit_video', {
      p_ig_url: ig_url,
      p_ig_id: ig_id,
      p_src: src,
      p_ig_post_date: ig_post_date || null,
      p_thumbnail_url: thumbnail_url || null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? { ok: true, thumbnail_url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
