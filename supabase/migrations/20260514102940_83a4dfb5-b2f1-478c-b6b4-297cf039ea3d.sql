-- ============================================================
-- 1. Extend realities with audit/auto-confirm fields
-- ============================================================
ALTER TABLE public.realities
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS auto_confirm_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_by uuid,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_realities_created_by ON public.realities(created_by);
CREATE INDEX IF NOT EXISTS idx_realities_pending_auto ON public.realities(auto_confirm_at)
  WHERE confirmed_status = 'pendente';

-- ============================================================
-- 2. Rebuild RLS on realities
-- ============================================================
DROP POLICY IF EXISTS "Public reads realities" ON public.realities;
DROP POLICY IF EXISTS "Admins can insert realities" ON public.realities;
DROP POLICY IF EXISTS "Admins can update realities" ON public.realities;
DROP POLICY IF EXISTS "Admins can delete realities" ON public.realities;

-- Public: only confirmed realities
CREATE POLICY "Public reads confirmed realities"
ON public.realities
FOR SELECT
TO anon, authenticated
USING (confirmed_status = 'confermato');

-- Staff (admin/moderator/collaborator) can read everything
CREATE POLICY "Staff reads all realities"
ON public.realities
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'collaborator')
);

-- Authors of pending see their own
CREATE POLICY "Authors read own pending realities"
ON public.realities
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Admin: full insert
CREATE POLICY "Admins can insert realities"
ON public.realities
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Collaborator: can insert only as pending, attributed to themselves
CREATE POLICY "Collaborators propose pending realities"
ON public.realities
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'collaborator')
  AND created_by = auth.uid()
  AND confirmed_status = 'pendente'
);

-- Admin: full update
CREATE POLICY "Admins can update realities"
ON public.realities
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Collaborator: can update own pending only
CREATE POLICY "Collaborators update own pending realities"
ON public.realities
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'collaborator')
  AND created_by = auth.uid()
  AND confirmed_status = 'pendente'
)
WITH CHECK (
  public.has_role(auth.uid(), 'collaborator')
  AND created_by = auth.uid()
  AND confirmed_status = 'pendente'
);

-- Admin: full delete
CREATE POLICY "Admins can delete realities"
ON public.realities
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Collaborator: delete own pending only
CREATE POLICY "Collaborators delete own pending realities"
ON public.realities
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'collaborator')
  AND created_by = auth.uid()
  AND confirmed_status = 'pendente'
);

-- ============================================================
-- 3. Rebuild RLS on reality_tags
-- ============================================================
DROP POLICY IF EXISTS "Public reads reality tags" ON public.reality_tags;
DROP POLICY IF EXISTS "Admins can insert reality tags" ON public.reality_tags;
DROP POLICY IF EXISTS "Admins can update reality tags" ON public.reality_tags;
DROP POLICY IF EXISTS "Admins can delete reality tags" ON public.reality_tags;

-- Public: tags only of confirmed realities
CREATE POLICY "Public reads tags of confirmed realities"
ON public.reality_tags
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.realities r
    WHERE r.id = reality_tags.reality_id
      AND r.confirmed_status = 'confermato'
  )
);

-- Staff: read all tags
CREATE POLICY "Staff reads all reality tags"
ON public.reality_tags
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'collaborator')
);

-- Owner of pending reality reads its tags
CREATE POLICY "Owners read tags of own pending realities"
ON public.reality_tags
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.realities r
    WHERE r.id = reality_tags.reality_id
      AND r.created_by = auth.uid()
  )
);

-- Admin: full control on tags
CREATE POLICY "Admins manage all reality tags insert"
ON public.reality_tags
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage all reality tags update"
ON public.reality_tags
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage all reality tags delete"
ON public.reality_tags
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Collaborator: manage tags of their own pending realities
CREATE POLICY "Collaborators insert tags on own pending"
ON public.reality_tags
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'collaborator')
  AND EXISTS (
    SELECT 1 FROM public.realities r
    WHERE r.id = reality_tags.reality_id
      AND r.created_by = auth.uid()
      AND r.confirmed_status = 'pendente'
  )
);

CREATE POLICY "Collaborators update tags on own pending"
ON public.reality_tags
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'collaborator')
  AND EXISTS (
    SELECT 1 FROM public.realities r
    WHERE r.id = reality_tags.reality_id
      AND r.created_by = auth.uid()
      AND r.confirmed_status = 'pendente'
  )
);

CREATE POLICY "Collaborators delete tags on own pending"
ON public.reality_tags
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'collaborator')
  AND EXISTS (
    SELECT 1 FROM public.realities r
    WHERE r.id = reality_tags.reality_id
      AND r.created_by = auth.uid()
      AND r.confirmed_status = 'pendente'
  )
);

-- ============================================================
-- 4. Extend blog_posts moderation policies to include collaborator
-- ============================================================
DROP POLICY IF EXISTS "Authenticated reads posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Members create own posts with role limits" ON public.blog_posts;
DROP POLICY IF EXISTS "Update own non-published or staff updates all" ON public.blog_posts;
DROP POLICY IF EXISTS "Delete own non-published or staff deletes all" ON public.blog_posts;

CREATE POLICY "Authenticated reads posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (
  status = 'published'
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'collaborator')
);

CREATE POLICY "Members create own posts with role limits"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
    OR public.has_role(auth.uid(), 'collaborator')
    OR (
      public.has_role(auth.uid(), 'author')
      AND status = ANY (ARRAY['draft', 'pending'])
    )
  )
);

CREATE POLICY "Update own non-published or staff updates all"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'collaborator')
  OR (auth.uid() = user_id AND status = ANY (ARRAY['draft', 'pending']))
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'collaborator')
  OR (auth.uid() = user_id AND status = ANY (ARRAY['draft', 'pending']))
);

CREATE POLICY "Delete own non-published or staff deletes all"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'collaborator')
  OR (auth.uid() = user_id AND status = ANY (ARRAY['draft', 'pending']))
);

-- ============================================================
-- 5. Auto-confirm function + cron schedule
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.auto_confirm_pending_realities()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  WITH promoted AS (
    UPDATE public.realities r
    SET
      confirmed_status = 'confermato',
      confirmed_by = r.created_by,
      confirmed_at = now()
    WHERE r.confirmed_status = 'pendente'
      AND r.auto_confirm_at IS NOT NULL
      AND r.auto_confirm_at <= now()
      AND r.created_by IS NOT NULL
      AND public.has_role(r.created_by, 'collaborator')
    RETURNING 1
  )
  SELECT count(*)::int INTO affected FROM promoted;
  RETURN affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.auto_confirm_pending_realities() FROM PUBLIC, anon, authenticated;

-- Unschedule previous run if exists, then (re)schedule every 10 minutes
DO $$
BEGIN
  PERFORM cron.unschedule('auto-confirm-pending-realities')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-confirm-pending-realities');
EXCEPTION WHEN others THEN NULL;
END $$;

SELECT cron.schedule(
  'auto-confirm-pending-realities',
  '*/10 * * * *',
  $$SELECT public.auto_confirm_pending_realities();$$
);
