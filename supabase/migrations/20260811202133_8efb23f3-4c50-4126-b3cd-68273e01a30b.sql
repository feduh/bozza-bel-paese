-- 1. Special issues
CREATE TABLE public.editorial_special_issues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id uuid NOT NULL REFERENCES public.editorial_editions(id) ON DELETE CASCADE,
  guest_editor_user_id uuid,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  theme_description text,
  status public.editorial_edition_status NOT NULL DEFAULT 'draft',
  submissions_open_at timestamp with time zone,
  submissions_close_at timestamp with time zone,
  position integer NOT NULL DEFAULT 1,
  cover_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.editorial_special_issues TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_special_issues TO authenticated;
GRANT ALL ON public.editorial_special_issues TO service_role;

ALTER TABLE public.editorial_special_issues ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_guest_editor_of_special_issue(_special_issue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.editorial_special_issues si
    WHERE si.id = _special_issue_id
      AND si.guest_editor_user_id = auth.uid()
  )
$$;

REVOKE ALL ON FUNCTION public.is_guest_editor_of_special_issue(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_guest_editor_of_special_issue(uuid) TO authenticated, service_role;

CREATE POLICY "Public can view published special issues"
ON public.editorial_special_issues FOR SELECT
TO anon, authenticated
USING (status IN ('published', 'archived'));

CREATE POLICY "Staff and editors can view all special issues"
ON public.editorial_special_issues FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
  OR public.is_curator_of_edition(edition_id)
  OR guest_editor_user_id = auth.uid()
);

CREATE POLICY "Admins and chief editors can insert special issues"
ON public.editorial_special_issues FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.is_curator_of_edition(edition_id)
);

CREATE POLICY "Admins, chief and guest editors can update special issues"
ON public.editorial_special_issues FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.is_curator_of_edition(edition_id)
  OR guest_editor_user_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.is_curator_of_edition(edition_id)
  OR guest_editor_user_id = auth.uid()
);

CREATE POLICY "Admins and chief editors can delete special issues"
ON public.editorial_special_issues FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.is_curator_of_edition(edition_id)
);

CREATE TRIGGER update_editorial_special_issues_updated_at
BEFORE UPDATE ON public.editorial_special_issues
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_special_issues_edition ON public.editorial_special_issues(edition_id);

-- 2. Collegamenti
ALTER TABLE public.blog_posts
  ADD COLUMN special_issue_id uuid REFERENCES public.editorial_special_issues(id) ON DELETE SET NULL;

ALTER TABLE public.editorial_submissions
  ADD COLUMN special_issue_id uuid REFERENCES public.editorial_special_issues(id) ON DELETE CASCADE;

CREATE INDEX idx_blog_posts_special_issue ON public.blog_posts(special_issue_id);
CREATE INDEX idx_editorial_submissions_special_issue ON public.editorial_submissions(special_issue_id);

-- 3. Rimozione Point Counter Point
ALTER TABLE public.blog_posts DROP COLUMN reply_to_id;