
-- realities: allow coordinatore to UPDATE any reality
DROP POLICY IF EXISTS "Collaborators update own pending realities" ON public.realities;
DROP POLICY IF EXISTS "Admins can update realities" ON public.realities;

CREATE POLICY "Staff can update realities"
ON public.realities
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
);

-- reality_images: allow coordinatore to insert/update/delete on ANY reality
DROP POLICY IF EXISTS "Collaborators insert images on own pending" ON public.reality_images;
DROP POLICY IF EXISTS "Collaborators update images on own pending" ON public.reality_images;
DROP POLICY IF EXISTS "Collaborators delete images on own pending" ON public.reality_images;
DROP POLICY IF EXISTS "Admins/moderators manage images insert" ON public.reality_images;
DROP POLICY IF EXISTS "Admins/moderators manage images update" ON public.reality_images;
DROP POLICY IF EXISTS "Admins/moderators manage images delete" ON public.reality_images;

CREATE POLICY "Staff insert reality images"
ON public.reality_images
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
);

CREATE POLICY "Staff update reality images"
ON public.reality_images
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
);

CREATE POLICY "Staff delete reality images"
ON public.reality_images
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
  OR public.has_role(auth.uid(), 'coordinatore')
);
