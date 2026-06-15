-- Loop guard via session GUC + extend apply_translation to allow IT source fields
CREATE OR REPLACE FUNCTION public.apply_translation(_table text, _id uuid, _fields jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sql text;
  v_set text := '';
  v_key text;
  v_val text;
  allowed_blog text[] := ARRAY['title','excerpt','content','title_en','excerpt_en','content_en','translated_at'];
  allowed_real text[] := ARRAY['name','description','history','name_en','description_en','history_en','translated_at'];
  allowed text[];
BEGIN
  IF _table = 'blog_posts' THEN allowed := allowed_blog;
  ELSIF _table = 'realities' THEN allowed := allowed_real;
  ELSE RAISE EXCEPTION 'invalid table: %', _table;
  END IF;

  -- Mark this session as auto-translate so the trigger can skip recursion
  PERFORM set_config('ibp.skip_translate', 'on', true);

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
$function$;

-- Trigger: skip when the auto-translate session flag is set
CREATE OR REPLACE FUNCTION public.enqueue_auto_translate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_url text := 'https://wxvexxwviaqxxnrrbshs.supabase.co/functions/v1/auto-translate';
  v_should_translate boolean := false;
BEGIN
  -- Skip if the write originates from apply_translation itself
  IF current_setting('ibp.skip_translate', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'blog_posts' THEN
    IF TG_OP = 'INSERT' THEN
      v_should_translate := COALESCE(NEW.title,'') <> '' OR COALESCE(NEW.excerpt,'') <> '' OR COALESCE(NEW.content,'') <> '';
    ELSE
      v_should_translate :=
        COALESCE(NEW.title,'')   IS DISTINCT FROM COALESCE(OLD.title,'')   OR
        COALESCE(NEW.excerpt,'') IS DISTINCT FROM COALESCE(OLD.excerpt,'') OR
        COALESCE(NEW.content,'') IS DISTINCT FROM COALESCE(OLD.content,'');
    END IF;
  ELSIF TG_TABLE_NAME = 'realities' THEN
    IF TG_OP = 'INSERT' THEN
      v_should_translate := COALESCE(NEW.name,'') <> '' OR COALESCE(NEW.description,'') <> '' OR COALESCE(NEW.history,'') <> '';
    ELSE
      v_should_translate :=
        COALESCE(NEW.name,'')        IS DISTINCT FROM COALESCE(OLD.name,'')        OR
        COALESCE(NEW.description,'') IS DISTINCT FROM COALESCE(OLD.description,'') OR
        COALESCE(NEW.history,'')     IS DISTINCT FROM COALESCE(OLD.history,'');
    END IF;
  END IF;

  IF v_should_translate THEN
    PERFORM net.http_post(
      url := v_url,
      headers := jsonb_build_object('Content-Type','application/json'),
      body := jsonb_build_object('table', TG_TABLE_NAME, 'id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$function$;