CREATE OR REPLACE FUNCTION public.prevent_profile_staff_field_selfedit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Staff bypass (admin, moderator, coordinatore)
  IF public.has_role(auth.uid(), 'admin')
     OR public.has_role(auth.uid(), 'moderator')
     OR public.has_role(auth.uid(), 'coordinatore') THEN
    RETURN NEW;
  END IF;

  IF NEW.reality_id IS DISTINCT FROM OLD.reality_id THEN
    RAISE EXCEPTION 'Non puoi modificare autonomamente l''affiliazione: contatta lo staff.';
  END IF;
  IF NEW.member_type IS DISTINCT FROM OLD.member_type THEN
    RAISE EXCEPTION 'Non puoi modificare autonomamente il tipo di membro.';
  END IF;
  IF NEW.role_collective IS DISTINCT FROM OLD.role_collective THEN
    RAISE EXCEPTION 'Non puoi modificare autonomamente il ruolo nel collettivo.';
  END IF;
  IF NEW.display_priority IS DISTINCT FROM OLD.display_priority THEN
    RAISE EXCEPTION 'Non puoi modificare autonomamente l''ordine di visualizzazione.';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_profile_staff_field_selfedit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_prevent_staff_field_selfedit ON public.profiles;
CREATE TRIGGER profiles_prevent_staff_field_selfedit
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_staff_field_selfedit();