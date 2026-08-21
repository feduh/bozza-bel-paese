DROP POLICY "Authors update own pending submissions" ON public.editorial_submissions;

CREATE POLICY "Authors update own pending submissions"
ON public.editorial_submissions
FOR UPDATE
TO authenticated
USING (author_user_id = auth.uid() AND status = 'pending'::editorial_submission_status)
WITH CHECK (
  author_user_id = auth.uid()
  AND status IN ('pending'::editorial_submission_status, 'withdrawn'::editorial_submission_status)
);

CREATE OR REPLACE FUNCTION public.protect_submission_staff_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Staff / editors may change anything
  IF public.has_role(auth.uid(), 'admin')
     OR public.is_editor_chief_of_edition(NEW.edition_id)
     OR (NEW.special_issue_id IS NOT NULL AND public.is_guest_editor_of_si(NEW.special_issue_id))
     OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.curator_notes IS DISTINCT FROM OLD.curator_notes THEN
    RAISE EXCEPTION 'Non puoi modificare le note del curatore';
  END IF;
  IF NEW.converted_post_id IS DISTINCT FROM OLD.converted_post_id THEN
    RAISE EXCEPTION 'Non puoi collegare autonomamente un articolo alla candidatura';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status NOT IN ('pending'::editorial_submission_status, 'withdrawn'::editorial_submission_status) THEN
    RAISE EXCEPTION 'Non puoi modificare lo stato di revisione della candidatura';
  END IF;
  IF NEW.author_user_id IS DISTINCT FROM OLD.author_user_id THEN
    RAISE EXCEPTION 'Non puoi cambiare l''autore della candidatura';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_submission_staff_fields ON public.editorial_submissions;
CREATE TRIGGER trg_protect_submission_staff_fields
BEFORE UPDATE ON public.editorial_submissions
FOR EACH ROW EXECUTE FUNCTION public.protect_submission_staff_fields();