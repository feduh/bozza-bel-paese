-- Function: notify author when blog_post is published or scheduled
CREATE OR REPLACE FUNCTION public.notify_blog_post_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Published
  IF NEW.status = 'published' AND COALESCE(OLD.status, '') <> 'published' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_id,
      'article_published',
      'Articolo pubblicato',
      'Il tuo articolo "' || NEW.title || '" è ora online.',
      '/magazine/' || NEW.slug
    );
  -- Scheduled
  ELSIF NEW.status = 'scheduled' AND COALESCE(OLD.status, '') <> 'scheduled' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_id,
      'article_scheduled',
      'Articolo programmato',
      'Il tuo articolo "' || NEW.title || '" è stato programmato per la pubblicazione.',
      '/area-membri'
    );
  -- Pending: notify staff
  ELSIF NEW.status = 'pending' AND COALESCE(OLD.status, '') <> 'pending' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT ur.user_id, 'article_pending_review',
           'Nuovo articolo da revisionare',
           'L''articolo "' || NEW.title || '" è in attesa di revisione.',
           '/admin'
    FROM public.user_roles ur
    WHERE ur.role IN ('admin','moderator','coordinatore')
      AND ur.user_id <> NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_blog_post_status ON public.blog_posts;
CREATE TRIGGER trg_notify_blog_post_status
AFTER UPDATE OF status ON public.blog_posts
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_blog_post_status_change();

-- Function: notify on reality confirmed
CREATE OR REPLACE FUNCTION public.notify_reality_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.confirmed_status = 'confermato'
     AND COALESCE(OLD.confirmed_status, '') <> 'confermato'
     AND NEW.created_by IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.created_by,
      'reality_confirmed',
      'Realtà confermata',
      'La realtà "' || NEW.name || '" è stata confermata e ora è visibile sulla mappa.',
      '/mappatura'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_reality_confirmed ON public.realities;
CREATE TRIGGER trg_notify_reality_confirmed
AFTER UPDATE OF confirmed_status ON public.realities
FOR EACH ROW
WHEN (OLD.confirmed_status IS DISTINCT FROM NEW.confirmed_status)
EXECUTE FUNCTION public.notify_reality_confirmed();

-- Function: notify admins/moderators on new pending reality from collaborator
CREATE OR REPLACE FUNCTION public.notify_new_pending_reality()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.confirmed_status = 'pendente' AND NEW.created_by IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT ur.user_id, 'reality_pending',
           'Nuova realtà proposta',
           'La realtà "' || NEW.name || '" è in attesa di conferma (auto-conferma in 24h).',
           '/admin'
    FROM public.user_roles ur
    WHERE ur.role IN ('admin','moderator')
      AND ur.user_id <> NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_pending_reality ON public.realities;
CREATE TRIGGER trg_notify_new_pending_reality
AFTER INSERT ON public.realities
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_pending_reality();