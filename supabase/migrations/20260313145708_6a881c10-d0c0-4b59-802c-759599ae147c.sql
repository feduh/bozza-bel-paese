
-- Create enum for reality type
CREATE TYPE public.reality_type AS ENUM ('nomade', 'con-sede', 'scomparsa');

-- Create realities table
CREATE TABLE public.realities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type reality_type NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  year_founded INTEGER NOT NULL,
  year_closed INTEGER,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  website TEXT,
  image_url TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table for disciplines/categories
CREATE TABLE public.reality_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reality_id UUID REFERENCES public.realities(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  UNIQUE(reality_id, tag)
);

-- Enable RLS
ALTER TABLE public.realities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_tags ENABLE ROW LEVEL SECURITY;

-- Public read for realities
CREATE POLICY "Anyone can read realities"
  ON public.realities FOR SELECT
  USING (true);

-- Public read for tags
CREATE POLICY "Anyone can read reality tags"
  ON public.reality_tags FOR SELECT
  USING (true);

-- Admin role setup
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin-only write policies for realities
CREATE POLICY "Admins can insert realities"
  ON public.realities FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update realities"
  ON public.realities FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete realities"
  ON public.realities FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only write policies for tags
CREATE POLICY "Admins can insert reality tags"
  ON public.reality_tags FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reality tags"
  ON public.reality_tags FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reality tags"
  ON public.reality_tags FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin read own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_realities_updated_at
  BEFORE UPDATE ON public.realities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
