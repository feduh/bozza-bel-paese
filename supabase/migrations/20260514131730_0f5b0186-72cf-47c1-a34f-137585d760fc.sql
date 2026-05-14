
-- Reality images gallery
CREATE TABLE public.reality_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reality_id UUID NOT NULL REFERENCES public.realities(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  credit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reality_images_reality ON public.reality_images(reality_id, sort_order);

ALTER TABLE public.reality_images ENABLE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY "Public reads images of confirmed realities"
ON public.reality_images FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.realities r WHERE r.id = reality_images.reality_id AND r.confirmed_status = 'confermato'));

CREATE POLICY "Staff reads all reality images"
ON public.reality_images FOR SELECT TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'moderator') OR has_role(auth.uid(),'collaborator'));

CREATE POLICY "Owners read images of own pending"
ON public.reality_images FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.realities r WHERE r.id = reality_images.reality_id AND r.created_by = auth.uid()));

-- INSERT/UPDATE/DELETE
CREATE POLICY "Admins/moderators manage images insert"
ON public.reality_images FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'moderator'));

CREATE POLICY "Admins/moderators manage images update"
ON public.reality_images FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'moderator'));

CREATE POLICY "Admins/moderators manage images delete"
ON public.reality_images FOR DELETE TO authenticated
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'moderator'));

CREATE POLICY "Collaborators insert images on own pending"
ON public.reality_images FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(),'collaborator')
  AND EXISTS (SELECT 1 FROM public.realities r WHERE r.id = reality_images.reality_id AND r.created_by = auth.uid() AND r.confirmed_status = 'pendente')
);

CREATE POLICY "Collaborators update images on own pending"
ON public.reality_images FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(),'collaborator')
  AND EXISTS (SELECT 1 FROM public.realities r WHERE r.id = reality_images.reality_id AND r.created_by = auth.uid() AND r.confirmed_status = 'pendente')
);

CREATE POLICY "Collaborators delete images on own pending"
ON public.reality_images FOR DELETE TO authenticated
USING (
  has_role(auth.uid(),'collaborator')
  AND EXISTS (SELECT 1 FROM public.realities r WHERE r.id = reality_images.reality_id AND r.created_by = auth.uid() AND r.confirmed_status = 'pendente')
);

CREATE TRIGGER update_reality_images_updated_at
BEFORE UPDATE ON public.reality_images
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('reality-images', 'reality-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies — file path convention: {reality_id}/{filename}
CREATE POLICY "Public read reality-images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'reality-images');

CREATE POLICY "Staff upload reality-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'reality-images'
  AND (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'moderator')
    OR (
      has_role(auth.uid(),'collaborator')
      AND EXISTS (
        SELECT 1 FROM public.realities r
        WHERE r.id::text = (storage.foldername(name))[1]
          AND r.created_by = auth.uid()
          AND r.confirmed_status = 'pendente'
      )
    )
  )
);

CREATE POLICY "Staff update reality-images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'reality-images'
  AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'moderator'))
);

CREATE POLICY "Staff delete reality-images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'reality-images'
  AND (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'moderator')
    OR (
      has_role(auth.uid(),'collaborator')
      AND EXISTS (
        SELECT 1 FROM public.realities r
        WHERE r.id::text = (storage.foldername(name))[1]
          AND r.created_by = auth.uid()
          AND r.confirmed_status = 'pendente'
      )
    )
  )
);
