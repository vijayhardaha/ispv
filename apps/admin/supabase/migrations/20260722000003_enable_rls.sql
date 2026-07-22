ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- anon: read published videos only
CREATE POLICY "anon_read_published_videos" ON public.videos
  FOR SELECT TO anon USING (status = 'published');

-- anon: read categories and locations
CREATE POLICY "anon_read_categories" ON public.categories
  FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_locations" ON public.locations
  FOR SELECT TO anon USING (TRUE);

-- authenticated: full access
CREATE POLICY "auth_all_videos" ON public.videos
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_all_categories" ON public.categories
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "auth_all_locations" ON public.locations
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Table-level privileges (required for RLS to function)
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.locations TO anon, authenticated;
GRANT SELECT ON public.videos TO anon;

GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.locations TO authenticated;
GRANT ALL ON public.videos TO authenticated;
