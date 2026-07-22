CREATE INDEX idx_videos_status ON public.videos(status);
CREATE INDEX idx_videos_category ON public.videos(category);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX idx_videos_ig_post_date ON public.videos(ig_post_date DESC);
CREATE INDEX idx_videos_status_created_at ON public.videos(status, created_at DESC);
