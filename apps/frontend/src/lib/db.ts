import { supabase } from '@/lib/supabase';

export interface DbCategory {
  id: string;
  value: string;
  name: string;
  color: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface DbLocation {
  id: string;
  value: string;
  name: string;
  description: string | null;
}

export async function getCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getLocations(): Promise<DbLocation[]> {
  const { data, error } = await supabase.from('locations').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryByValue(value: string): Promise<DbCategory | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('value', value).single();
  if (error) return null;
  return data;
}
