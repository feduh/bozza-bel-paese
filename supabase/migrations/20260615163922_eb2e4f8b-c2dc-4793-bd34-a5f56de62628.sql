-- Enable pg_net for async HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add EN columns to blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS excerpt_en text,
  ADD COLUMN IF NOT EXISTS content_en text,
  ADD COLUMN IF NOT EXISTS translated_at timestamptz;

-- Add EN columns to realities
ALTER TABLE public.realities
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS history_en text,
  ADD COLUMN IF NOT EXISTS translated_at timestamptz;

-- Trigger function: enqueue async translation via pg_net
CREATE OR REPLACE FUNCTION public.enqueue_auto_translate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_url text := 'https://wxvexxwviaqxxnrrbshs.supabase.co/functions/v1/auto-translate';
  v_should_translate boolean := false;
BEGIN
  IF TG_TABLE_NAME = 'blog_posts' THEN
    IF TG_OP = 'INSERT' THEN
      v_should_translate := COALESCE(NEW.title,'') <> '' OR COALESCE(NEW.excerpt,'') <> '' OR COALESCE(NEW.content,'') <> '';
    ELSE
      v_should_translate :=
        COALESCE(NEW.title,'')   IS DISTINCT FROM COALESCE(OLD.title,'')   OR
        COALESCE(NEW.excerpt,'') IS DISTINCT FROM COALESCE(OLD.excerpt,'') OR
        COALESCE(NEW.content,'') IS DISTINCT FROM COALESCE(OLD.content,'');
    END IF;
  ELSIF TG_TABLE_NAME = 'realities' THEN
    IF TG_OP = 'INSERT' THEN
      v_should_translate := COALESCE(NEW.name,'') <> '' OR COALESCE(NEW.description,'') <> '' OR COALESCE(NEW.history,'') <> '';
    ELSE
      v_should_translate :=
        COALESCE(NEW.name,'')        IS DISTINCT FROM COALESCE(OLD.name,'')        OR
        COALESCE(NEW.description,'') IS DISTINCT FROM COALESCE(OLD.description,'') OR
        COALESCE(NEW.history,'')     IS DISTINCT FROM COALESCE(OLD.history,'');
    END IF;
  END IF;

  IF v_should_translate THEN
    PERFORM net.http_post(
      url := v_url,
      headers := jsonb_build_object('Content-Type','application/json'),
      body := jsonb_build_object('table', TG_TABLE_NAME, 'id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_posts_auto_translate ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_auto_translate
AFTER INSERT OR UPDATE OF title, excerpt, content ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.enqueue_auto_translate();

DROP TRIGGER IF EXISTS trg_realities_auto_translate ON public.realities;
CREATE TRIGGER trg_realities_auto_translate
AFTER INSERT OR UPDATE OF name, description, history ON public.realities
FOR EACH ROW EXECUTE FUNCTION public.enqueue_auto_translate();