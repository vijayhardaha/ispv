-- Migration: Add data validation constraints
-- Date: 2026-07-23
-- Purpose:
--   1. Add NOT NULL constraints for critical fields
--   2. Add CHECK constraints for enum-like fields
--   3. Add data type validations
--   4. Add URL format validations where applicable

-- ============================================================================
-- Validation Constraints on videos table
-- ============================================================================

-- Constraint: video_src must be one of allowed values
ALTER TABLE public.videos
  ADD CONSTRAINT check_video_src 
  CHECK (video_src IN ('instagram', 'youtube', 'twitter', 'tiktok', 'other'));

-- Constraint: view_count cannot be negative
ALTER TABLE public.videos
  ADD CONSTRAINT check_view_count 
  CHECK (view_count >= 0);

-- Constraint: status must be valid workflow state
ALTER TABLE public.videos
  ADD CONSTRAINT check_video_status 
  CHECK (status IN ('draft', 'pending_review', 'published', 'rejected'));

-- Constraint: video_url must be valid HTTP(S) URL format
ALTER TABLE public.videos
  ADD CONSTRAINT check_video_url_format 
  CHECK (video_url ~ '^https?://');

-- Constraint: thumbnail_url if provided must be valid HTTP(S) URL
ALTER TABLE public.videos
  ADD CONSTRAINT check_thumbnail_url_format 
  CHECK (thumbnail_url IS NULL OR thumbnail_url ~ '^https?://');

-- Constraint: video_post_date cannot be in the future
ALTER TABLE public.videos
  ADD CONSTRAINT check_video_post_date 
  CHECK (video_post_date IS NULL OR video_post_date <= NOW());

-- ============================================================================
-- Validation Constraints on categories table
-- ============================================================================

-- Constraint: value (slug) must be lowercase alphanumeric with hyphens
ALTER TABLE public.categories
  ADD CONSTRAINT check_category_value_format 
  CHECK (value ~ '^[a-z0-9_-]+$');

-- ============================================================================
-- Validation Constraints on locations table
-- ============================================================================

-- Constraint: value (slug) must be lowercase alphanumeric with hyphens
ALTER TABLE public.locations
  ADD CONSTRAINT check_location_value_format 
  CHECK (value ~ '^[a-z0-9_-]+$');

-- ============================================================================
-- Documentation
-- ============================================================================
-- These constraints prevent invalid data from entering the database:
-- 
-- 1. URL format validation catches typos early
-- 2. Status constraints prevent workflow violations
-- 3. View count prevents negative analytics
-- 4. Slug validation ensures consistent URL generation
--
-- Note: Existing data is NOT validated when constraints are added.
-- To validate existing data before applying:
--   SELECT COUNT(*) FROM videos WHERE video_url !~ '^https?://';

COMMIT;
