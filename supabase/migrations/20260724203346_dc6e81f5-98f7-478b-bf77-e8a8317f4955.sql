ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS podcast_url text,
  ADD COLUMN IF NOT EXISTS podcast_kind text,
  ADD COLUMN IF NOT EXISTS podcast_duration text;

CREATE OR REPLACE FUNCTION public.validate_blog_post_copyright()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Skip when only translation/metadata fields changed
  IF TG_OP = 'UPDATE'
     AND NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.copyright_declaration IS NOT DISTINCT FROM OLD.copyright_declaration
     AND NEW.copyright_check_status IS NOT DISTINCT FROM OLD.copyright_check_status THEN
    RETURN NEW;
  END IF;

  -- Podcast: no copyright check required (hosted externally by partners,
  -- added only by coordinators/admin)
  IF NEW.category IS NOT NULL AND position('podcast' in lower(NEW.category)) > 0 THEN
    IF NEW.copyright_check_status IS NULL OR NEW.copyright_check_status = '' THEN
      NEW.copyright_check_status := 'ok';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.copyright_check_status NOT IN ('pending','ok','blocked') THEN
    RAISE EXCEPTION 'copyright_check_status non valido: %', NEW.copyright_check_status;
  END IF;

  IF NEW.status IN ('published','scheduled','pending') THEN
    IF NEW.copyright_declaration IS NULL THEN
      RAISE EXCEPTION 'Devi compilare la dichiarazione di copyright prima di inviare o programmare l''articolo.';
    END IF;
    IF NEW.copyright_check_status <> 'ok' THEN
      RAISE EXCEPTION 'La verifica copyright non è stata superata: l''articolo non può essere pubblicato o programmato.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;