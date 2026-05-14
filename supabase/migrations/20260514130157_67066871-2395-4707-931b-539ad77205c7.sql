INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-covers',
  'blog-covers',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
);

-- Public read
CREATE POLICY "Public read blog covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-covers');

-- Authenticated upload to own folder (user_id/...)
CREATE POLICY "Auth users upload own covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-covers'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Auth users update own covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-covers'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin'))
);

CREATE POLICY "Auth users delete own covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-covers'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin'))
);