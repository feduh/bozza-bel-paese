-- Lock down SECURITY DEFINER functions: revoke from public/anon/authenticated where not intended.
-- Keep public access for has_role (used by RLS) and get_public_stats (intentional public stats).

REVOKE EXECUTE ON FUNCTION public.auto_confirm_pending_realities() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.newsletter_enqueue_issue(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_scheduled_posts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_translation(text, uuid, jsonb) FROM PUBLIC, anon, authenticated;

-- Trigger-only SECURITY DEFINER functions: not meant to be invoked via API
REVOKE EXECUTE ON FUNCTION public.prevent_blog_post_author_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_auto_translate() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_blog_post_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_pending_reality() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_reality_confirmed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_admin_action() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_subscribe_member_to_newsletter() FROM PUBLIC, anon, authenticated;

-- Ensure service_role retains execute for cron/edge function invocation
GRANT EXECUTE ON FUNCTION public.auto_confirm_pending_realities() TO service_role;
GRANT EXECUTE ON FUNCTION public.newsletter_enqueue_issue(uuid) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_scheduled_posts() TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_translation(text, uuid, jsonb) TO service_role;
