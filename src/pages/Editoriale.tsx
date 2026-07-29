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
  const [otherEditions, setOtherEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Current edition: prefer open_submissions, else most recent non-archived
      const { data: eds } = await supabase
        .from("editorial_editions")
        .select("*")
        .neq("status", "archived")
        .order("year", { ascending: false });
      const list = (eds as Edition[]) ?? [];
      const current =
        list.find((e) => e.status === "open_submissions") ??
        list.find((e) => e.status === "published") ??
        list.find((e) => e.status === "closed_submissions") ??
        list[0] ??
        null;
      if (cancelled) return;
      setEdition(current);
      setOtherEditions(list.filter((e) => e.id !== current?.id));

      if (current?.curator_user_id) {
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

      // Posts of current edition, else legacy fallback: category=Editoriali
      let editorialPosts: EditorialPost[] = [];
      if (current) {
        const { data } = await supabase
          .from("blog_posts")
          .select(
            "id, slug, title, excerpt, author_name, user_id, category, cover_image_url, published_at, editorial_edition_id",
          )
          .eq("status", "published")
          .eq("editorial_edition_id", current.id)
          .order("published_at", { ascending: false });
        editorialPosts = (data as EditorialPost[]) ?? [];
      }
      if (editorialPosts.length === 0) {
        const { data } = await supabase
          .from("blog_posts")
          .select(
            "id, slug, title, excerpt, author_name, user_id, category, cover_image_url, published_at, editorial_edition_id",
          )
          .eq("status", "published")
          .is("editorial_edition_id", null)
          .order("published_at", { ascending: false });
        editorialPosts = ((data as EditorialPost[]) ?? []).filter((p) =>
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
  }, []);

  const [lead, ...rest] = posts;
  const isOpen = edition?.status === "open_submissions";

  return (
    <div className="bg-foreground text-background py-16 md:py-24">
      <SEO
        title="Editoriale — Il Bel Paese"
        description="La selezione annuale di un tema curato dall'editore dell'anno. Un percorso critico dentro la scena indipendente italiana."
        canonicalPath="/editoriale"
      />

      <div className="editorial-container space-y-16">
        {/* Header editoriale */}
        <header className="border-b-2 border-background/40 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <Bookmark size={16} className="text-secondary" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">
              {edition ? `Edizione ${edition.year}` : "Editoriale"}
            </span>
          </div>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight mb-8"
            style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.03em" }}
          >
            <span className="text-secondary">{edition?.title ?? "Editoriale"}</span>
          </h1>
          {edition?.theme_description ? (
            <p className="editorial-body text-background/80 max-w-3xl whitespace-pre-line">
              {edition.theme_description}
            </p>
          ) : (
            <p className="editorial-body text-background/80 max-w-3xl">
              Una selezione annuale di un tema curato dall'
              <strong className="text-background">editore dell'anno</strong>. Uno spazio critico differenziato dagli
              articoli del Magazine libero: qui si costruisce una linea, un pensiero, un percorso di lettura.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs font-mono uppercase tracking-widest text-background/70">
            {curatorName && (
              <span className="flex items-center gap-2">
                <UserCheck size={12} />
                A cura di <strong className="text-background not-italic">{curatorName}</strong>
              </span>
            )}
            {edition?.submissions_close_at && isOpen && (
              <span className="flex items-center gap-2">
                <Calendar size={12} />
                Candidature aperte fino al{" "}
                {new Date(edition.submissions_close_at).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          {isOpen && (
            <div className="mt-6">
              <Link
                to={user ? "/area-personale?tab=editoriale" : "/login?redirect=/area-personale?tab=editoriale"}
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] border-2 border-secondary hover:bg-background hover:text-foreground hover:border-background transition-colors"
              >
                Candida un pitch <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </header>

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
          <>
            {lead && (
              <Link
                to={`/magazine/${lead.slug}`}
                className="group block border-2 border-background/40 hover:border-secondary transition-colors"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  {lead.cover_image_url && (
                    <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-background/5">
                      <SmartImage
                        src={lead.cover_image_url}
                        alt={lead.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="micro-label text-secondary mb-4">Lettura in evidenza</div>
                    <h2
                      className="text-3xl md:text-5xl uppercase leading-tight tracking-tight mb-6 group-hover:text-secondary transition-colors"
                      style={{ fontVariationSettings: "'wght' 700" }}
                    >
                      {lead.title}
                    </h2>
                    <p className="text-base md:text-lg text-background/80 leading-relaxed mb-6 line-clamp-3">
                      {lead.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-widest text-background/60">
                      <span className="flex items-center gap-2">
                        <User size={12} />
                        {resolveAuthorName(nameMap, lead.user_id, lead.author_name)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={12} />
                        {new Date(lead.published_at).toLocaleDateString("it-IT")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <section className="grid md:grid-cols-2 gap-8">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    to={`/magazine/${post.slug}`}
                    className="group block border-2 border-background/40 hover:border-secondary transition-colors p-6 md:p-8"
                  >
                    {post.cover_image_url && (
                      <div className="aspect-[16/9] overflow-hidden bg-background/5 mb-6">
                        <SmartImage
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        />
                      </div>
                    )}
                    <h3
                      className="text-2xl md:text-3xl uppercase leading-tight tracking-tight mb-4 group-hover:text-secondary transition-colors"
                      style={{ fontVariationSettings: "'wght' 700" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-sm md:text-base text-background/80 leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-widest text-background/60">
                      <span className="flex items-center gap-2">
                        <User size={12} />
                        {resolveAuthorName(nameMap, post.user_id, post.author_name)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={12} />
                        {new Date(post.published_at).toLocaleDateString("it-IT")}
                      </span>
                    </div>
                  </Link>
                ))}
              </section>
            )}
          </>
        )}

        {otherEditions.length > 0 && (
          <section className="border-t-2 border-background/40 pt-12">
            <div className="micro-label text-secondary mb-6">Edizioni precedenti</div>
            <ul className="grid md:grid-cols-2 gap-4">
              {otherEditions.map((e) => (
                <li key={e.id} className="border border-background/30 p-5 hover:border-secondary transition-colors">
                  <div className="font-mono text-xs text-background/60">{e.year}</div>
                  <div className="font-display text-lg text-background mt-1">{e.title}</div>
                  {e.theme_description && (
                    <p className="text-sm text-background/70 mt-2 line-clamp-2">{e.theme_description}</p>
                  )}
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
