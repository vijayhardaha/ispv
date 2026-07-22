import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Logs out the current user and redirects to the login page.
 *
 * @param {NextRequest} req - Incoming logout request.
 *
 * @returns {Promise<NextResponse>} Redirect response to login page.
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', req.url));
}
