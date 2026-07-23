-- Migration: Add soft delete (trash) support
-- Date: 2026-07-23
-- Purpose:
--   1. Add trashed_at column for soft deletes
--   2. Add trash_reason column for audit purposes
--   3. Update RLS policies to hide trashed videos
--   4. Create helper function to restore videos from trash

-- ============================================================================
-- Add columns for trash/soft-delete support
-- ============================================================================

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS trashed_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trash_reason text DEFAULT NULL;

-- Create index on trashed_at for fast filtering of active videos
CREATE INDEX IF NOT EXISTS idx_videos_trashed_at 
  ON public.videos(trashed_at);

-- ============================================================================
-- Helper function: Move video to trash
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trash_video(
  p_video_id uuid,
  p_reason text DEFAULT 'No reason provided'
) RETURNS void AS $$
BEGIN
  UPDATE public.videos
  SET 
    trashed_at = NOW(),
    trash_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.trash_video(uuid, text) TO authenticated;

-- ============================================================================
-- Helper function: Restore video from trash
-- ============================================================================

CREATE OR REPLACE FUNCTION public.restore_video(
  p_video_id uuid
) RETURNS void AS $$
BEGIN
  UPDATE public.videos
  SET 
    trashed_at = NULL,
    trash_reason = NULL,
    updated_at = NOW()
  WHERE id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.restore_video(uuid) TO authenticated;

-- ============================================================================
-- Helper function: Permanently delete video (30-day grace period)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.purge_old_trashed_videos(
  p_grace_period_days integer DEFAULT 30
) RETURNS TABLE(deleted_count integer) AS $$
BEGIN
  DELETE FROM public.videos
  WHERE trashed_at IS NOT NULL 
    AND trashed_at <= NOW() - (p_grace_period_days || ' days')::interval;
  
  RETURN QUERY SELECT ROW_COUNT()::integer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.purge_old_trashed_videos(integer) TO authenticated;

-- ============================================================================
-- Update RLS Policy: Hide trashed videos from anonymous users
-- ============================================================================
-- First, drop existing policy (it should only show published videos anyway)
DROP POLICY IF EXISTS "anon_read_published_videos" ON public.videos;

-- Create updated policy that excludes trashed videos
CREATE POLICY "anon_read_published_videos"
  ON public.videos FOR SELECT
  TO anon
  USING (status = 'published' AND trashed_at IS NULL);

-- ============================================================================
-- Helper View: Active (non-trashed) videos only
-- ============================================================================

CREATE OR REPLACE VIEW public.active_videos AS
  SELECT * FROM public.videos
  WHERE trashed_at IS NULL;

-- ============================================================================
-- Helper View: Trashed videos for audit purposes
-- ============================================================================

CREATE OR REPLACE VIEW public.trashed_videos AS
  SELECT * FROM public.videos
  WHERE trashed_at IS NOT NULL
  ORDER BY trashed_at DESC;

-- ============================================================================
-- Usage Documentation
-- ============================================================================
--
-- SOFT DELETE (Move to Trash):
--   SELECT trash_video('video-uuid-here', 'Violates community guidelines');
--
-- RESTORE FROM TRASH:
--   SELECT restore_video('video-uuid-here');
--
-- PERMANENTLY DELETE (after 30 days):
--   SELECT purge_old_trashed_videos(30);
--
-- VIEW ACTIVE VIDEOS:
--   SELECT * FROM active_videos;
--
-- VIEW TRASHED VIDEOS:
--   SELECT * FROM trashed_videos;
--
-- AUDIT TRAIL:
--   SELECT id, title, trashed_at, trash_reason FROM trashed_videos;

-- ============================================================================
-- Migration Notes
-- ============================================================================
-- - Existing videos have trashed_at = NULL (not trashed)
-- - Videos deleted before this migration are permanently gone
-- - The grace period allows accidental deletions to be recovered
-- - After grace period, purge_old_trashed_videos() can be run via cron

COMMIT;
