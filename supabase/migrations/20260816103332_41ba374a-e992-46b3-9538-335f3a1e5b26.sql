-- Helper: editor chief of a given edition
CREATE OR REPLACE FUNCTION public.is_editor_chief_of_edition(_edition_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.editorial_editions e
    WHERE e.id = _edition_id
      AND e.curator_user_id = auth.uid()
      AND public.has_role(auth.uid(), 'editor_chief')
  )
$$;

-- Helper: guest editor of a given special issue
CREATE OR REPLACE FUNCTION public.is_guest_editor_of_si(_special_issue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.editorial_special_issues si
    WHERE si.id = _special_issue_id
      AND si.guest_editor_user_id = auth.uid()
      AND public.has_role(auth.uid(), 'guest_editor')
  )
$$;

-- Helper: can this user manage the given special issue (admin, chief of its edition, own guest editor)
CREATE OR REPLACE FUNCTION public.can_manage_special_issue(_special_issue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.editorial_special_issues si
    WHERE si.id = _special_issue_id
      AND (
        public.has_role(auth.uid(), 'admin')
        OR public.is_editor_chief_of_edition(si.edition_id)
        OR (si.guest_editor_user_id = auth.uid() AND public.has_role(auth.uid(), 'guest_editor'))
      )
  )
$$;

REVOKE ALL ON FUNCTION public.is_editor_chief_of_edition(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_guest_editor_of_si(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_manage_special_issue(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_editor_chief_of_edition(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_guest_editor_of_si(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_special_issue(uuid) TO authenticated, service_role;

-- editorial_editions: curator must also hold the editor_chief role
DROP POLICY IF EXISTS "Curator can update own edition" ON public.editorial_editions;
CREATE POLICY "Editor chief can update own edition"
ON public.editorial_editions FOR UPDATE TO authenticated
USING (public.is_editor_chief_of_edition(id))
WITH CHECK (public.is_editor_chief_of_edition(id));

-- editorial_special_issues
DROP POLICY IF EXISTS "Admins and chief editors can insert special issues" ON public.editorial_special_issues;
CREATE POLICY "Admins and chief editors can insert special issues"
ON public.editorial_special_issues FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.is_editor_chief_of_edition(edition_id)
);

DROP POLICY IF EXISTS "Admins and chief editors can delete special issues" ON public.editorial_special_issues;
CREATE POLICY "Admins and chief editors can delete special issues"
ON public.editorial_special_issues FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.is_editor_chief_of_edition(edition_id)
);

DROP POLICY IF EXISTS "Admins, chief and guest editors can update special issues" ON public.editorial_special_issues;
CREATE POLICY "Admins, chief and guest editors can update special issues"
ON public.editorial_special_issues FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.is_editor_chief_of_edition(edition_id)
  OR public.is_guest_editor_of_si(id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.is_editor_chief_of_edition(edition_id)
  OR public.is_guest_editor_of_si(id)
);

DROP POLICY IF EXISTS "Staff and editors can view all special issues" ON public.editorial_special_issues;
CREATE POLICY "Staff and editors can view all special issues"
ON public.editorial_special_issues FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
  OR public.is_curator_of_edition(edition_id)
  OR guest_editor_user_id = auth.uid()
);

-- editorial_submissions: chief of edition or guest editor of the special issue
DROP POLICY IF EXISTS "Curator and admin read edition submissions" ON public.editorial_submissions;
CREATE POLICY "Editors and admin read edition submissions"
ON public.editorial_submissions FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.is_editor_chief_of_edition(edition_id)
  OR (special_issue_id IS NOT NULL AND public.is_guest_editor_of_si(special_issue_id))
);

DROP POLICY IF EXISTS "Curator and admin update edition submissions" ON public.editorial_submissions;
CREATE POLICY "Editors and admin update edition submissions"
ON public.editorial_submissions FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.is_editor_chief_of_edition(edition_id)
  OR (special_issue_id IS NOT NULL AND public.is_guest_editor_of_si(special_issue_id))
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.is_editor_chief_of_edition(edition_id)
  OR (special_issue_id IS NOT NULL AND public.is_guest_editor_of_si(special_issue_id))
);

-- blog_posts: editors can manage (incl. publish/schedule) posts of their edition / special issue
DROP POLICY IF EXISTS "Members create own posts with role limits" ON public.blog_posts;
CREATE POLICY "Members create own posts with role limits"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (
  (
    auth.uid() = user_id
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'moderator')
      OR public.has_role(auth.uid(), 'coordinatore')
      OR (public.has_role(auth.uid(), 'author') AND status = ANY (ARRAY['draft','pending','scheduled']))
    )
  )
  OR (
    editorial_edition_id IS NOT NULL
    AND public.is_editor_chief_of_edition(editorial_edition_id)
  )
  OR (
    special_issue_id IS NOT NULL
    AND public.can_manage_special_issue(special_issue_id)
  )
);

DROP POLICY IF EXISTS "Update own non-published or staff updates all" ON public.blog_posts;
CREATE POLICY "Update own non-published or staff updates all"
ON public.blog_posts FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
  OR (auth.uid() = user_id AND status = ANY (ARRAY['draft','pending','scheduled']))
  OR (editorial_edition_id IS NOT NULL AND public.is_editor_chief_of_edition(editorial_edition_id))
  OR (special_issue_id IS NOT NULL AND public.can_manage_special_issue(special_issue_id))
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
  OR (auth.uid() = user_id AND status = ANY (ARRAY['draft','pending','scheduled']))
  OR (editorial_edition_id IS NOT NULL AND public.is_editor_chief_of_edition(editorial_edition_id))
  OR (special_issue_id IS NOT NULL AND public.can_manage_special_issue(special_issue_id))
);

DROP POLICY IF EXISTS "Authenticated reads posts" ON public.blog_posts;
CREATE POLICY "Authenticated reads posts"
ON public.blog_posts FOR SELECT TO authenticated
USING (
  status = 'published'
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
  OR (editorial_edition_id IS NOT NULL AND public.is_editor_chief_of_edition(editorial_edition_id))
  OR (special_issue_id IS NOT NULL AND public.can_manage_special_issue(special_issue_id))
);