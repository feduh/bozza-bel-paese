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
      AND (
        public.has_role(r.created_by, 'coordinatore')
        OR public.has_role(r.created_by, 'admin')
        OR public.has_role(r.created_by, 'moderator')
      )
    RETURNING 1
  )
  SELECT count(*)::int INTO affected FROM promoted;
  RETURN affected;
END;
$function$;

-- Confermare subito le realtà pending già scadute create da staff
SELECT public.auto_confirm_pending_realities();