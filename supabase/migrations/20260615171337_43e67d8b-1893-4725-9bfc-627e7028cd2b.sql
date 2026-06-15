
CREATE OR REPLACE FUNCTION public.prevent_blog_post_author_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')) THEN
      RAISE EXCEPTION 'Non puoi cambiare l''autore di un articolo';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_blog_post_author_change ON public.blog_posts;
CREATE TRIGGER trg_prevent_blog_post_author_change
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.prevent_blog_post_author_change();

REVOKE EXECUTE ON FUNCTION public.prevent_blog_post_author_change() FROM anon, authenticated, public;
