-- Add new columns to realities for richer import data
ALTER TABLE public.realities
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Italia',
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS ig_link text,
  ADD COLUMN IF NOT EXISTS fb_link text,
  ADD COLUMN IF NOT EXISTS linkedin_link text,
  ADD COLUMN IF NOT EXISTS contacted_at date,
  ADD COLUMN IF NOT EXISTS confirmed_status text NOT NULL DEFAULT 'pendente';

-- Validate confirmed_status values via trigger (avoiding CHECK so it stays flexible)
CREATE OR REPLACE FUNCTION public.validate_reality_confirmed_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.confirmed_status NOT IN ('pendente', 'confermato', 'storico') THEN
    RAISE EXCEPTION 'confirmed_status deve essere "pendente", "confermato" o "storico"';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_reality_confirmed_status ON public.realities;
CREATE TRIGGER trg_validate_reality_confirmed_status
  BEFORE INSERT OR UPDATE ON public.realities
  FOR EACH ROW EXECUTE FUNCTION public.validate_reality_confirmed_status();

CREATE INDEX IF NOT EXISTS idx_realities_confirmed_status ON public.realities(confirmed_status);
CREATE INDEX IF NOT EXISTS idx_realities_region ON public.realities(region);
CREATE INDEX IF NOT EXISTS idx_realities_type ON public.realities(type);