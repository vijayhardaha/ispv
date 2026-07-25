import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/**
 * Singleton Supabase client for browser-side usage.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'http://localhost:9999',
  supabaseAnonKey || 'test-anon-key'
);
