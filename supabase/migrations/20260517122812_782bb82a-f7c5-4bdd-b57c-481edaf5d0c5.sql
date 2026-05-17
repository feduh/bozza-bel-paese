
-- 1) realities.category + validation trigger
ALTER TABLE public.realities ADD COLUMN IF NOT EXISTS category text;

CREATE OR REPLACE FUNCTION public.validate_reality_category()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.category IS NOT NULL AND NEW.category NOT IN (
    'Architettura / Spazio Pubblico','Arti visive','Bio-Art / Sci-Art',
    'Cinema / Audiovisivo','Curatela / Ricerca','Danza',
    'Design / Product Design','Editoria / Scrittura','Fotografia',
    'Installazione','Makers / Artigianato Digitale','New Media Art',
    'Performance','Pittura','Scultura','Sound','Teatro','Videoarte'
  ) THEN
    RAISE EXCEPTION 'Categoria realtà non valida: %', NEW.category;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_reality_category ON public.realities;
CREATE TRIGGER trg_validate_reality_category
  BEFORE INSERT OR UPDATE ON public.realities
  FOR EACH ROW EXECUTE FUNCTION public.validate_reality_category();

-- 2) profiles enrichment
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_public boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_collective text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_real_life text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_linkedin text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS figure_category text;

CREATE OR REPLACE FUNCTION public.validate_profile_enums()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.member_type IS NOT NULL AND NEW.member_type NOT IN ('collaboratore','autore') THEN
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
$$;

DROP TRIGGER IF EXISTS trg_validate_profile_enums ON public.profiles;
CREATE TRIGGER trg_validate_profile_enums
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_enums();

-- 3) Public read policy for profiles with consent
CREATE POLICY "Public reads consented profiles"
ON public.profiles
FOR SELECT
TO anon
USING (consent_public = true);

-- 4) Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
