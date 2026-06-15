
-- ============ NEWSLETTER SUBSCRIBERS ============
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  source text NOT NULL DEFAULT 'public_form',
  locale text NOT NULL DEFAULT 'it',
  confirmation_token uuid NOT NULL DEFAULT gen_random_uuid(),
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  bounced_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Validation triggers (no CHECK on enums per project rules)
CREATE OR REPLACE FUNCTION public.validate_newsletter_subscriber()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pending','confirmed','unsubscribed','bounced') THEN
    RAISE EXCEPTION 'status non valido: %', NEW.status;
  END IF;
  IF NEW.source NOT IN ('public_form','member_auto','admin_import') THEN
    RAISE EXCEPTION 'source non valida: %', NEW.source;
  END IF;
  NEW.email := lower(trim(NEW.email));
  IF NEW.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Email non valida';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_validate_newsletter_subscriber
BEFORE INSERT OR UPDATE ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.validate_newsletter_subscriber();

CREATE TRIGGER trg_newsletter_subscribers_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: public can insert (form), only owner can update own row by token (handled via edge functions with service role)
-- Admin/coordinatori can read & manage everything
CREATE POLICY "Public can subscribe"
ON public.newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending' AND source = 'public_form');

CREATE POLICY "Users see own subscription"
ON public.newsletter_subscribers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users update own subscription"
ON public.newsletter_subscribers FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins/coord manage subscribers"
ON public.newsletter_subscribers FOR ALL
TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'coordinatore'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'coordinatore'));

-- ============ NEWSLETTER ISSUES ============
CREATE TABLE public.newsletter_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  preheader text,
  content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  total_recipients integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_issues TO authenticated;
GRANT ALL ON public.newsletter_issues TO service_role;

ALTER TABLE public.newsletter_issues ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.validate_newsletter_issue()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('draft','scheduled','sending','sent','failed','cancelled') THEN
    RAISE EXCEPTION 'status non valido: %', NEW.status;
  END IF;
  IF NEW.status = 'scheduled' THEN
    IF NEW.scheduled_for IS NULL OR NEW.scheduled_for <= now() THEN
      RAISE EXCEPTION 'scheduled_for deve essere nel futuro';
    END IF;
    IF EXTRACT(MINUTE FROM NEW.scheduled_for)::int NOT IN (0,30)
       OR EXTRACT(SECOND FROM NEW.scheduled_for) <> 0 THEN
      RAISE EXCEPTION 'L''orario deve essere allineato a slot di 30 minuti';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_validate_newsletter_issue
BEFORE INSERT OR UPDATE ON public.newsletter_issues
FOR EACH ROW EXECUTE FUNCTION public.validate_newsletter_issue();

CREATE TRIGGER trg_newsletter_issues_updated_at
BEFORE UPDATE ON public.newsletter_issues
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins/coord manage issues"
ON public.newsletter_issues FOR ALL
TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'coordinatore'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'coordinatore'));

-- ============ NEWSLETTER DELIVERIES ============
CREATE TABLE public.newsletter_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES public.newsletter_issues(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  sent_at timestamptz,
  error text,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issue_id, subscriber_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_deliveries TO authenticated;
GRANT ALL ON public.newsletter_deliveries TO service_role;

ALTER TABLE public.newsletter_deliveries ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_newsletter_deliveries_queued ON public.newsletter_deliveries (status, created_at) WHERE status = 'queued';
CREATE INDEX idx_newsletter_deliveries_issue ON public.newsletter_deliveries (issue_id);

CREATE TRIGGER trg_newsletter_deliveries_updated_at
BEFORE UPDATE ON public.newsletter_deliveries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Admins/coord read deliveries"
ON public.newsletter_deliveries FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'coordinatore'));

-- ============ AUTO-SUBSCRIBE MEMBERS ON PROFILE CREATION ============
CREATE OR REPLACE FUNCTION public.auto_subscribe_member_to_newsletter()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.user_id;
  IF v_email IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.newsletter_subscribers (email, user_id, status, source, confirmed_at)
  VALUES (lower(trim(v_email)), NEW.user_id, 'confirmed', 'member_auto', now())
  ON CONFLICT (email) DO UPDATE
    SET user_id = EXCLUDED.user_id,
        status = CASE WHEN public.newsletter_subscribers.status = 'unsubscribed'
                      THEN public.newsletter_subscribers.status
                      ELSE 'confirmed' END,
        confirmed_at = COALESCE(public.newsletter_subscribers.confirmed_at, now()),
        source = COALESCE(public.newsletter_subscribers.source, 'member_auto');
  RETURN NEW;
END $$;

CREATE TRIGGER trg_auto_subscribe_member
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.auto_subscribe_member_to_newsletter();

-- Backfill existing members
INSERT INTO public.newsletter_subscribers (email, user_id, status, source, confirmed_at)
SELECT lower(trim(u.email)), p.user_id, 'confirmed', 'member_auto', now()
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE u.email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- ============ ATOMIC RPC: ENQUEUE DELIVERIES FOR AN ISSUE ============
CREATE OR REPLACE FUNCTION public.newsletter_enqueue_issue(_issue_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'coordinatore')) THEN
    RAISE EXCEPTION 'Permesso negato';
  END IF;

  INSERT INTO public.newsletter_deliveries (issue_id, subscriber_id, recipient_email)
  SELECT _issue_id, s.id, s.email
  FROM public.newsletter_subscribers s
  WHERE s.status = 'confirmed'
  ON CONFLICT (issue_id, subscriber_id) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE public.newsletter_issues
    SET status = 'sending', total_recipients = v_count
    WHERE id = _issue_id;

  RETURN v_count;
END $$;

GRANT EXECUTE ON FUNCTION public.newsletter_enqueue_issue(uuid) TO authenticated;
