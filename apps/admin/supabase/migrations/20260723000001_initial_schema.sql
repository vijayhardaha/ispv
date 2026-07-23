-- ============================================================================
-- Consolidated Initial Schema — Indian Students Protest Vault
-- ============================================================================
-- This single migration replaces all previous incremental migrations.
-- The project has never been live, so there is no need for ALTER / migration
-- chaining.  This file represents the final desired schema.
-- ============================================================================

-- ............................................................................
-- 1. Extensions
-- ............................................................................

CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";

ALTER ROLE authenticator SET search_path TO public, extensions;

ALTER ROLE postgres SET search_path TO public, extensions;

-- ............................................................................
-- 2. Tables
-- ............................................................................

CREATE TABLE public.videos (
  id                uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  video_url         text NOT NULL UNIQUE,
  video_id          text UNIQUE,
  video_src         text NOT NULL DEFAULT 'instagram',
  category          text,
  location          text,
  city              text,
  tags              text[],
  description       text,
  thumbnail_url     text,
  video_post_date   timestamptz,
  view_count        integer DEFAULT 0,
  created_at        timestamptz DEFAULT NOW(),
  updated_at        timestamptz DEFAULT NOW(),
  status            text NOT NULL DEFAULT 'draft',
  trashed_at        timestamptz DEFAULT NULL,
  trash_reason      text DEFAULT NULL
);

-- CHECK constraints
ALTER TABLE public.videos
  ADD CONSTRAINT check_video_status
  CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));

ALTER TABLE public.videos
  ADD CONSTRAINT check_video_src
  CHECK (video_src IN ('instagram', 'youtube', 'twitter', 'tiktok', 'other'));

ALTER TABLE public.videos
  ADD CONSTRAINT check_view_count
  CHECK (view_count >= 0);

ALTER TABLE public.videos
  ADD CONSTRAINT check_video_url_format
  CHECK (video_url ~ '^https?://');

ALTER TABLE public.videos
  ADD CONSTRAINT check_thumbnail_url_format
  CHECK (thumbnail_url IS NULL OR thumbnail_url ~ '^https?://');

ALTER TABLE public.videos
  ADD CONSTRAINT check_video_post_date
  CHECK (video_post_date IS NULL OR video_post_date <= NOW());

-- ............................................................................
-- 3. Trigger function – auto-update updated_at
-- ............................................................................

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ............................................................................
-- 4. RPCs
-- ............................................................................

