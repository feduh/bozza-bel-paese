
-- 1) Newsletter subscribers: drop coordinatore access to raw rows (incl. tokens)
DROP POLICY IF EXISTS "Admins/coord manage subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins manage subscribers"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));

-- 2) Realtime: scope postgres_changes subscriptions per-user (notifications:<uid>)
DROP POLICY IF EXISTS "Allow postgres_changes for authenticated" ON realtime.messages;
CREATE POLICY "Authenticated can listen to own notification channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  extension = 'postgres_changes'
  AND auth.uid() IS NOT NULL
  AND realtime.topic() = 'notifications:' || auth.uid()::text
);

-- 3) Revoke EXECUTE from anon on SECURITY DEFINER functions that are not public.
-- Keep get_public_stats and has_role accessible.
REVOKE EXECUTE ON FUNCTION public.apply_translation(text, uuid, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.newsletter_enqueue_issue(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.auto_confirm_pending_realities() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_posts() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.apply_translation(text, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_confirm_pending_realities() TO service_role;
GRANT EXECUTE ON FUNCTION public.publish_scheduled_posts() TO service_role;
GRANT EXECUTE ON FUNCTION public.newsletter_enqueue_issue(uuid) TO authenticated, service_role;
