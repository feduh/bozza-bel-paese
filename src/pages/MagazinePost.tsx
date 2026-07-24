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
import { parseCategories } from "@/lib/articleCategories";
import { fetchAuthorNames, resolveAuthorName } from "@/lib/authorNames";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  user_id: string;
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
  user_id: string;
  published_at: string;
};

type AuthorBio = {
  user_id: string;
  display_name: string;
  author_bio: string | null;
  avatar_url: string | null;
  affiliation: string | null;
};


const MagazinePost = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [parent, setParent] = useState<ReplyMeta | null>(null);
  const [replies, setReplies] = useState<ReplyMeta[]>([]);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [authorBio, setAuthorBio] = useState<AuthorBio | null>(null);
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
      const p = (data as Post | null) ?? null;
      setPost(p);

      let parentRow: ReplyMeta | null = null;
      let replyRows: ReplyMeta[] = [];

      if (p?.reply_to_id) {
        const { data: parentData } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, author_name, user_id, published_at")
          .eq("id", p.reply_to_id)
          .eq("status", "published")
          .maybeSingle();
        parentRow = (parentData as ReplyMeta | null) ?? null;
        if (!cancelled) setParent(parentRow);
      } else {
        setParent(null);
      }

      if (p) {
        const { data: replyData } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, author_name, user_id, published_at")
          .eq("reply_to_id", p.id)
          .eq("status", "published")
          .order("published_at", { ascending: true });
        replyRows = (replyData as ReplyMeta[]) ?? [];
        if (!cancelled) setReplies(replyRows);
      }

      const allIds = [p?.user_id, parentRow?.user_id, ...replyRows.map((r) => r.user_id)];
      const names = await fetchAuthorNames(allIds);
      if (!cancelled) setNameMap(names);

      if (p?.user_id) {
        const { data: bioData } = await supabase
          .from("profiles")
          .select("user_id, display_name, author_bio, avatar_url, affiliation")
          .eq("user_id", p.user_id)
          .maybeSingle();
        if (!cancelled) setAuthorBio((bioData as unknown as AuthorBio | null) ?? null);

      } else {
        setAuthorBio(null);
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
    <article className="bg-background py-16 md:py-20">
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
          author: { "@type": "Person", name: resolveAuthorName(nameMap, post.user_id, post.author_name) },
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
              di <span className="underline decoration-dotted underline-offset-2">{resolveAuthorName(nameMap, parent.user_id, parent.author_name)}</span>
            </p>

          </Link>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {parseCategories(post.category).map((c) => (
            <span key={c} className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {c}
            </span>
          ))}
          {post.reply_to_id && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
              <Reply size={10} /> Risposta
            </span>
          )}
        </div>

        <h1 className="font-display uppercase tracking-tight leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 break-words hyphens-auto" style={{ fontVariationSettings: "'wght' 700" }}>{post.title}</h1>

        <div className="flex items-center gap-5 text-sm text-muted-foreground font-body mb-10 pb-10 border-b border-border flex-wrap">
          <Link
            to={`/autori/${post.user_id}`}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <User size={14} /> <span className="underline decoration-dotted underline-offset-2">{resolveAuthorName(nameMap, post.user_id, post.author_name)}</span>
          </Link>

          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(post.published_at).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
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

        {/* Author bio card */}
        {authorBio && authorBio.author_bio && (
          <aside className="mt-14 pt-8 border-t border-border">
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">
              L'autore
            </div>
            <Link
              to={`/autori/${authorBio.user_id}`}
              className="flex items-start gap-4 group"
            >
              {authorBio.avatar_url ? (
                <img
                  src={authorBio.avatar_url}
                  alt={authorBio.display_name}
                  loading="lazy"
                  className="w-16 h-16 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border shrink-0">
                  <User size={22} className="text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {authorBio.display_name}
                </p>
                {authorBio.affiliation && (
                  <p className="font-body text-xs text-muted-foreground italic mb-2">
                    {authorBio.affiliation}
                  </p>
                )}
                {authorBio.bio && (
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-4 text-justify">
                    {authorBio.bio}
                  </p>
                )}
                <span className="inline-block mt-2 text-xs font-body text-primary group-hover:underline">
                  Leggi la bio completa →
                </span>
              </div>
            </Link>
          </aside>
        )}

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
                      <User size={12} /> {resolveAuthorName(nameMap, r.user_id, r.author_name)}
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