-- 4a. get_videos_for_api – paginated, trashed-aware, searchable
CREATE OR REPLACE FUNCTION public.get_videos_for_api(filters jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  status_filter text := filters->>'status';
  search_query text := filters->>'search';
  category_filter text := filters->>'category';
  location_filter text := filters->>'location';
  page_num int := COALESCE((filters->>'page')::int, 1);
  per_page int := COALESCE((filters->>'per_page')::int, 50);
  max_per_page int := 500;
  offset_count int;
  total_count_val bigint;
  result jsonb;
BEGIN
  IF per_page > max_per_page THEN per_page := max_per_page; END IF;
  IF page_num < 1 THEN page_num := 1; END IF;
  offset_count := (page_num - 1) * per_page;

  SELECT COUNT(*) INTO total_count_val
  FROM public.videos v
  WHERE v.trashed_at IS NULL
    AND (NULLIF(status_filter, '') IS NULL OR v.status = status_filter)
    AND (NULLIF(category_filter, '') IS NULL OR v.category = category_filter)
    AND (NULLIF(location_filter, '') IS NULL OR v.location = location_filter)
    AND (NULLIF(search_query, '') IS NULL
      OR v.video_url ILIKE '%' || search_query || '%'
      OR v.video_id ILIKE '%' || search_query || '%'
      OR v.description ILIKE '%' || search_query || '%'
      OR v.city ILIKE '%' || search_query || '%');

  SELECT jsonb_build_object(
    'data', COALESCE(videos_data, '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', page_num,
      'per_page', per_page,
      'total_count', total_count_val,
      'total_pages', CEIL(total_count_val::float / per_page)::int,
      'has_next', (page_num * per_page) < total_count_val,
      'has_previous', page_num > 1
    )
  ) INTO result
  FROM (
    SELECT COALESCE(JSONB_AGG(row_to_json(t) ORDER BY t.created_at DESC), '[]'::jsonb) AS videos_data
    FROM (
      SELECT
        v.id, v.video_url, v.video_id, v.video_src, v.category, v.location, v.city, v.tags,
        v.description, v.thumbnail_url, v.video_post_date, v.view_count,
        v.status, v.created_at, v.updated_at
      FROM public.videos v
      WHERE v.trashed_at IS NULL
        AND (NULLIF(status_filter, '') IS NULL OR v.status = status_filter)
        AND (NULLIF(category_filter, '') IS NULL OR v.category = category_filter)
        AND (NULLIF(location_filter, '') IS NULL OR v.location = location_filter)
        AND (NULLIF(search_query, '') IS NULL
          OR v.video_url ILIKE '%' || search_query || '%'
          OR v.video_id ILIKE '%' || search_query || '%'
          OR v.description ILIKE '%' || search_query || '%'
          OR v.city ILIKE '%' || search_query || '%')
      ORDER BY v.created_at DESC
      LIMIT per_page
      OFFSET offset_count
    ) t
  ) subquery;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_videos_for_api(jsonb) TO authenticated, anon;

-- 4b. submit_video – upsert from public form
CREATE OR REPLACE FUNCTION public.submit_video(
  p_video_url text,
  p_video_id text DEFAULT NULL,
  p_video_src text DEFAULT 'instagram',
  p_tags text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_video_post_date timestamptz DEFAULT NULL,
  p_thumbnail_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  result jsonb;
BEGIN
  IF p_video_id IS NOT NULL THEN
    SELECT id INTO existing_id FROM public.videos WHERE video_id = p_video_id LIMIT 1;
  END IF;

  IF existing_id IS NULL THEN
    SELECT id INTO existing_id FROM public.videos WHERE video_url = p_video_url LIMIT 1;
  END IF;

  IF existing_id IS NOT NULL THEN
    UPDATE public.videos SET
      video_id        = COALESCE(p_video_id, video_id),
      video_src       = COALESCE(p_video_src, video_src),
      video_post_date = COALESCE(p_video_post_date, video_post_date),
      thumbnail_url   = COALESCE(p_thumbnail_url, thumbnail_url),
      tags            = CASE WHEN tags IS NULL AND p_tags IS NOT NULL THEN string_to_array(p_tags, ',') ELSE tags END,
      category        = COALESCE(category, p_category),
      location        = COALESCE(location, p_location),
      city            = COALESCE(city, p_city)
    WHERE id = existing_id;

    SELECT row_to_json(v) INTO result FROM public.videos v WHERE id = existing_id;
    RETURN result;
  END IF;

  INSERT INTO public.videos (video_url, video_id, video_src, tags, category, location, city, video_post_date, thumbnail_url)
  VALUES (p_video_url, p_video_id, p_video_src,
    CASE WHEN p_tags IS NOT NULL THEN string_to_array(p_tags, ',') ELSE NULL END,
    p_category, p_location, p_city, p_video_post_date, p_thumbnail_url)
  RETURNING row_to_json(videos) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_video TO anon;

-- 4c. increment_video_view
CREATE OR REPLACE FUNCTION public.increment_video_view(p_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.videos SET view_count = view_count + 1 WHERE id = p_video_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_video_view TO anon;

-- 4d. get_tags – published video tags with counts
CREATE OR REPLACE FUNCTION public.get_tags()
RETURNS TABLE (tag text, count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT unnest(tags) AS tag, COUNT(*)::bigint AS count
  FROM public.videos
  WHERE status = 'published' AND tags IS NOT NULL
  GROUP BY tag
  ORDER BY count DESC, tag ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_tags TO anon, authenticated;

-- 4e. trash_video – soft delete
CREATE OR REPLACE FUNCTION public.trash_video(
  p_video_id uuid,
  p_reason text DEFAULT 'No reason provided'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.videos
  SET trashed_at = NOW(), trash_reason = p_reason, updated_at = NOW()
  WHERE id = p_video_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.trash_video(uuid, text) TO authenticated;

-- 4f. restore_video – restore from trash
CREATE OR REPLACE FUNCTION public.restore_video(p_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.videos
  SET trashed_at = NULL, trash_reason = NULL, updated_at = NOW()
  WHERE id = p_video_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.restore_video(uuid) TO authenticated;

-- 4g. purge_old_trashed_videos – permanent cleanup
CREATE OR REPLACE FUNCTION public.purge_old_trashed_videos(
  p_grace_period_days integer DEFAULT 30
) RETURNS TABLE(deleted_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.videos
  WHERE trashed_at IS NOT NULL
    AND trashed_at <= NOW() - (p_grace_period_days || ' days')::interval;
  RETURN QUERY SELECT ROW_COUNT()::integer;
END;
$$;

GRANT EXECUTE ON FUNCTION public.purge_old_trashed_videos(integer) TO authenticated;

-- ............................................................................
-- 5. Views
-- ............................................................................

CREATE OR REPLACE VIEW public.active_videos AS
  SELECT * FROM public.videos WHERE trashed_at IS NULL;

CREATE OR REPLACE VIEW public.trashed_videos AS
  SELECT * FROM public.videos
  WHERE trashed_at IS NOT NULL
  ORDER BY trashed_at DESC;

-- ............................................................................
-- 6. Indexes
-- ............................................................................

CREATE INDEX idx_videos_status ON public.videos(status);
CREATE INDEX idx_videos_category ON public.videos(category);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_ig_post_date ON public.videos(video_post_date DESC);
CREATE INDEX idx_videos_status_created_at ON public.videos(status, created_at DESC);
CREATE INDEX idx_videos_tags_gin ON public.videos USING GIN(tags);
CREATE INDEX idx_videos_description_trgm ON public.videos USING GIN(description gin_trgm_ops);
CREATE INDEX idx_videos_video_url_trgm ON public.videos USING GIN(video_url gin_trgm_ops);
CREATE INDEX idx_videos_video_id_trgm ON public.videos USING GIN(video_id gin_trgm_ops);
CREATE INDEX idx_videos_status_category_created ON public.videos(status, category, created_at DESC);
CREATE INDEX idx_videos_status_city ON public.videos(status, city);
CREATE INDEX idx_videos_city ON public.videos(city);
CREATE INDEX idx_videos_location ON public.videos(location);
CREATE INDEX idx_videos_video_src ON public.videos(video_src);
CREATE INDEX idx_videos_view_count_desc ON public.videos(view_count DESC, created_at DESC);
CREATE INDEX idx_videos_trashed_at ON public.videos(trashed_at);

-- ............................................................................
-- 7. Row Level Security
-- ............................................................................

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- anon: read published, non-trashed videos only
CREATE POLICY "anon_read_published_videos" ON public.videos
  FOR SELECT TO anon USING (status = 'published' AND trashed_at IS NULL);

-- authenticated: full access
CREATE POLICY "auth_all_videos" ON public.videos
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Table-level privileges
GRANT SELECT ON public.videos TO anon;
GRANT ALL ON public.videos TO authenticated;

COMMIT;
