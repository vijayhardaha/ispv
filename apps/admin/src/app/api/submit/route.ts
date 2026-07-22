import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase-server';

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  const { ig_url, tags, category, state, city } = await req.json();
  if (!ig_url) return NextResponse.json({ error: 'ig_url required' }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('submit_video', {
    p_ig_url: ig_url,
    p_tags: tags || null,
    p_category: category || null,
    p_state: state || null,
    p_city: city || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
