import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Calendar, User, Plus, ArrowRight, Reply, Search, X, ArrowDownUp } from "lucide-react";
import SEO from "@/components/SEO";
import { PostCardSkeletonGrid } from "@/components/skeletons";
import SmartImage from "@/components/SmartImage";
import { ARTICLE_CATEGORIES, parseCategories } from "@/lib/articleCategories";
import { fetchAuthorNames, resolveAuthorName } from "@/lib/authorNames";

type MagazinePost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  user_id: string;
  category: string;
  cover_image_url: string | null;
  reply_to_id: string | null;
  published_at: string;
  status: string;
};

type SortKey = "newest" | "oldest" | "az" | "za";

const Magazine = () => {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("newest");
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, author_name, user_id, category, cover_image_url, reply_to_id, published_at, status")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (cancelled) return;
      const list = (data as MagazinePost[]) ?? [];
      setPosts(list);
      const names = await fetchAuthorNames(list.map((p) => p.user_id));
      if (!cancelled) setNameMap(names);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableCats = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => parseCategories(p.category).forEach((c) => set.add(c)));
    return ARTICLE_CATEGORIES.filter((c) => set.has(c));
  }, [posts]);

  const availableAuthors = useMemo(() => {
    const set = new Map<string, string>();
    posts.forEach((p) => {
      const name = resolveAuthorName(nameMap, p.user_id, p.author_name);
      if (name) set.set(p.user_id, name);
    });
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [posts, nameMap]);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    posts.forEach((p) => set.add(new Date(p.published_at).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = posts.filter((p) => {
      if (activeCats.length > 0) {
        const cats = parseCategories(p.category);
        if (!activeCats.some((c) => cats.includes(c))) return false;
      }
      if (author && p.user_id !== author) return false;
      if (year && String(new Date(p.published_at).getFullYear()) !== year) return false;
      if (q) {
        const authorName = resolveAuthorName(nameMap, p.user_id, p.author_name).toLowerCase();
        const hay = `${p.title} ${p.excerpt} ${authorName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "newest") return +new Date(b.published_at) - +new Date(a.published_at);
      if (sort === "oldest") return +new Date(a.published_at) - +new Date(b.published_at);
      if (sort === "az") return a.title.localeCompare(b.title);
      return b.title.localeCompare(a.title);
    });
    return sorted;
  }, [posts, activeCats, query, nameMap, author, year, sort]);

  const toggleCat = (c: string) =>
    setActiveCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const hasFilters = activeCats.length > 0 || query.length > 0 || !!author || !!year || sort !== "newest";

  return (
    <div className="py-20">
      <SEO
        title={t("magazine.title") + " " + t("magazine.titleAccent")}
        description={t("magazine.lead")}
        canonicalPath="/magazine"
      />
      <div className="editorial-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
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
              <Plus size={16} /> {t("magazine.newArticle")}
            </Link>
          )}
        </div>

        {/* Filtri */}
        {!loading && posts.length > 0 && (
          <div className="mb-10 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("magazine.searchPlaceholder")}
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background font-body text-sm"
                />
              </div>
              {availableAuthors.length > 0 && (
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
                  aria-label={t("magazine.filterAuthor")}
                >
                  <option value="">{t("magazine.allAuthors")}</option>
                  {availableAuthors.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              )}
              {availableYears.length > 0 && (
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
                  aria-label={t("magazine.filterYear")}
                >
                  <option value="">{t("magazine.allYears")}</option>
                  {availableYears.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              )}
              <div className="relative">
                <ArrowDownUp size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="pl-9 pr-3 py-2 rounded-md border border-input bg-background font-body text-sm"
                  aria-label={t("magazine.sortBy")}
                >
                  <option value="newest">{t("magazine.sortNewest")}</option>
                  <option value="oldest">{t("magazine.sortOldest")}</option>
                  <option value="az">{t("magazine.sortAZ")}</option>
                  <option value="za">{t("magazine.sortZA")}</option>
                </select>
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => { setActiveCats([]); setQuery(""); setAuthor(""); setYear(""); setSort("newest"); }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} /> {t("magazine.clearFilters")}
                </button>
              )}
              <span className="ml-auto text-xs font-body text-muted-foreground">
                {filteredPosts.length} {filteredPosts.length === 1 ? t("magazine.articleOne") : t("magazine.articleOther")}
              </span>
            </div>
            {availableCats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableCats.map((c) => {
                  const active = activeCats.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCat(c)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <PostCardSkeletonGrid count={6} />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            {t("magazine.emptyAll")}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            {t("magazine.emptyFiltered")}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <ArticleCard key={post.id} post={post} authorName={resolveAuthorName(nameMap, post.user_id, post.author_name)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ArticleCard = ({ post, authorName }: { post: MagazinePost; authorName: string }) => (
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
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {parseCategories(post.category).map((c) => (
          <span key={c} className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {c}
          </span>
        ))}
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
          <User size={12} /> {authorName}
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
