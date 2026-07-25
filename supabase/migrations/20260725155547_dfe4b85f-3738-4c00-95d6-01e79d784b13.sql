
-- ENUMS
CREATE TYPE public.editorial_edition_status AS ENUM ('draft','open_submissions','closed_submissions','published','archived');
CREATE TYPE public.editorial_submission_status AS ENUM ('pending','accepted','rejected','withdrawn','converted');

-- TABLE: editorial_editions
CREATE TABLE public.editorial_editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL UNIQUE,
  title text NOT NULL,
  theme_description text,
  curator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.editorial_edition_status NOT NULL DEFAULT 'draft',
  submissions_open_at timestamptz,
  submissions_close_at timestamptz,
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.editorial_editions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_editions TO authenticated;
GRANT ALL ON public.editorial_editions TO service_role;

ALTER TABLE public.editorial_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editions readable by everyone"
  ON public.editorial_editions FOR SELECT
  USING (true);

CREATE POLICY "Admins manage editions"
  ON public.editorial_editions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Curator can update own edition"
  ON public.editorial_editions FOR UPDATE
  TO authenticated
  USING (curator_user_id = auth.uid())
  WITH CHECK (curator_user_id = auth.uid());

CREATE TRIGGER trg_editorial_editions_updated_at
  BEFORE UPDATE ON public.editorial_editions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: is current user the curator of an edition?
CREATE OR REPLACE FUNCTION public.is_curator_of_edition(_edition_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.editorial_editions
    WHERE id = _edition_id AND curator_user_id = auth.uid()
  )
$$;

-- TABLE: editorial_submissions
CREATE TABLE public.editorial_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id uuid NOT NULL REFERENCES public.editorial_editions(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  abstract text NOT NULL,
  outline text,
  references_text text,
  status public.editorial_submission_status NOT NULL DEFAULT 'pending',
  curator_notes text,
  converted_post_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_editorial_submissions_edition ON public.editorial_submissions(edition_id);
CREATE INDEX idx_editorial_submissions_author ON public.editorial_submissions(author_user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_submissions TO authenticated;
GRANT ALL ON public.editorial_submissions TO service_role;

ALTER TABLE public.editorial_submissions ENABLE ROW LEVEL SECURITY;

-- Authors: read their own
CREATE POLICY "Authors read own submissions"
  ON public.editorial_submissions FOR SELECT
  TO authenticated
  USING (author_user_id = auth.uid());

-- Curator + admin: read all in their edition
CREATE POLICY "Curator and admin read edition submissions"
  ON public.editorial_submissions FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.is_curator_of_edition(edition_id)
  );

-- Authors: insert only for editions in open_submissions, only for themselves
CREATE POLICY "Authors insert own submissions when open"
  ON public.editorial_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    author_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.editorial_editions e
      WHERE e.id = edition_id AND e.status = 'open_submissions'
    )
  );

-- Authors: update (withdraw / edit) their own while pending
CREATE POLICY "Authors update own pending submissions"
  ON public.editorial_submissions FOR UPDATE
  TO authenticated
  USING (author_user_id = auth.uid() AND status = 'pending')
  WITH CHECK (author_user_id = auth.uid());

-- Curator + admin: update any submission in their edition
CREATE POLICY "Curator and admin update edition submissions"
  ON public.editorial_submissions FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.is_curator_of_edition(edition_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR public.is_curator_of_edition(edition_id)
  );

-- Admin: delete
CREATE POLICY "Admin delete submissions"
  ON public.editorial_submissions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_editorial_submissions_updated_at
  BEFORE UPDATE ON public.editorial_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blog posts: link to edition
ALTER TABLE public.blog_posts
  ADD COLUMN editorial_edition_id uuid REFERENCES public.editorial_editions(id) ON DELETE SET NULL;

CREATE INDEX idx_blog_posts_editorial_edition ON public.blog_posts(editorial_edition_id);

-- Notifications on submission status change
CREATE OR REPLACE FUNCTION public.notify_editorial_submission_status()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- notify curator + admins
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT e.curator_user_id, 'editorial_submission_new',
           'Nuova candidatura editoriale',
           'Hai ricevuto una nuova candidatura: "' || NEW.title || '"',
           '/area-personale?tab=editoriale-curatela'
    FROM public.editorial_editions e
    WHERE e.id = NEW.edition_id AND e.curator_user_id IS NOT NULL
      AND e.curator_user_id <> NEW.author_user_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('accepted','rejected') THEN
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (
        NEW.author_user_id,
        'editorial_submission_' || NEW.status::text,
        CASE WHEN NEW.status = 'accepted' THEN 'Candidatura accettata'
             ELSE 'Candidatura non accettata' END,
        'La tua candidatura "' || NEW.title || '" è stata ' ||
          CASE WHEN NEW.status = 'accepted' THEN 'accettata dal curatore.'
               ELSE 'valutata. Consulta le note del curatore.' END,
        '/area-personale?tab=editoriale'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_editorial_submission
  AFTER INSERT OR UPDATE ON public.editorial_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_editorial_submission_status();
