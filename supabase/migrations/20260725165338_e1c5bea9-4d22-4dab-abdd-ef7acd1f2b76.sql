-- 1. editorial_editions: restrict public read to non-draft editions
DROP POLICY IF EXISTS "Editions readable by everyone" ON public.editorial_editions;

CREATE POLICY "Public can read non-draft editions"
ON public.editorial_editions
FOR SELECT
TO anon, authenticated
USING (status <> 'draft');

CREATE POLICY "Curator can read own draft edition"
ON public.editorial_editions
FOR SELECT
TO authenticated
USING (curator_user_id = auth.uid());

-- 2. notifications: require recipient to be a real user
DROP POLICY IF EXISTS "Staff can create notifications" ON public.notifications;

CREATE POLICY "Staff can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'moderator'::app_role)
    OR public.has_role(auth.uid(), 'coordinatore'::app_role)
  )
  AND user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = notifications.user_id)
);