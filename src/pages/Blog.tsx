import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Calendar, User, Plus, ArrowRight, Reply } from "lucide-react";
import SEO from "@/components/SEO";
import { PostCardSkeletonGrid } from "@/components/skeletons";
import SmartImage from "@/components/SmartImage";

type MagazinePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  category: string;
  cover_image_url: string | null;
  reply_to_id: string | null;
  published_at: string;
  status: string;
};

const Magazine = () => {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, author_name, category, cover_image_url, reply_to_id, published_at, status")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (cancelled) return;
      setPosts((data as MagazinePost[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="py-20">
      <SEO
        title={t("magazine.title") + " " + t("magazine.titleAccent")}
        description={t("magazine.lead")}
        canonicalPath="/magazine"
      />
      <div className="editorial-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-3xl">
            <h1 className="editorial-heading mb-4">
              {t("magazine.title")}{" "}
              <span className="italic text-primary">{t("magazine.titleAccent")}</span>
            </h1>
            <p className="editorial-body text-muted-foreground">{t("magazine.lead")}</p>
          </div>
          {user && (
            <Link
              to="/area-personale"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus size={16} /> Nuovo articolo
            </Link>
          )}
        </div>

        {loading ? (
          <PostCardSkeletonGrid count={6} />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            Nessun articolo pubblicato ancora.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ArticleCard = ({ post }: { post: MagazinePost }) => (
  <Link
    to={`/magazine/${post.slug}`}
    className="group block rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all overflow-hidden"
  >
    {post.cover_image_url && (
      <SmartImage
        src={post.cover_image_url}
        alt={post.title}
        aspect="16/9"
        wrapperClassName="w-full"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    )}
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          {post.category}
        </span>
        {post.reply_to_id && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
            <Reply size={10} /> Risposta
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
        {post.title}
      </h3>
      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
        {post.excerpt}
      </p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
        <span className="flex items-center gap-1">
          <User size={12} /> {post.author_name}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(post.published_at).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <span className="inline-flex items-center gap-1 mt-4 text-primary text-sm font-medium group-hover:gap-2 transition-all">
        Leggi <ArrowRight size={14} />
      </span>
    </div>
  </Link>
);

export default Magazine;
