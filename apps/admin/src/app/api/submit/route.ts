import { NextResponse } from 'next/server';

import { extractIgId, detectSource } from '@/lib/instagram';
import { submitVideoBodySchema } from '@/lib/schemas';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Handles public video submission via RPC call with URL validation.
 *
 * @param {Request} req - Incoming request with video metadata.
 *
 * @returns {Promise<NextResponse>} JSON response with submitted data.
 */
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = submitVideoBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' }, { status: 400 });
  }

  const { video_url, tags, category, location, city } = parsed.data;
  const video_id = extractIgId(video_url);
  const video_src = detectSource(video_url);
  if (!video_id) return NextResponse.json({ error: 'invalid instagram url' }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('submit_video', {
    p_video_url: video_url,
    p_video_id: video_id,
    p_video_src: video_src,
    p_tags: tags || null,
    p_category: category || null,
    p_location: location || null,
    p_city: city || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
