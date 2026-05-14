CREATE POLICY "Public reads published posts"
ON public.blog_posts
FOR SELECT
TO anon
USING (status = 'published');