-- Step 1: relax validator to accept both old and new
CREATE OR REPLACE FUNCTION public.validate_profile_enums()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.member_type IS NOT NULL AND NEW.member_type NOT IN ('coordinatore','collaboratore','autore') THEN
    RAISE EXCEPTION 'member_type non valido: %', NEW.member_type;
  END IF;
  IF NEW.figure_category IS NOT NULL AND NEW.figure_category NOT IN (
    'Istituzione','Università','Ricercatore indipendente','Curatore indipendente',
    'Artista','Critico','Giornalista','Studente','Gallerista','Editore','Designer','Altro'
  ) THEN
    RAISE EXCEPTION 'figure_category non valida: %', NEW.figure_category;
  END IF;
  RETURN NEW;
END;
$function$;

-- Step 2: migrate existing data
UPDATE public.profiles
SET member_type = 'coordinatore'
WHERE member_type = 'collaboratore';

-- Step 3: tighten validator to the final set
CREATE OR REPLACE FUNCTION public.validate_profile_enums()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.member_type IS NOT NULL AND NEW.member_type NOT IN ('coordinatore','autore') THEN
    RAISE EXCEPTION 'member_type non valido: %', NEW.member_type;
  END IF;
  IF NEW.figure_category IS NOT NULL AND NEW.figure_category NOT IN (
    'Istituzione','Università','Ricercatore indipendente','Curatore indipendente',
    'Artista','Critico','Giornalista','Studente','Gallerista','Editore','Designer','Altro'
  ) THEN
    RAISE EXCEPTION 'figure_category non valida: %', NEW.figure_category;
  END IF;
  RETURN NEW;
END;
$function$;