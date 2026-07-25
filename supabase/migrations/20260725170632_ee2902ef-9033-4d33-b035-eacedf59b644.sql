-- 1) Tighten EXECUTE on SECURITY DEFINER helpers/triggers
REVOKE EXECUTE ON FUNCTION public.notify_editorial_submission_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_curator_of_edition(uuid) FROM PUBLIC, anon, authenticated;
-- Ensure RLS can still call is_curator_of_edition (runs as function owner regardless of grants,
-- but grant to postgres explicitly for clarity)
GRANT EXECUTE ON FUNCTION public.is_curator_of_edition(uuid) TO postgres, service_role;

-- 2) Replace always-true INSERT policies with validated ones
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 200
    AND char_length(btrim(email)) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(btrim(subject)) BETWEEN 1 AND 300
    AND char_length(btrim(message)) BETWEEN 1 AND 10000
    AND status = 'nuovo'
    AND admin_notes IS NULL
  );

DROP POLICY IF EXISTS "Anyone can submit reality reports" ON public.reality_reports;
CREATE POLICY "Anyone can submit reality reports"
  ON public.reality_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 300
    AND (reporter_email IS NULL OR reporter_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
    AND (contact_email IS NULL OR contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
    AND (city IS NULL OR char_length(city) <= 200)
    AND (region IS NULL OR char_length(region) <= 200)
    AND (description IS NULL OR char_length(description) <= 10000)
    AND (website IS NULL OR char_length(website) <= 500)
    AND (reporter_name IS NULL OR char_length(reporter_name) <= 200)
    AND status = 'nuova'
    AND admin_notes IS NULL
  );

-- 3) Storage SELECT policies (list/get via Storage API) scoped by owner or staff
DROP POLICY IF EXISTS "Users list own avatars" ON storage.objects;
CREATE POLICY "Users list own avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "Users list own blog covers" ON storage.objects;
CREATE POLICY "Users list own blog covers"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'blog-covers'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

DROP POLICY IF EXISTS "Staff list reality images" ON storage.objects;
CREATE POLICY "Staff list reality images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'reality-images'
    AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'moderator'::public.app_role)
      OR public.has_role(auth.uid(), 'coordinatore'::public.app_role)
    )
  );