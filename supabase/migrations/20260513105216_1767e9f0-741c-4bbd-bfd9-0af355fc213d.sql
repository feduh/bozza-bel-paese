
-- realities: solo autenticati
DROP POLICY IF EXISTS "Anyone can read realities" ON public.realities;
CREATE POLICY "Authenticated reads realities"
  ON public.realities FOR SELECT TO authenticated USING (true);

-- reality_tags: solo autenticati
DROP POLICY IF EXISTS "Anyone can read reality tags" ON public.reality_tags;
CREATE POLICY "Authenticated reads reality tags"
  ON public.reality_tags FOR SELECT TO authenticated USING (true);

-- profiles: solo autenticati
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Authenticated reads profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

-- blog_posts: rimuovo la policy di lettura pubblica (resta solo "Authenticated reads posts")
DROP POLICY IF EXISTS "Public reads published posts" ON public.blog_posts;
