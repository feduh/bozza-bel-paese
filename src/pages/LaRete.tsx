import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Users, MapPin, Globe, Instagram, Linkedin, Mail, Search, X } from "lucide-react";
import { FIGURE_CATEGORIES } from "@/lib/categories";

type Profile = {
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  affiliation: string | null;
  website: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  public_email: string | null;
  reality_id: string | null;
  member_type: string | null;
  role_collective: string | null;
  role_real_life: string | null;
  figure_category: string | null;
  display_priority: number | null;
};

type RealityRef = { id: string; name: string; city: string; region: string };

const LaRete = () => {
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [realitiesById, setRealitiesById] = useState<Record<string, RealityRef>>({});
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>("");
  const [filterRegion, setFilterRegion] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: profs }, { data: rels }] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, display_name, bio, avatar_url, affiliation, website, social_instagram, social_linkedin, public_email, reality_id, member_type, role_collective, role_real_life, figure_category, display_priority")
          .eq("consent_public", true)
          .in("member_type", ["coordinatore", "autore"])
          .order("display_name", { ascending: true }),
        supabase
          .from("realities")
          .select("id, name, city, region")
          .eq("confirmed_status", "confermato"),
      ]);
      if (cancelled) return;
      setProfiles((profs as Profile[]) ?? []);
      const map: Record<string, RealityRef> = {};
      ((rels as RealityRef[]) ?? []).forEach((r) => { map[r.id] = r; });
      setRealitiesById(map);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const coordinatori = useMemo(
    () =>
      profiles
        .filter((p) => p.member_type === "coordinatore")
        .sort((a, b) => {
          const ap = a.display_priority ?? Number.POSITIVE_INFINITY;
          const bp = b.display_priority ?? Number.POSITIVE_INFINITY;
          if (ap !== bp) return ap - bp;
          return a.display_name.localeCompare(b.display_name, "it");
        }),
    [profiles],
  );
  const autori = useMemo(
    () => profiles.filter((p) => p.member_type === "autore"),
    [profiles],
  );

  const regions = useMemo(() => {
    const set = new Set<string>();
    autori.forEach((p) => {
      const r = p.reality_id ? realitiesById[p.reality_id]?.region : null;
      if (r) set.add(r);
    });
    return Array.from(set).sort();
  }, [autori, realitiesById]);

  const visibleAutori = useMemo(() => {
    const q = query.trim().toLowerCase();
    return autori.filter((p) => {
      if (filterCat && p.figure_category !== filterCat) return false;
      if (filterRegion) {
        const r = p.reality_id ? realitiesById[p.reality_id]?.region : null;
        if (r !== filterRegion) return false;
      }
      if (q) {
        const hay = `${p.display_name} ${p.bio ?? ""} ${p.affiliation ?? ""} ${p.role_real_life ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [autori, filterCat, filterRegion, query, realitiesById]);

  const hasFilters = !!(filterCat || filterRegion || query);

  const selectClass =
    "px-3 py-2 brutalist-border bg-background text-sm focus:outline-none focus:border-primary";

  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title="La nostra rete — Il Bel Paese"
        description="Coordinatori, autori e contributor che animano Il Bel Paese."
        canonicalPath="/la-rete"
      />
      <div className="editorial-container max-w-6xl space-y-16 md:space-y-20">
        {/* Header */}
        <header className="border-b-2 border-foreground pb-10">
          <h1 className="editorial-heading mb-6">
            La nostra <span className="text-primary">rete</span>
          </h1>
          <div className="space-y-3 editorial-body text-foreground/80 max-w-3xl">
            <p><em>Il Bel Paese</em> vive perché la rete lo nutre, e viceversa.</p>
            <p>Aiutaci a costruire un racconto che rispetti le condizioni di chi alimenta da dentro questo sistema.</p>
          </div>
        </header>

        {/* Coordinatori */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-foreground pb-4">
            <div>
              <h2 className="editorial-subheading">I <span className="text-primary">coordinatori</span></h2>
              <p className="text-sm text-foreground/70 mt-2 max-w-2xl">Chi c'è dietro il progetto.</p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-foreground/70">Caricamento…</p>
          ) : coordinatori.length === 0 ? (
            <p className="text-sm text-foreground/70 italic">Nessun coordinatore pubblico al momento.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coordinatori.map((c, i) => (
                <Link
                  key={c.user_id}
                  to={`/autori/${c.user_id}`}
                  className="brutalist-card p-6 flex flex-col gap-4 group bg-primary text-primary-foreground"
                >
                  <div className="micro-label text-secondary">0{i + 1} // Coordinatore</div>
                  <div className="flex items-start gap-4">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-16 h-16 object-cover brutalist-border bg-muted" loading="lazy" />
                    ) : (
                      <div className="w-16 h-16 brutalist-border bg-secondary flex items-center justify-center text-foreground text-xl" style={{ fontVariationSettings: "'wght' 700" }}>
                        {c.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg uppercase leading-tight tracking-tight" style={{ fontVariationSettings: "'wght' 700" }}>
                        {c.display_name}
                      </h3>
                      {c.role_collective && (
                        <p className="text-xs text-secondary mt-1">{c.role_collective}</p>
                      )}
                      {c.role_real_life && (
                        <p className="text-xs text-primary-foreground/70 mt-0.5">{c.role_real_life}</p>
                      )}
                    </div>
                  </div>
                  {c.bio && (
                    <p className="text-sm text-primary-foreground/85 line-clamp-3">{c.bio}</p>
                  )}
                  <div className="h-[2px] w-full bg-primary-foreground/30 mt-auto" />
                  <div className="flex items-center gap-3 text-primary-foreground/70">
                    {c.social_linkedin && <Linkedin size={14} aria-hidden="true" />}
                    {c.public_email && <Mail size={14} aria-hidden="true" />}
                    {c.website && <Globe size={14} aria-hidden="true" />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Tutti i membri */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-foreground pb-4">
            <div>
              <h2 className="editorial-subheading">Tutti i <span className="text-primary">membri</span></h2>
              <p className="text-sm text-foreground/70 mt-2 max-w-2xl">Chi crede e anima la rete. Puoi farne parte anche tu, se vuoi.</p>
            </div>
          </div>

          {/* Filtri */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca per nome…"
                className="w-full pl-9 pr-3 py-2 brutalist-border bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className={selectClass}
              aria-label="Filtra per categoria"
            >
              <option value="">Tutte le categorie</option>
              {FIGURE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {regions.length > 0 && (
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className={selectClass}
                aria-label="Filtra per regione"
              >
                <option value="">Tutte le regioni</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setFilterCat(""); setFilterRegion(""); setQuery(""); }}
                className="inline-flex items-center gap-1 px-3 py-2 micro-label text-foreground/70 hover:text-foreground transition-colors"
              >
                <X size={14} /> Azzera
              </button>
            )}
            <span className="ml-auto micro-label text-foreground/70">
              {visibleAutori.length} {visibleAutori.length === 1 ? "membro" : "membri"}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-foreground/70">Caricamento…</div>
          ) : visibleAutori.length === 0 ? (
            <div className="text-center py-16 text-foreground/70">
              <Users size={32} className="mx-auto mb-3 opacity-50" />
              Nessun membro trovato con questi filtri.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleAutori.map((p) => {
                const reality = p.reality_id ? realitiesById[p.reality_id] : null;
                return (
                  <Link
                    key={p.user_id}
                    to={`/autori/${p.user_id}`}
                    className="brutalist-card p-6 flex flex-col gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-14 h-14 object-cover brutalist-border bg-muted" loading="lazy" />
                      ) : (
                        <div className="w-14 h-14 brutalist-border bg-secondary flex items-center justify-center text-foreground text-lg" style={{ fontVariationSettings: "'wght' 700" }}>
                          {p.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base uppercase leading-tight tracking-tight group-hover:text-primary transition-colors truncate" style={{ fontVariationSettings: "'wght' 700" }}>
                          {p.display_name}
                        </h3>
                        {p.figure_category && (
                          <p className="text-xs text-primary mt-1">{p.figure_category}</p>
                        )}
                        {(reality || p.affiliation || p.role_real_life) && (
                          <p className="text-xs text-foreground/70 mt-0.5 truncate">
                            {reality ? `${reality.name} · ${reality.city}` : (p.affiliation || p.role_real_life)}
                          </p>
                        )}
                      </div>
                    </div>
                    {p.bio && (
                      <p className="text-sm text-foreground/80 line-clamp-3">{p.bio}</p>
                    )}
                    <div className="h-[2px] w-full bg-foreground/20 mt-auto" />
                    <div className="flex items-center gap-3 text-foreground/60">
                      {reality && <MapPin size={14} aria-hidden="true" />}
                      {p.website && <Globe size={14} aria-hidden="true" />}
                      {p.social_instagram && <Instagram size={14} aria-hidden="true" />}
                      {p.social_linkedin && <Linkedin size={14} aria-hidden="true" />}
                      {p.public_email && <Mail size={14} aria-hidden="true" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LaRete;
