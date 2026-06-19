
-- Replace reality-images INSERT policy: allow coordinator on ANY of their own realities, regardless of confirmed_status
DROP POLICY IF EXISTS "Staff upload reality-images" ON storage.objects;
CREATE POLICY "Staff upload reality-images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'reality-images'
  AND (
    has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'moderator')
    OR (
      has_role(auth.uid(),'coordinatore')
      AND EXISTS (
        SELECT 1 FROM realities r
        WHERE r.id::text = (storage.foldername(objects.name))[1]
          AND r.created_by = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "Staff update reality-images" ON storage.objects;
CREATE POLICY "Staff update reality-images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'reality-images'
  AND (
    has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'moderator')
    OR (
      has_role(auth.uid(),'coordinatore')
      AND EXISTS (
        SELECT 1 FROM realities r
        WHERE r.id::text = (storage.foldername(objects.name))[1]
          AND r.created_by = auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "Staff delete reality-images" ON storage.objects;
CREATE POLICY "Staff delete reality-images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'reality-images'
  AND (
    has_role(auth.uid(),'admin')
    OR has_role(auth.uid(),'moderator')
    OR (
      has_role(auth.uid(),'coordinatore')
      AND EXISTS (
        SELECT 1 FROM realities r
        WHERE r.id::text = (storage.foldername(objects.name))[1]
          AND r.created_by = auth.uid()
      )
    )
  )
);

-- Public read access for public buckets (idempotent)
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public read reality-images" ON storage.objects;
CREATE POLICY "Public read reality-images" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'reality-images');

DROP POLICY IF EXISTS "Public read blog-covers" ON storage.objects;
CREATE POLICY "Public read blog-covers" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'blog-covers');
