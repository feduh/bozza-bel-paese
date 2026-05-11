
-- Add status column for active/archived realities
ALTER TABLE public.realities 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'attivo';

ALTER TABLE public.realities
DROP CONSTRAINT IF EXISTS realities_status_check;

ALTER TABLE public.realities
ADD CONSTRAINT realities_status_check CHECK (status IN ('attivo', 'archiviato'));

-- Migrate existing 'scomparsa' rows to archived state, keep type as best-guess 'con-sede'
UPDATE public.realities SET status = 'archiviato' WHERE type = 'scomparsa';
UPDATE public.realities SET type = 'con-sede' WHERE type = 'scomparsa';

CREATE INDEX IF NOT EXISTS idx_realities_status ON public.realities(status);
CREATE INDEX IF NOT EXISTS idx_realities_type ON public.realities(type);
