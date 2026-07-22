import { createClient } from '@supabase/supabase-js';

/**
 * Singleton Supabase client for browser-side usage.
 * Uses the same public anon key as the admin app.
 */
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
