
CREATE OR REPLACE FUNCTION public.validate_reality_category()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.category IS NOT NULL AND NEW.category NOT IN (
    'Architettura / Spazio Pubblico','Arti visive','Bio-Art / Sci-Art',
    'Cinema / Audiovisivo','Curatela / Ricerca','Danza',
    'Design / Product Design','Editoria / Scrittura','Formazione / Didattica','Fotografia',
    'Installazione','Makers / Artigianato Digitale','New Media Art','Residenza',
    'Performance','Pittura','Scultura','Sound','Teatro','Videoarte'
  ) THEN
    RAISE EXCEPTION 'Categoria realtà non valida: %', NEW.category;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_reality_categories()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  allowed text[] := ARRAY[
    'Architettura / Spazio Pubblico','Arti visive','Bio-Art / Sci-Art',
    'Cinema / Audiovisivo','Curatela / Ricerca','Danza',
    'Design / Product Design','Editoria / Scrittura','Formazione / Didattica','Fotografia',
    'Installazione','Makers / Artigianato Digitale','New Media Art','Residenza',
    'Performance','Pittura','Scultura','Sound','Teatro','Videoarte'
  ];
  c text;
BEGIN
  IF (NEW.categories IS NULL OR cardinality(NEW.categories) = 0)
     AND NEW.category IS NOT NULL THEN
    NEW.categories := ARRAY[NEW.category];
  END IF;

  IF NEW.categories IS NOT NULL AND cardinality(NEW.categories) > 0 THEN
    SELECT array_agg(DISTINCT v ORDER BY v) INTO NEW.categories
    FROM unnest(NEW.categories) WITH ORDINALITY AS t(v, ord);
    NEW.categories := (
      SELECT array_agg(v ORDER BY min_ord)
      FROM (
        SELECT v, MIN(ord) AS min_ord
        FROM unnest(NEW.categories) WITH ORDINALITY AS u(v, ord)
        GROUP BY v
      ) s
    );

    FOREACH c IN ARRAY NEW.categories LOOP
      IF NOT (c = ANY(allowed)) THEN
        RAISE EXCEPTION 'Categoria realtà non valida: %', c;
      END IF;
    END LOOP;
  END IF;

  IF NEW.categories IS NOT NULL AND cardinality(NEW.categories) > 0 THEN
    NEW.category := NEW.categories[1];
  ELSE
    NEW.category := NULL;
  END IF;

  RETURN NEW;
END;
$function$;
