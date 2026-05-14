import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, User, ArrowLeft, Reply, ArrowUpLeft, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SEO from "@/components/SEO";
import { PostDetailSkeleton } from "@/components/skeletons";
import SmartImage from "@/components/SmartImage";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  category: string;
  cover_image_url: string | null;
  reply_to_id: string | null;
  published_at: string;
  status: string;
};

type ReplyMeta = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  published_at: string;
};

const MagazinePost = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [parent, setParent] = useState<ReplyMeta | null>(null);
  const [replies, setReplies] = useState<ReplyMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const readingTime = useMemo(() => {
    if (!post?.content) return 1;
    const text = post.content.replace(/[#>*_`\-\[\]()!]/g, "");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [post?.content]);

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
      const p = data as Post | null;
      setPost(p);

      if (p?.reply_to_id) {
        const { data: parentData } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, author_name, published_at")
          .eq("id", p.reply_to_id)
          .eq("status", "published")
          .maybeSingle();
        if (!cancelled) setParent((parentData as ReplyMeta | null) ?? null);
      } else {
        setParent(null);
      }

      if (p) {
        const { data: replyData } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, author_name, published_at")
          .eq("reply_to_id", p.id)
          .eq("status", "published")
          .order("published_at", { ascending: true });
        if (!cancelled) setReplies((replyData as ReplyMeta[]) ?? []);
      }

      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <PostDetailSkeleton />;

  if (!post) {
    return (
      <div className="py-20 text-center">
        <p className="font-body text-muted-foreground mb-6">{t("magazine.notFound")}</p>
        <Link to="/magazine" className="text-primary underline font-body">
          {t("magazine.back")}
        </Link>
      </div>
    );
  }

  return (
    <article className="py-16">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.cover_image_url ?? undefined}
        type="article"
        canonicalPath={`/magazine/${post.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image_url ?? undefined,
          datePublished: post.published_at,
          author: { "@type": "Person", name: post.author_name },
          publisher: { "@type": "Organization", name: "Il Bel Paese" },
          articleSection: post.category,
          inLanguage: "it-IT",
        }}
      />
      <div className="editorial-container max-w-3xl">
        <Link
          to="/magazine"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-8"
        >
          <ArrowLeft size={14} /> {t("magazine.back")}
        </Link>

        {parent && (
          <Link
            to={`/magazine/${parent.slug}`}
            className="block mb-8 p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">
              <ArrowUpLeft size={14} className="text-primary" /> In risposta a
            </div>
            <p className="font-display text-base font-semibold text-foreground">
              {parent.title}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">
              di {parent.author_name}
            </p>
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {post.category}
          </span>
          {post.reply_to_id && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
              <Reply size={10} /> Risposta
            </span>
          )}
        </div>

        <h1 className="editorial-heading mb-6">{post.title}</h1>

        <div className="flex items-center gap-5 text-sm text-muted-foreground font-body mb-10 pb-10 border-b border-border flex-wrap">
          <span className="flex items-center gap-1.5">
            <User size={14} /> {post.author_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(post.published_at).toLocaleDateString(
              i18n.language === "en" ? "en-GB" : "it-IT",
              { day: "numeric", month: "long", year: "numeric" }
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {readingTime} min di lettura
          </span>
        </div>

        {post.cover_image_url && (
          <SmartImage
            src={post.cover_image_url}
            alt={post.title}
            priority
            aspect="16/9"
            wrapperClassName="w-full rounded-lg mb-10"
            className="w-full h-full object-cover"
          />
        )}

        <p className="font-display text-xl text-foreground/90 italic leading-relaxed mb-10">
          {post.excerpt}
        </p>

        <div className="prose prose-lg max-w-none dark:prose-invert font-body prose-headings:font-display prose-a:text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {/* Reply section */}
        <div className="mt-16 pt-10 border-t border-border">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
              <Reply size={20} className="text-primary" />
              Risposte {replies.length > 0 && (
                <span className="text-muted-foreground text-base font-body">({replies.length})</span>
              )}
            </h2>
            {user ? (
              <Link
                to={`/area-personale/articolo/nuovo?reply_to=${post.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-body font-medium hover:opacity-90 transition-opacity"
              >
                <Reply size={14} /> Scrivi una risposta
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-sm text-muted-foreground font-body hover:text-primary"
              >
                Accedi per rispondere →
              </Link>
            )}
          </div>

          {replies.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body italic">
              Nessuna risposta ancora. Sii il primo a contribuire al dialogo.
            </p>
          ) : (
            <div className="space-y-4">
              {replies.map((r) => (
                <Link
                  key={r.id}
                  to={`/magazine/${r.slug}`}
                  className="block p-5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
                >
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {r.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-3">
                    {r.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {r.author_name}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(r.published_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default MagazinePost;
