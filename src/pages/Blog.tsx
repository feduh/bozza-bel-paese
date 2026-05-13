import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, User, Plus, X, ArrowRight, Swords } from "lucide-react";
import SEO from "@/components/SEO";

type MagazinePost = {
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
  created_at: string;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const Magazine = () => {
  const [posts, setPosts] = useState<MagazinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    is_pcp: false,
    stance: "point" as "point" | "counterpoint",
    counterpart_id: "",
  });

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    setPosts((data as MagazinePost[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const { pcpPairs, regularPosts, pointCandidates } = useMemo(() => {
    const pcp = posts.filter((p) => p.is_point_counterpoint);
    const regular = posts.filter((p) => !p.is_point_counterpoint);

    const pairs: { point: MagazinePost; counter: MagazinePost | null }[] = [];
    const seen = new Set<string>();
    for (const p of pcp) {
      if (seen.has(p.id)) continue;
      if (p.stance === "point") {
        const counter = pcp.find((x) => x.counterpart_id === p.id) ?? null;
        pairs.push({ point: p, counter });
        seen.add(p.id);
        if (counter) seen.add(counter.id);
      }
    }

    const candidates = pcp.filter(
      (p) => p.stance === "point" && !pcp.some((x) => x.counterpart_id === p.id)
    );

    return { pcpPairs: pairs, regularPosts: regular, pointCandidates: candidates };
  }, [posts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const authorName = profile?.display_name || user.email || "Anonimo";
    const slug = `${slugify(form.title)}-${Math.random().toString(36).slice(2, 8)}`;

    const payload = {
      title: form.title,
      category: form.category,
      excerpt: form.excerpt,
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      author_name: authorName,
      user_id: user.id,
      slug,
      is_point_counterpoint: form.is_pcp,
      stance: form.is_pcp ? form.stance : null,
      counterpart_id: form.is_pcp && form.stance === "counterpoint" && form.counterpart_id
        ? form.counterpart_id
        : null,
    };

    const { error: err } = await supabase.from("blog_posts").insert(payload);
    if (err) {
      setError(err.message);
    } else {
      setShowForm(false);
      setForm({
        title: "",
        category: "",
        excerpt: "",
        content: "",
        cover_image_url: "",
        is_pcp: false,
        stance: "point",
        counterpart_id: "",
      });
      fetchPosts();
    }
    setSubmitting(false);
  };

  return (
    <div className="py-20">
      <SEO
        title="Magazine — Il Bel Paese"
        description="Articoli, interviste, inchieste e dibattiti sulla scena artistica indipendente italiana."
        canonicalPath="/magazine"
      />
      <div className="editorial-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-3xl">
            <h1 className="editorial-heading mb-4">
              Il <span className="italic text-primary">Magazine</span>
            </h1>
            <p className="editorial-body text-muted-foreground">
              Articoli, interviste, inchieste e dibattiti sulla scena artistica indipendente italiana.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              {showForm ? (
                <>
                  <X size={16} /> Chiudi
                </>
              ) : (
                <>
                  <Plus size={16} /> Nuovo articolo
                </>
              )}
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && user && (
          <form
            onSubmit={handleSubmit}
            className="mb-16 p-8 rounded-lg bg-card border border-border space-y-4"
          >
            <h2 className="font-display text-xl font-semibold mb-2">Nuovo articolo</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                required
                placeholder="Titolo"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                required
                placeholder="Categoria (es. Tendenze, Inchieste)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <input
              placeholder="URL immagine di copertina (opzionale)"
              value={form.cover_image_url}
              onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <textarea
              required
              placeholder="Estratto (breve descrizione)"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />

            <textarea
              required
              placeholder="Contenuto dell'articolo..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />

            <div className="p-4 rounded-md border border-dashed border-border bg-background/50 space-y-3">
              <label className="flex items-center gap-2 font-body text-sm">
                <input
                  type="checkbox"
                  checked={form.is_pcp}
                  onChange={(e) => setForm({ ...form, is_pcp: e.target.checked })}
                />
                <Swords size={14} className="text-primary" />
                Questo articolo fa parte di un dibattito <strong>Point / Counter Point</strong>
              </label>
              {form.is_pcp && (
                <div className="grid md:grid-cols-2 gap-3 pl-6">
                  <select
                    value={form.stance}
                    onChange={(e) =>
                      setForm({ ...form, stance: e.target.value as "point" | "counterpoint" })
                    }
                    className="px-4 py-2 rounded-md border border-input bg-background font-body text-sm"
                  >
                    <option value="point">Point (tesi iniziale)</option>
                    <option value="counterpoint">Counter Point (replica)</option>
                  </select>
                  {form.stance === "counterpoint" && (
                    <select
                      value={form.counterpart_id}
                      onChange={(e) => setForm({ ...form, counterpart_id: e.target.value })}
                      className="px-4 py-2 rounded-md border border-input bg-background font-body text-sm"
                      required
                    >
                      <option value="">Replica a... (scegli un Point)</option>
                      {pointCandidates.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive font-body">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Pubblicazione..." : "Pubblica"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            Caricamento articoli...
          </div>
        ) : (
          <>
            {/* Point / Counter Point */}
            {pcpPairs.length > 0 && (
              <section className="mb-20">
                <div className="flex items-center gap-3 mb-8">
                  <Swords className="text-primary" size={24} />
                  <h2 className="editorial-subheading">
                    Point <span className="italic text-primary">/</span> Counter Point
                  </h2>
                </div>
                <p className="font-body text-muted-foreground mb-8 max-w-2xl">
                  Voci diverse a confronto sui temi della scena indipendente. Una tesi, una replica.
                </p>
                <div className="space-y-8">
                  {pcpPairs.map(({ point, counter }) => (
                    <div
                      key={point.id}
                      className="grid md:grid-cols-2 gap-0 rounded-lg overflow-hidden border border-border"
                    >
                      <PcpCard post={point} variant="point" />
                      {counter ? (
                        <PcpCard post={counter} variant="counter" />
                      ) : (
                        <div className="p-8 bg-muted/40 flex items-center justify-center text-center font-body text-sm text-muted-foreground border-l border-border">
                          In attesa di replica
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Regular articles */}
            {regularPosts.length > 0 ? (
              <section>
                <h2 className="editorial-subheading mb-8">
                  <span className="italic text-primary">Articoli</span> recenti
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            ) : pcpPairs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground font-body">
                Nessun articolo pubblicato ancora.{" "}
                {!user && <span>Accedi per pubblicare il primo!</span>}
              </div>
            ) : null}
          </>
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
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src={post.cover_image_url}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    )}
    <div className="p-6">
      <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
        {post.category}
      </span>
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

const PcpCard = ({
  post,
  variant,
}: {
  post: MagazinePost;
  variant: "point" | "counter";
}) => {
  const tone =
    variant === "point"
      ? "bg-primary/5 border-primary/20"
      : "bg-secondary/5 border-secondary/20 md:border-l";
  const labelTone =
    variant === "point"
      ? "bg-primary/15 text-primary border-primary/30"
      : "bg-secondary/15 text-secondary border-secondary/30";
  const accent = variant === "point" ? "text-primary" : "text-secondary";

  return (
    <Link
      to={`/magazine/${post.slug}`}
      className={`block p-8 ${tone} hover:bg-card transition-colors group`}
    >
      <span
        className={`inline-block text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${labelTone} mb-4`}
      >
        {variant === "point" ? "Point" : "Counter Point"}
      </span>
      <h3
        className={`font-display text-xl font-semibold mb-3 group-hover:${accent} transition-colors`}
      >
        {post.title}
      </h3>
      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
        {post.excerpt}
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
        <span className="flex items-center gap-1">
          <User size={12} /> {post.author_name}
        </span>
        <span>·</span>
        <span>
          {new Date(post.published_at).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
};

export default Magazine;
