
-- Remove translation infrastructure
DROP TRIGGER IF EXISTS enqueue_blog_post_translation ON public.blog_posts;
DROP TRIGGER IF EXISTS enqueue_reality_translation ON public.realities;
DROP TRIGGER IF EXISTS blog_posts_auto_translate ON public.blog_posts;
DROP TRIGGER IF EXISTS realities_auto_translate ON public.realities;

DROP FUNCTION IF EXISTS public.enqueue_auto_translate() CASCADE;
DROP FUNCTION IF EXISTS public.apply_translation(text, uuid, jsonb) CASCADE;

ALTER TABLE public.blog_posts
  DROP COLUMN IF EXISTS title_en,
  DROP COLUMN IF EXISTS excerpt_en,
  DROP COLUMN IF EXISTS content_en,
  DROP COLUMN IF EXISTS translated_at;

ALTER TABLE public.realities
  DROP COLUMN IF EXISTS name_en,
  DROP COLUMN IF EXISTS description_en,
  DROP COLUMN IF EXISTS history_en,
  DROP COLUMN IF EXISTS translated_at;
