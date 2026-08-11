import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAuthorNames } from "@/lib/authorNames";
import SmartImage from "@/components/SmartImage";

export type FeaturedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  user_id: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
};

/**
 * Sezione "In evidenza" in homepage: mostra fino a 3 articoli del magazine
 * pubblicati più di recente. Se non ci sono post, non renderizza nulla.
 */
const FeaturedSection = () => {
  const { t } = useTranslation();

  const { data: posts } = useQuery({
    queryKey: ["home-featured-posts"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, author_name, user_id, category, cover_image_url, published_at")
        .eq("status", "published")
        .is("reply_to_id", null)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error || !data) return [] as FeaturedPost[];
      return data as FeaturedPost[];
    },
  });

  const { data: nameMap } = useQuery({
    queryKey: ["home-featured-names", posts?.map((p) => p.user_id).join(",")],
    enabled: !!posts && posts.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (!posts) return {} as Record<string, string>;
      return fetchAuthorNames(posts.map((p) => p.user_id));
    },
  });

  if (!posts || posts.length === 0) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section>
      <div className="flex items-end justify-between mb-8 border-b-2 border-foreground pb-4">
        <h2 className="editorial-subheading">
          {t("home.featured.title") || "In evidenza"}{" "}
          <span className="text-primary">{t("home.featured.accent") || "dal magazine"}</span>
        </h2>
        <Link
          to="/bollettino"
          className="micro-label hidden sm:inline-flex items-center gap-1 hover:text-primary transition-colors"
        >
          {t("home.featured.all") || "Tutti gli articoli"} <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((p, idx) => (
          <Link
            key={p.id}
            to={`/bollettino/${p.slug}`}
            className={`brutalist-card group flex flex-col overflow-hidden ${
              idx === 0 ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-6" : ""
            }`}
          >
            <SmartImage
              src={p.cover_image_url || undefined}
              alt={p.title}
              aspect={idx === 0 ? "16/9" : "4/3"}
              wrapperClassName="w-full bg-muted"
              className="w-full h-full object-cover"
            />
            <div className="p-6 flex flex-col gap-3">
              <span className="micro-label text-primary">{p.category}</span>
              <h3 className="font-display text-xl md:text-2xl leading-tight tracking-tight group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              {idx === 0 && p.excerpt && (
                <p className="text-sm text-foreground/70 font-body line-clamp-3">{p.excerpt}</p>
              )}
              <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-muted-foreground font-body">
                <Calendar size={14} aria-hidden="true" />
                <span>{formatDate(p.published_at)}</span>
                <span aria-hidden="true">·</span>
                <span>{nameMap?.[p.user_id] || p.author_name || "Redazione"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/bollettino"
        className="mt-6 inline-flex sm:hidden items-center gap-1 micro-label hover:text-primary transition-colors"
      >
        {t("home.featured.all") || "Tutti gli articoli"} <ArrowRight size={14} />
      </Link>
    </section>
  );
};

export default FeaturedSection;
