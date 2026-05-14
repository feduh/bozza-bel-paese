DROP POLICY IF EXISTS "Authenticated reads realities" ON public.realities;
DROP POLICY IF EXISTS "Authenticated reads reality tags" ON public.reality_tags;

CREATE POLICY "Public reads realities" ON public.realities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public reads reality tags" ON public.reality_tags FOR SELECT TO anon, authenticated USING (true);