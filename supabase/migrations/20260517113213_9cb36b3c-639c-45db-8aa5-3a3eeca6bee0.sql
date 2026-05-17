-- Reality reports: public submissions of missing artistic realities
CREATE TABLE public.reality_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  region TEXT,
  description TEXT,
  website TEXT,
  contact_email TEXT,
  reporter_email TEXT,
  reporter_name TEXT,
  reporter_user_id UUID,
  status TEXT NOT NULL DEFAULT 'nuova',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reality_reports ENABLE ROW LEVEL SECURITY;

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_reality_report_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('nuova', 'in_lavorazione', 'archiviata', 'convertita') THEN
    RAISE EXCEPTION 'status deve essere "nuova", "in_lavorazione", "archiviata" o "convertita"';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_reality_report_status_trg
BEFORE INSERT OR UPDATE ON public.reality_reports
FOR EACH ROW EXECUTE FUNCTION public.validate_reality_report_status();

CREATE TRIGGER update_reality_reports_updated_at
BEFORE UPDATE ON public.reality_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Anyone can submit a report
CREATE POLICY "Anyone can submit reality reports"
ON public.reality_reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Staff (admin/moderator) read/update/delete
CREATE POLICY "Staff read reality reports"
ON public.reality_reports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Staff update reality reports"
ON public.reality_reports
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins delete reality reports"
ON public.reality_reports
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_reality_reports_status ON public.reality_reports(status);
CREATE INDEX idx_reality_reports_created_at ON public.reality_reports(created_at DESC);