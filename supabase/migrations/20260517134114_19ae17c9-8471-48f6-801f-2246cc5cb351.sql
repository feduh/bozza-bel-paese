-- Rename enum value: collaborator -> coordinatore
ALTER TYPE public.app_role RENAME VALUE 'collaborator' TO 'coordinatore';

-- Recreate function that references the enum label as a string literal
CREATE OR REPLACE FUNCTION public.auto_confirm_pending_realities()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected integer;
BEGIN
  WITH promoted AS (
    UPDATE public.realities r
    SET
      confirmed_status = 'confermato',
      confirmed_by = r.created_by,
      confirmed_at = now()
    WHERE r.confirmed_status = 'pendente'
      AND r.auto_confirm_at IS NOT NULL
      AND r.auto_confirm_at <= now()
      AND r.created_by IS NOT NULL
      AND public.has_role(r.created_by, 'coordinatore')
    RETURNING 1
  )
  SELECT count(*)::int INTO affected FROM promoted;
  RETURN affected;
END;
$function$;