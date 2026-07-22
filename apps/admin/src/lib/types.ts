/** Video record shape returned by the API / RPC. */
export interface VideoRecord {
  id: string;
  ig_url: string;
  category: string | null;
  state: string | null;
  city: string | null;
  tags: string[] | null;
  description: string | null;
  thumbnail_url: string | null;
  ig_post_date: string | null;
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  created_at: string;
  updated_at: string;
  submitted_tags: string | null;
  submitted_category: string | null;
  submitted_state: string | null;
  submitted_city: string | null;
  category_label: string | null;
  category_color: string | null;
  view_count: number;
  /** Populated by get_videos_for_api RPC via COUNT(*) OVER() */
  total_count?: number;
}

/** Category record from Supabase `categories` table. */
export interface CategoryRecord {
  id: string;
  slug: string;
  value: string;
  label: string;
  color: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

/** Location record from Supabase `locations` table. */
export interface LocationRecord {
  id: string;
  slug: string;
  value: string;
  label: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}
