import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase-server';

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (token !== process.env.ENRICH_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ig_url, ig_post_date } = await req.json();
  if (!ig_url) return NextResponse.json({ error: 'ig_url required' }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: existing } = await supabase.from('videos').select('id').eq('ig_url', ig_url).maybeSingle();

  if (existing) {
    await supabase
      .from('videos')
      .update({ ig_post_date: ig_post_date || null })
      .eq('id', existing.id);
  } else {
    await supabase.from('videos').insert({ ig_url, ig_post_date: ig_post_date || null, status: 'draft' });
  }

  return NextResponse.json({ ok: true });
}
