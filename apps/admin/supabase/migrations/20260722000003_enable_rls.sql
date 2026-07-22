ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

-- anon: read published videos only
CREATE POLICY "anon_read_published_videos" ON public.videos
  FOR SELECT TO anon USING (status = 'published');

-- anon: read categories and states
CREATE POLICY "anon_read_categories" ON public.categories
  FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_states" ON public.states
  FOR SELECT TO anon USING (TRUE);

-- authenticated: full access
CREATE POLICY "auth_all_videos" ON public.videos
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_all_categories" ON public.categories
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_all_states" ON public.states
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
