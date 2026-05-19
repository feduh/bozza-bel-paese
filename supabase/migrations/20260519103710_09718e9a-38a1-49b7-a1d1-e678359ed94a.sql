-- Programmazione articoli del magazine: nuovo status 'scheduled' + scheduled_for + cron 30 min

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_for
  ON public.blog_posts(scheduled_for)
  WHERE status = 'scheduled';

-- Trigger di validazione: status valido + scheduled_for richiesto/multiplo di 30 min/futuro
CREATE OR REPLACE FUNCTION public.validate_blog_post_schedule()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('draft','pending','scheduled','published') THEN
    RAISE EXCEPTION 'status non valido: %', NEW.status;
  END IF;

  IF NEW.status = 'scheduled' THEN
    IF NEW.scheduled_for IS NULL THEN
      RAISE EXCEPTION 'Indica data e ora di pubblicazione per programmare l''articolo.';
    END IF;
    -- Solo minuti 0 o 30, secondi/millisecondi a zero
    IF EXTRACT(MINUTE FROM NEW.scheduled_for)::int NOT IN (0, 30)
       OR EXTRACT(SECOND FROM NEW.scheduled_for) <> 0 THEN
      RAISE EXCEPTION 'L''orario di pubblicazione deve essere allineato a slot di 30 minuti (es. 14:00 o 14:30).';
    END IF;
    IF NEW.scheduled_for <= now() THEN
      RAISE EXCEPTION 'L''orario di pubblicazione deve essere nel futuro.';
    END IF;
  ELSE
    -- Pulisco scheduled_for se non più rilevante
    NEW.scheduled_for := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_blog_post_schedule ON public.blog_posts;
CREATE TRIGGER trg_validate_blog_post_schedule
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_blog_post_schedule();

-- Aggiorno RLS: gli autori possono creare/aggiornare/eliminare anche 'scheduled' oltre a draft/pending
DROP POLICY IF EXISTS "Members create own posts with role limits" ON public.blog_posts;
CREATE POLICY "Members create own posts with role limits"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND (
    has_role(auth.uid(),'admin'::app_role)
    OR has_role(auth.uid(),'moderator'::app_role)
    OR has_role(auth.uid(),'coordinatore'::app_role)
    OR (has_role(auth.uid(),'author'::app_role) AND status = ANY (ARRAY['draft','pending','scheduled']))
  )
);

DROP POLICY IF EXISTS "Update own non-published or staff updates all" ON public.blog_posts;
CREATE POLICY "Update own non-published or staff updates all"
ON public.blog_posts FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(),'admin'::app_role)
  OR has_role(auth.uid(),'moderator'::app_role)
  OR has_role(auth.uid(),'coordinatore'::app_role)
  OR (auth.uid() = user_id AND status = ANY (ARRAY['draft','pending','scheduled']))
)
WITH CHECK (
  has_role(auth.uid(),'admin'::app_role)
  OR has_role(auth.uid(),'moderator'::app_role)
  OR has_role(auth.uid(),'coordinatore'::app_role)
  OR (auth.uid() = user_id AND status = ANY (ARRAY['draft','pending','scheduled']))
);

DROP POLICY IF EXISTS "Delete own non-published or staff deletes all" ON public.blog_posts;
CREATE POLICY "Delete own non-published or staff deletes all"
ON public.blog_posts FOR DELETE TO authenticated
USING (
  has_role(auth.uid(),'admin'::app_role)
  OR has_role(auth.uid(),'moderator'::app_role)
  OR has_role(auth.uid(),'coordinatore'::app_role)
  OR (auth.uid() = user_id AND status = ANY (ARRAY['draft','pending','scheduled']))
);

-- Funzione che pubblica i post programmati scaduti
CREATE OR REPLACE FUNCTION public.publish_scheduled_posts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  affected integer;
BEGIN
  WITH promoted AS (
    UPDATE public.blog_posts
    SET status = 'published',
        published_at = scheduled_for,
        scheduled_for = NULL
    WHERE status = 'scheduled'
      AND scheduled_for IS NOT NULL
      AND scheduled_for <= now()
    RETURNING 1
  )
  SELECT count(*)::int INTO affected FROM promoted;
  RETURN affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.publish_scheduled_posts() FROM PUBLIC, anon, authenticated;

-- Schedule cron ogni 30 minuti (minuti :00 e :30)
DO $$
BEGIN
  PERFORM cron.unschedule('publish-scheduled-posts')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'publish-scheduled-posts');
END $$;

SELECT cron.schedule(
  'publish-scheduled-posts',
  '0,30 * * * *',
  $$SELECT public.publish_scheduled_posts();$$
);