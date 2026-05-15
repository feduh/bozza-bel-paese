
-- 1) Fix broken storage policies for reality-images (collaborator branch)
DROP POLICY IF EXISTS "Staff upload reality-images" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete reality-images" ON storage.objects;

CREATE POLICY "Staff upload reality-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reality-images'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'moderator'::app_role)
    OR (
      has_role(auth.uid(), 'collaborator'::app_role)
      AND EXISTS (
        SELECT 1 FROM public.realities r
        WHERE (r.id)::text = (storage.foldername(storage.objects.name))[1]
          AND r.created_by = auth.uid()
          AND r.confirmed_status = 'pendente'
      )
    )
  )
);

CREATE POLICY "Staff delete reality-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'reality-images'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'moderator'::app_role)
    OR (
      has_role(auth.uid(), 'collaborator'::app_role)
      AND EXISTS (
        SELECT 1 FROM public.realities r
        WHERE (r.id)::text = (storage.foldername(storage.objects.name))[1]
          AND r.created_by = auth.uid()
          AND r.confirmed_status = 'pendente'
      )
    )
  )
);

-- 2) Remove broad SELECT policies that allow listing buckets.
-- Files remain accessible via the public /object/public/<bucket>/<path> URL.
DROP POLICY IF EXISTS "Public read blog covers" ON storage.objects;
DROP POLICY IF EXISTS "Public read reality-images" ON storage.objects;

-- 3) Explicit admin-only write policies on user_roles
CREATE POLICY "Admins insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4) Revoke direct execute on the auto-confirm cron function from clients.
-- Only service_role / cron should call it.
REVOKE EXECUTE ON FUNCTION public.auto_confirm_pending_realities() FROM PUBLIC, anon, authenticated;
