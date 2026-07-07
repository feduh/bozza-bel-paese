ALTER TABLE public.realities
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS social_vimeo  text;