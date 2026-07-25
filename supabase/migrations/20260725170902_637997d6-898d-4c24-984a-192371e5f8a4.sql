DROP TABLE IF EXISTS public.newsletter_deliveries CASCADE;
DROP TABLE IF EXISTS public.newsletter_issues CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP FUNCTION IF EXISTS public.newsletter_enqueue_issue(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.validate_newsletter_subscriber() CASCADE;
DROP FUNCTION IF EXISTS public.validate_newsletter_issue() CASCADE;
DROP FUNCTION IF EXISTS public.auto_subscribe_member_to_newsletter() CASCADE;