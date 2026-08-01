-- ============================================================================
-- Remove the pending_review status
-- ============================================================================
-- The admin no longer uses pending_review as a moderation status, so the
-- CHECK constraint on videos.status is narrowed to draft/published/rejected.

ALTER TABLE public.videos
  DROP CONSTRAINT IF EXISTS check_video_status;

UPDATE public.videos
  SET status = 'draft'
  WHERE status = 'pending_review';

ALTER TABLE public.videos
  ADD CONSTRAINT check_video_status
  CHECK (status IN ('draft', 'published', 'rejected'));

COMMIT;
