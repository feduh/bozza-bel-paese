CREATE TABLE public.reality_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reality_id uuid NOT NULL REFERENCES public.realities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reality_id)
);

GRANT SELECT, INSERT, DELETE ON public.reality_bookmarks TO authenticated;
GRANT ALL ON public.reality_bookmarks TO service_role;

ALTER TABLE public.reality_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bookmarks"
  ON public.reality_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bookmarks"
  ON public.reality_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own bookmarks"
  ON public.reality_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_reality_bookmarks_user ON public.reality_bookmarks(user_id);
CREATE INDEX idx_reality_bookmarks_reality ON public.reality_bookmarks(reality_id);