ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_priority integer;

UPDATE public.profiles SET display_priority = 1 WHERE role_collective = 'Founder' AND display_priority IS NULL;
UPDATE public.profiles SET display_priority = 2 WHERE role_collective = 'Co-Founder' AND display_priority IS NULL;
UPDATE public.profiles SET display_priority = 3 WHERE role_collective = 'Project Manager' AND display_priority IS NULL;
UPDATE public.profiles SET display_priority = 4 WHERE role_collective = 'Tech Lead' AND display_priority IS NULL;
UPDATE public.profiles SET display_priority = 5 WHERE role_collective = 'Digital Communications Manager' AND display_priority IS NULL;

CREATE INDEX IF NOT EXISTS profiles_display_priority_idx ON public.profiles (display_priority);