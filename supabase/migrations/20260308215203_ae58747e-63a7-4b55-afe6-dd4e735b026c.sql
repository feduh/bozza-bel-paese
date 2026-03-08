
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can read blog posts"
  ON public.blog_posts FOR SELECT
  USING (true);

-- Only authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
