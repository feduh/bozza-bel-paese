-- Add copyright verification fields
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS copyright_declaration jsonb,
  ADD COLUMN IF NOT EXISTS copyright_check_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS copyright_check_notes text,
  ADD COLUMN IF NOT EXISTS copyright_checked_at timestamptz;

-- Validation trigger: require declaration + ok check before publishing/scheduling
CREATE OR REPLACE FUNCTION public.validate_blog_post_copyright()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
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
$$;

DROP TRIGGER IF EXISTS trg_validate_blog_post_copyright ON public.blog_posts;
CREATE TRIGGER trg_validate_blog_post_copyright
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.validate_blog_post_copyright();