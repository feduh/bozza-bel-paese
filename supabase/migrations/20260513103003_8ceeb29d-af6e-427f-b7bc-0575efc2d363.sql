
-- blog_posts: nuove colonne
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL;

-- Backfill: tutti gli articoli esistenti diventano "published"
UPDATE public.blog_posts SET status = 'published' WHERE status = 'draft';

-- Constraint sui valori validi
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;
ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_status_check
  CHECK (status IN ('draft', 'pending', 'published'));

CREATE INDEX IF NOT EXISTS idx_blog_posts_reply_to ON public.blog_posts(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

-- Rimuovo trigger e colonne PCP
DROP TRIGGER IF EXISTS validate_blog_pcp_trigger ON public.blog_posts;
DROP FUNCTION IF EXISTS public.validate_blog_pcp() CASCADE;

ALTER TABLE public.blog_posts
  DROP COLUMN IF EXISTS is_point_counterpoint,
  DROP COLUMN IF EXISTS stance,
  DROP COLUMN IF EXISTS counterpart_id;

-- profiles: legame opzionale a realtà
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reality_id uuid REFERENCES public.realities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_reality ON public.profiles(reality_id) WHERE reality_id IS NOT NULL;

-- RLS blog_posts: rifaccio le policy
DROP POLICY IF EXISTS "Anyone can read blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.blog_posts;

CREATE POLICY "Public reads published posts"
ON public.blog_posts FOR SELECT
TO anon
USING (status = 'published');

CREATE POLICY "Authenticated reads posts"
ON public.blog_posts FOR SELECT
TO authenticated
USING (
  status = 'published'
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Members create own posts with role limits"
ON public.blog_posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
    OR (public.has_role(auth.uid(), 'author') AND status IN ('draft', 'pending'))
  )
);

CREATE POLICY "Update own non-published or staff updates all"
ON public.blog_posts FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR (auth.uid() = user_id AND status IN ('draft', 'pending'))
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR (auth.uid() = user_id AND status IN ('draft', 'pending'))
);

CREATE POLICY "Delete own non-published or staff deletes all"
ON public.blog_posts FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR (auth.uid() = user_id AND status IN ('draft', 'pending'))
);

-- user_roles: admin legge tutti
CREATE POLICY "Admins read all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
