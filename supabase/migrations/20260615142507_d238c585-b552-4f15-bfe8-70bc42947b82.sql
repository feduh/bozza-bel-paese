
-- 1) Add categories column
ALTER TABLE public.realities
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';

-- 2) Backfill from existing singular category
UPDATE public.realities
  SET categories = ARRAY[category]
  WHERE category IS NOT NULL
    AND (categories IS NULL OR cardinality(categories) = 0);

-- 3) Validation + sync function
CREATE OR REPLACE FUNCTION public.validate_reality_categories()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  allowed text[] := ARRAY[
    'Architettura / Spazio Pubblico','Arti visive','Bio-Art / Sci-Art',
    'Cinema / Audiovisivo','Curatela / Ricerca','Danza',
    'Design / Product Design','Editoria / Scrittura','Fotografia',
    'Installazione','Makers / Artigianato Digitale','New Media Art',
    'Performance','Pittura','Scultura','Sound','Teatro','Videoarte'
  ];
  c text;
BEGIN
  -- If categories empty but legacy category provided, hydrate the array
  IF (NEW.categories IS NULL OR cardinality(NEW.categories) = 0)
     AND NEW.category IS NOT NULL THEN
    NEW.categories := ARRAY[NEW.category];
  END IF;

  -- Deduplicate while preserving order
  IF NEW.categories IS NOT NULL AND cardinality(NEW.categories) > 0 THEN
    SELECT array_agg(DISTINCT v ORDER BY v) INTO NEW.categories
    FROM unnest(NEW.categories) WITH ORDINALITY AS t(v, ord);
    -- Re-sort by first occurrence to preserve user ordering
    NEW.categories := (
      SELECT array_agg(v ORDER BY min_ord)
      FROM (
        SELECT v, MIN(ord) AS min_ord
        FROM unnest(NEW.categories) WITH ORDINALITY AS u(v, ord)
        GROUP BY v
      ) s
    );

    -- Validate each entry
    FOREACH c IN ARRAY NEW.categories LOOP
      IF NOT (c = ANY(allowed)) THEN
        RAISE EXCEPTION 'Categoria realtà non valida: %', c;
      END IF;
    END LOOP;
  END IF;

  -- Keep legacy singular field in sync with first element
  IF NEW.categories IS NOT NULL AND cardinality(NEW.categories) > 0 THEN
    NEW.category := NEW.categories[1];
  ELSE
    NEW.category := NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Replace old singular-only trigger with the new one
DROP TRIGGER IF EXISTS validate_reality_category_trigger ON public.realities;
DROP TRIGGER IF EXISTS realities_validate_category ON public.realities;
DROP TRIGGER IF EXISTS validate_reality_categories_trigger ON public.realities;

CREATE TRIGGER validate_reality_categories_trigger
BEFORE INSERT OR UPDATE ON public.realities
FOR EACH ROW
EXECUTE FUNCTION public.validate_reality_categories();
