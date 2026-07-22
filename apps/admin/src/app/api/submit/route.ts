import { NextResponse } from 'next/server';

import { extractIgId, detectSource } from '@/lib/instagram';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Handles public video submission via RPC call with URL validation.
 *
 * @param {Request} req - Incoming request with video metadata.
 *
 * @returns {Promise<NextResponse>} JSON response with submitted data.
 */
export async function POST(req: Request) {
  const { ig_url, tags, category, state, city } = await req.json();
  if (!ig_url) return NextResponse.json({ error: 'ig_url required' }, { status: 400 });

  const ig_id = extractIgId(ig_url);
  const src = detectSource(ig_url);
  if (!ig_id) return NextResponse.json({ error: 'invalid instagram url' }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('submit_video', {
    p_ig_url: ig_url,
    p_ig_id: ig_id,
    p_src: src,
    p_tags: tags || null,
    p_category: category || null,
    p_state: state || null,
    p_city: city || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
