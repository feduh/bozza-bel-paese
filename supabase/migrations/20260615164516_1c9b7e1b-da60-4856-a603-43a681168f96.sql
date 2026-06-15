CREATE OR REPLACE FUNCTION public.validate_blog_post_copyright()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Skip when only translation/metadata fields changed
  IF TG_OP = 'UPDATE'
     AND NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.copyright_declaration IS NOT DISTINCT FROM OLD.copyright_declaration
     AND NEW.copyright_check_status IS NOT DISTINCT FROM OLD.copyright_check_status THEN
    RETURN NEW;
  END IF;

  IF NEW.copyright_check_status NOT IN ('pending','ok','blocked') THEN
    RAISE EXCEPTION 'copyright_check_status non valido: %', NEW.copyright_check_status;
  END IF;

  IF NEW.status IN ('published','scheduled','pending') THEN
    IF NEW.copyright_declaration IS NULL THEN
      RAISE EXCEPTION 'Devi compilare la dichiarazione di copyright prima di inviare o programmare l''articolo.';
    END IF;
    IF NEW.copyright_check_status <> 'ok' THEN
      RAISE EXCEPTION 'La verifica copyright non è stata superata: l''articolo non può essere pubblicato o programmato.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_blog_post_schedule()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.scheduled_for IS NOT DISTINCT FROM OLD.scheduled_for THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('draft','pending','scheduled','published') THEN
    RAISE EXCEPTION 'status non valido: %', NEW.status;
  END IF;

  IF NEW.status = 'scheduled' THEN
    IF NEW.scheduled_for IS NULL THEN
      RAISE EXCEPTION 'Indica data e ora di pubblicazione per programmare l''articolo.';
    END IF;
    IF EXTRACT(MINUTE FROM NEW.scheduled_for)::int NOT IN (0, 30)
       OR EXTRACT(SECOND FROM NEW.scheduled_for) <> 0 THEN
      RAISE EXCEPTION 'L''orario di pubblicazione deve essere allineato a slot di 30 minuti (es. 14:00 o 14:30).';
    END IF;
    IF NEW.scheduled_for <= now() THEN
      RAISE EXCEPTION 'L''orario di pubblicazione deve essere nel futuro.';
    END IF;
  ELSE
    NEW.scheduled_for := NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Make apply_translation simply do the UPDATE; validators above now skip translation-only changes
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
  v_sql := format('UPDATE public.%I SET %s WHERE id = %L', _table, v_set, _id);
  EXECUTE v_sql;
END;
$$;