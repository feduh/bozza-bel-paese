
-- 1. Tighten profile reads for authenticated users: respect consent_public, allow own and staff
DROP POLICY IF EXISTS "Authenticated reads profiles" ON public.profiles;

CREATE POLICY "Authenticated reads profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR consent_public = true
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'moderator'::app_role)
  OR public.has_role(auth.uid(), 'coordinatore'::app_role)
);

-- 2. Stop public listing of the avatars bucket. Public URLs (CDN) keep working
-- because the bucket itself is marked public; only LIST is removed.
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;

-- 3. Restrict realtime channel subscriptions: only allow Postgres Changes
-- (which is then filtered by the underlying table RLS, e.g. notifications.user_id = auth.uid()).
-- Broadcast / Presence channels are denied because the app does not use them.
DROP POLICY IF EXISTS "Allow postgres_changes for authenticated" ON realtime.messages;

CREATE POLICY "Allow postgres_changes for authenticated"
ON realtime.messages
FOR SELECT
TO authenticated
USING (extension = 'postgres_changes');
