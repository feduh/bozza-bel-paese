-- Audit log table
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name text NOT NULL,
  row_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX idx_audit_table ON public.admin_audit_log (table_name, created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit log"
ON public.admin_audit_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- No insert/update/delete policies => only triggers (security definer) can write

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text;
  v_row_id uuid;
BEGIN
  -- Skip logging if no authenticated actor (e.g. system migrations)
  IF v_actor IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_actor;

  IF TG_OP = 'DELETE' THEN
    v_row_id := (OLD.id)::uuid;
  ELSE
    v_row_id := (NEW.id)::uuid;
  END IF;

  INSERT INTO public.admin_audit_log
    (actor_id, actor_email, action, table_name, row_id, old_data, new_data)
  VALUES (
    v_actor,
    v_email,
    TG_OP,
    TG_TABLE_NAME,
    v_row_id,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('UPDATE','INSERT') THEN to_jsonb(NEW) END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach triggers
CREATE TRIGGER audit_realities
AFTER INSERT OR UPDATE OR DELETE ON public.realities
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_blog_posts
AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();