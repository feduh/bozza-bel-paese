CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE(mapped int, regions int, members int, articles int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*)::int FROM public.realities WHERE confirmed_status = 'confermato'),
    (SELECT count(DISTINCT region)::int FROM public.realities WHERE confirmed_status = 'confermato' AND region IS NOT NULL),
    (SELECT count(*)::int FROM public.profiles),
    (SELECT count(*)::int FROM public.blog_posts WHERE status = 'published');
$$;

GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;