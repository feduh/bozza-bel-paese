import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Calendar, User, UserCheck } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import SmartImage from "@/components/SmartImage";
import { parseCategories } from "@/lib/articleCategories";
import { fetchAuthorNames, resolveAuthorName } from "@/lib/authorNames";
import { PostCardSkeletonGrid } from "@/components/skeletons";
import { useAuth } from "@/hooks/useAuth";

type EditorialPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string;
  user_id: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
  editorial_edition_id: string | null;
};

type Edition = {
  id: string;
  year: number;
  title: string;
  theme_description: string | null;
  curator_user_id: string | null;
  status: "draft" | "open_submissions" | "closed_submissions" | "published" | "archived";
  cover_image_url: string | null;
  submissions_close_at: string | null;
};

const Editoriale = () => {
  const { user } = useAuth();
  const [edition, setEdition] = useState<Edition | null>(null);
  const [curatorName, setCuratorName] = useState<string | null>(null);
  const [curatorUserId, setCuratorUserId] = useState<string | null>(null);
  const [curatorAvatar, setCuratorAvatar] = useState<string | null>(null);
  const [curatorBio, setCuratorBio] = useState<string | null>(null);
  const [posts, setPosts] = useState<EditorialPost[]>([]);
  const [nameMap, setNameMap] = useState<Record<string, string>>({});
  const [allEditions, setAllEditions] = useState<Edition[]>([]);
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carica l'elenco delle edizioni una sola volta
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: eds } = await supabase
        .from("editorial_editions")
        .select("*")
        .neq("status", "archived")
        .order("year", { ascending: false });
      const list = (eds as Edition[]) ?? [];
      if (cancelled) return;
      setAllEditions(list);
      const current =
        list.find((e) => e.status === "open_submissions") ??
        list.find((e) => e.status === "published") ??
        list.find((e) => e.status === "closed_submissions") ??
        list[0] ??
        null;
      setSelectedEditionId(current?.id ?? null);
      if (!current) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Carica i dati dell'edizione selezionata
  useEffect(() => {
    let cancelled = false;
    const current = allEditions.find((e) => e.id === selectedEditionId) ?? null;
    setEdition(current);
    if (!current) return;
    setLoading(true);
    setCuratorName(null);
    setCuratorUserId(null);
    setCuratorAvatar(null);
    setCuratorBio(null);
    (async () => {
      if (current.curator_user_id) {
        const { data: cp } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, author_bio")
          .eq("user_id", current.curator_user_id)
          .maybeSingle();
        if (!cancelled) {
          setCuratorName(cp?.display_name ?? null);
          setCuratorUserId(cp?.user_id ?? null);
          setCuratorAvatar(cp?.avatar_url ?? null);
          setCuratorBio(cp?.author_bio ?? null);
        }
      }

      const { data } = await supabase
        .from("blog_posts")
        .select(
          "id, slug, title, excerpt, author_name, user_id, category, cover_image_url, published_at, editorial_edition_id",
        )
        .eq("status", "published")
        .eq("editorial_edition_id", current.id)
        .order("published_at", { ascending: false });
      let editorialPosts = (data as EditorialPost[]) ?? [];

      if (editorialPosts.length === 0) {
        const { data: legacy } = await supabase
          .from("blog_posts")
          .select(
            "id, slug, title, excerpt, author_name, user_id, category, cover_image_url, published_at, editorial_edition_id",
          )
          .eq("status", "published")
          .is("editorial_edition_id", null)
          .order("published_at", { ascending: false });
        editorialPosts = ((legacy as EditorialPost[]) ?? []).filter((p) =>
          parseCategories(p.category).includes("Editoriali"),
        );
      }
      if (cancelled) return;
      setPosts(editorialPosts);
      const names = await fetchAuthorNames(editorialPosts.map((p) => p.user_id));
      if (!cancelled) {
        setNameMap(names);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEditionId, allEditions]);

  const otherEditions = allEditions.filter((e) => e.id !== edition?.id);
  const rest = posts;
  const isOpen = edition?.status === "open_submissions";

  return (
    <div className="bg-foreground text-background py-12 md:py-20">
      <SEO
        title="Editoriale — Il Bel Paese"
        description="La selezione annuale di un tema curato dall'editore dell'anno. Un percorso critico dentro la scena indipendente italiana."
        canonicalPath="/editoriale"
      />

      <div className="editorial-container space-y-14 md:space-y-20">
        {/* ── Testata: numero d'annata + selettore edizione ── */}
        <header>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-background/25 pb-4">
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-secondary">
              <Bookmark size={14} aria-hidden="true" />
              {edition ? `Edizione ${edition.year}` : "Editoriale"}
            </span>
            {allEditions.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/50">
                  Annata
                </span>
                {allEditions.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedEditionId(e.id)}
                    aria-pressed={e.id === selectedEditionId}
                    className={`px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] border-2 transition-colors ${
                      e.id === selectedEditionId
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "border-background/40 text-background/70 hover:border-secondary hover:text-secondary"
                    }`}
                  >
                    {e.year}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-end pt-8 md:pt-10">
            <div className="lg:col-span-7">
              <h1
                className="text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.85] text-secondary"
                style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.035em" }}
              >
                Editoriale
              </h1>
            </div>
            <div className="lg:col-span-5">
              <p className="editorial-body text-background/70">
                Una selezione annuale attorno a un tema, curata dall'editore dell'anno. Uno spazio critico separato
                dal Magazine libero: qui si costruisce una linea, un pensiero, un percorso di lettura.
              </p>
              {isOpen && (
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <Link
                    to={user ? "/area-personale?tab=editoriale" : "/login?redirect=/area-personale?tab=editoriale"}
                    className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] border-2 border-secondary hover:bg-background hover:text-foreground hover:border-background transition-colors"
                  >
                    Candida un pitch <ArrowRight size={14} />
                  </Link>
                  {edition?.submissions_close_at && (
                    <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-background/60">
                      <Calendar size={12} />
                      Fino al{" "}
                      {new Date(edition.submissions_close_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Le due card portanti: Tema dell'anno · Curatore dell'anno ── */}
        {edition && (
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Tema dell'anno — card dominante */}
            <article className="lg:col-span-7 relative border-2 border-secondary bg-secondary/[0.06] p-8 md:p-12">
              <span
                aria-hidden="true"
                className="absolute top-6 right-6 md:top-8 md:right-10 font-mono text-5xl md:text-7xl leading-none text-secondary/20 select-none"
                style={{ fontVariationSettings: "'wght' 700" }}
              >
                {edition.year}
              </span>
              <div className="micro-label text-secondary mb-5">Tema dell'anno</div>
              <h2
                className="text-3xl md:text-5xl uppercase leading-[0.95] tracking-tight mb-6 max-w-[16ch]"
                style={{ fontVariationSettings: "'wght' 700" }}
              >
                {edition.title}
              </h2>
              <div className="w-16 h-[3px] bg-secondary mb-6" />
              <p className="editorial-body text-background/80 leading-relaxed whitespace-pre-line max-w-[52ch]">
                {edition.theme_description ??
                  "Stiamo definendo il tema dell'edizione insieme al curatore. Torna presto per scoprirlo."}
              </p>
            </article>

            {/* Curatore dell'anno */}
            <aside className="lg:col-span-5 border-2 border-background/40 p-8 md:p-10 flex flex-col">
              <div className="micro-label text-secondary mb-5 flex items-center gap-2">
                <UserCheck size={13} aria-hidden="true" /> Curatore dell'anno
              </div>
              {curatorAvatar ? (
                <SmartImage
                  src={curatorAvatar}
                  alt={curatorName ?? "Curatore"}
                  className="w-24 h-24 rounded-full object-cover border-2 border-secondary mb-5"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-background/10 border-2 border-secondary flex items-center justify-center font-display text-2xl text-background/80 mb-5">
                  {curatorName
                    ? curatorName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "?"}
                </div>
              )}
              <div className="font-display text-3xl leading-tight text-background">
                {curatorName ?? "Curatore in definizione"}
              </div>
              <p className="text-sm md:text-base text-background/75 leading-relaxed mt-4 line-clamp-6">
                {curatorBio ?? "La biografia del curatore verrà pubblicata a breve."}
              </p>
              {curatorUserId && (
                <Link
                  to={`/autori/${curatorUserId}`}
                  className="mt-auto pt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-secondary hover:gap-3 transition-all self-start"
                >
                  Vai al profilo <ArrowRight size={14} />
                </Link>
              )}
            </aside>
          </div>
        )}

        {/* ── Indice dei contributi ── */}
        {loading ? (
          <PostCardSkeletonGrid count={3} />
        ) : posts.length === 0 ? (
          <section className="border-2 border-background/40 p-8 md:p-14">
            <div className="micro-label text-secondary mb-4">
              {edition ? "In preparazione" : "Nessuna edizione attiva"}
            </div>
            <h2
              className="text-3xl md:text-5xl uppercase leading-tight tracking-tight mb-6"
              style={{ fontVariationSettings: "'wght' 700" }}
            >
              Ancora nulla da pubblicare qui.
            </h2>
            <p className="text-base md:text-lg text-background/80 max-w-2xl leading-relaxed mb-8">
              {isOpen
                ? "Le candidature sono aperte: se sei un membro, puoi proporre un pitch dalla tua Area Personale."
                : "Stiamo definendo il prossimo tema editoriale insieme al curatore dell'anno. Torna presto."}
            </p>
            <Link
              to="/magazine"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] border-2 border-secondary hover:bg-background hover:text-foreground hover:border-background transition-colors"
            >
              Vai al Magazine libero <ArrowRight size={14} />
            </Link>
          </section>
        ) : (
          <section>
            <div className="flex items-baseline justify-between gap-4 border-b border-background/25 pb-3 mb-2">
              <div className="micro-label text-secondary">Indice dei contributi</div>
              <span className="font-mono text-xs text-background/50">
                {rest.length.toString().padStart(2, "0")} {rest.length === 1 ? "voce" : "voci"}
              </span>
            </div>
            <ul>
              {rest.map((post, i) => (
                <li key={post.id}>
                  <Link
                    to={`/magazine/${post.slug}`}
                    className="group grid md:grid-cols-12 gap-4 md:gap-8 items-start py-7 md:py-9 border-b border-background/20 hover:border-secondary transition-colors"
                  >
                    <div className="md:col-span-1">
                      <span
                        className="font-mono text-sm text-secondary/70 group-hover:text-secondary transition-colors"
                        aria-hidden="true"
                      >
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className={post.cover_image_url ? "md:col-span-7" : "md:col-span-11"}>
                      <h3
                        className="text-2xl md:text-[2rem] uppercase leading-[1.05] tracking-tight group-hover:text-secondary transition-colors"
                        style={{ fontVariationSettings: "'wght' 700" }}
                      >
                        {post.title}
                      </h3>
                      <p className="text-sm md:text-base text-background/75 leading-relaxed mt-3 line-clamp-2 max-w-[62ch]">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-mono uppercase tracking-widest text-background/55">
                        <span className="flex items-center gap-2">
                          <User size={12} />
                          {resolveAuthorName(nameMap, post.user_id, post.author_name)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar size={12} />
                          {new Date(post.published_at).toLocaleDateString("it-IT")}
                        </span>
                        <span className="inline-flex items-center gap-1 text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                          Leggi <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                    {post.cover_image_url && (
                      <div className="md:col-span-4 order-first md:order-none">
                        <div className="aspect-[4/3] overflow-hidden bg-background/5 border border-background/20">
                          <SmartImage
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                          />
                        </div>
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Archivio annate ── */}
        {otherEditions.length > 0 && (
          <section>
            <div className="micro-label text-secondary mb-5">Edizioni precedenti</div>
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherEditions.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEditionId(e.id)}
                    className="w-full text-left border border-background/30 p-5 hover:border-secondary transition-colors group"
                  >
                    <div className="font-mono text-xs text-secondary">{e.year}</div>
                    <div className="font-display text-lg text-background mt-1 group-hover:text-secondary transition-colors">
                      {e.title}
                    </div>
                    {e.theme_description && (
                      <p className="text-sm text-background/65 mt-2 line-clamp-2">{e.theme_description}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );

};

export default Editoriale;
