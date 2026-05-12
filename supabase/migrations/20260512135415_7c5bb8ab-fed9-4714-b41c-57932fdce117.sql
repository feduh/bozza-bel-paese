-- Extend blog_posts to support magazine + Point / Counter Point
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_point_counterpoint BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS counterpart_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stance TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Backfill slugs from id for existing rows
UPDATE public.blog_posts
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::text, 1, 6)
WHERE slug IS NULL;

ALTER TABLE public.blog_posts ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS blog_posts_pcp_idx ON public.blog_posts(is_point_counterpoint) WHERE is_point_counterpoint = true;

-- Validation: stance must be 'point' or 'counterpoint' (only when PCP)
CREATE OR REPLACE FUNCTION public.validate_blog_pcp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_point_counterpoint = true THEN
    IF NEW.stance IS NULL OR NEW.stance NOT IN ('point', 'counterpoint') THEN
      RAISE EXCEPTION 'stance deve essere "point" o "counterpoint" per i contenuti Point / Counter Point';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_blog_pcp_trigger ON public.blog_posts;
CREATE TRIGGER validate_blog_pcp_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_blog_pcp();

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();