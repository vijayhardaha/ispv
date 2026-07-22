import { NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase-server';

/**
 *
 */
export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('videos')
    .select('*, categories(*)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 *
 * @param req
 */
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from('videos').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
