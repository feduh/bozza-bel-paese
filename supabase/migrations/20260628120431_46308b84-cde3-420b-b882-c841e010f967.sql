
-- Mask confirmation_token and unsubscribe_token from the Data API.
-- Only service_role (edge functions) may read raw tokens.
REVOKE SELECT ON public.newsletter_subscribers FROM authenticated;
GRANT SELECT (
  id, email, user_id, status, source, locale,
  confirmed_at, unsubscribed_at, bounced_at, last_error,
  created_at, updated_at
) ON public.newsletter_subscribers TO authenticated;

-- Ensure service_role retains everything (edge functions need raw tokens)
GRANT ALL ON public.newsletter_subscribers TO service_role;
