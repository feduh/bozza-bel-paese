import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, User, ArrowLeft, Swords } from "lucide-react";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  category: string;
  cover_image_url: string | null;
  is_point_counterpoint: boolean;
  counterpart_id: string | null;
  stance: "point" | "counterpoint" | null;
  published_at: string;
};

const MagazinePost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [counterpart, setCounterpart] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (cancelled) return;
      const p = (data as Post | null) ?? null;
      setPost(p);

      if (p?.is_point_counterpoint) {
        // Find counterpart: either p.counterpart_id, or post that points back
        let cp: Post | null = null;
        if (p.counterpart_id) {
          const { data: c } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("id", p.counterpart_id)
            .maybeSingle();
          cp = (c as Post | null) ?? null;
        } else {
          const { data: c } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("counterpart_id", p.id)
            .maybeSingle();
          cp = (c as Post | null) ?? null;
        }
        if (!cancelled) setCounterpart(cp);
      } else {
        setCounterpart(null);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground font-body">
        Caricamento...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <p className="font-body text-muted-foreground mb-6">Articolo non trovato.</p>
        <Link to="/magazine" className="text-primary underline font-body">
          Torna al magazine
        </Link>
      </div>
    );
  }

  return (
    <article className="py-16">
      <div className="editorial-container max-w-3xl">
        <Link
          to="/magazine"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-8"
        >
          <ArrowLeft size={14} /> Torna al magazine
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {post.category}
          </span>
          {post.is_point_counterpoint && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                post.stance === "point"
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary/15 text-secondary border-secondary/30"
              }`}
            >
              <Swords size={10} />
              {post.stance === "point" ? "Point" : "Counter Point"}
            </span>
          )}
        </div>

        <h1 className="editorial-heading mb-6">{post.title}</h1>

        <div className="flex items-center gap-5 text-sm text-muted-foreground font-body mb-10 pb-10 border-b border-border">
          <span className="flex items-center gap-1.5">
            <User size={14} /> {post.author_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(post.published_at).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            loading="lazy"
            className="w-full rounded-lg mb-10 aspect-video object-cover"
          />
        )}

        <p className="font-display text-xl text-foreground/90 italic leading-relaxed mb-10">
          {post.excerpt}
        </p>

        <div className="font-body text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {post.content}
        </div>

        {counterpart && (
          <div className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-widest font-bold text-muted-foreground">
              <Swords size={14} className="text-primary" />
              {post.stance === "point" ? "Leggi la replica" : "Leggi la tesi iniziale"}
            </div>
            <Link
              to={`/magazine/${counterpart.slug}`}
              className="block p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
            >
              <span
                className={`inline-block text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border mb-3 ${
                  counterpart.stance === "point"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-secondary/15 text-secondary border-secondary/30"
                }`}
              >
                {counterpart.stance === "point" ? "Point" : "Counter Point"}
              </span>
              <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {counterpart.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground line-clamp-2">
                {counterpart.excerpt}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-3">
                di {counterpart.author_name}
              </p>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};

export default MagazinePost;
