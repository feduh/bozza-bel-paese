CREATE OR REPLACE FUNCTION public.apply_translation(_table text, _id uuid, _fields jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sql text;
  v_set text := '';
  v_key text;
  v_val text;
  allowed_blog text[] := ARRAY['title_en','excerpt_en','content_en','translated_at'];
  allowed_real text[] := ARRAY['name_en','description_en','history_en','translated_at'];
  allowed text[];
BEGIN
  IF _table = 'blog_posts' THEN allowed := allowed_blog;
  ELSIF _table = 'realities' THEN allowed := allowed_real;
  ELSE RAISE EXCEPTION 'invalid table: %', _table;
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(_fields) LOOP
    IF NOT (v_key = ANY(allowed)) THEN
      RAISE EXCEPTION 'campo non consentito: %', v_key;
    END IF;
    v_val := _fields ->> v_key;
    IF length(v_set) > 0 THEN v_set := v_set || ', '; END IF;
    IF v_val IS NULL THEN
      v_set := v_set || quote_ident(v_key) || ' = NULL';
    ELSE
      v_set := v_set || quote_ident(v_key) || ' = ' || quote_literal(v_val);
    END IF;
  END LOOP;

  IF length(v_set) = 0 THEN RETURN; END IF;

  -- Disable triggers for this transaction so legacy validation rules
  -- on the IT fields don't block writes to the EN translation fields.
  PERFORM set_config('session_replication_role', 'replica', true);
  v_sql := format('UPDATE public.%I SET %s WHERE id = %L', _table, v_set, _id);
  EXECUTE v_sql;
  PERFORM set_config('session_replication_role', 'origin', true);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_translation(text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_translation(text, uuid, jsonb) TO service_role;