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
  useTranslation();
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

  return (
    <div className="py-20">
      <SEO
        title="La nostra rete — Il Bel Paese"
        description="Coordinatori, autori e contributor che animano Il Bel Paese."
        canonicalPath="/la-rete"
      />
      <div className="editorial-container max-w-6xl">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h1 className="editorial-heading mb-4">
            La nostra <span className="italic text-primary">rete</span>
          </h1>
          <div className="space-y-4 editorial-body text-muted-foreground">
            <p>
              <em>Il Bel Paese</em> vive perché la rete lo nutre, e viceversa.
            </p>
            <p>
              Aiutaci a costruire un racconto che rispetti le condizioni di chi alimenta da dentro questo sistema.
            </p>
          </div>
        </div>

        {/* Sezione coordinatori in evidenza */}
        <section className="mb-20">
          <div className="mb-6">
            <h2 className="editorial-subheading">
              I <span className="italic text-primary">coordinatori</span>
            </h2>
            <p className="font-body text-muted-foreground mt-2 max-w-2xl">
              Chi c'è dietro il progetto.
            </p>
          </div>
          {loading ? (
            <p className="font-body text-muted-foreground text-sm">Caricamento…</p>
          ) : coordinatori.length === 0 ? (
            <p className="font-body text-muted-foreground text-sm italic">Nessun coordinatore pubblico al momento.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coordinatori.map((c) => (
                <Link
                  key={c.user_id}
                  to={`/autori/${c.user_id}`}
                  className="group p-6 rounded-lg bg-card border-2 border-primary/20 hover:border-primary/60 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover bg-muted" loading="lazy" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl shrink-0">
                        {c.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-base group-hover:text-primary transition-colors">
                        {c.display_name}
                      </h3>
                      {c.role_collective && (
                        <p className="text-xs text-primary font-body mt-0.5">{c.role_collective}</p>
                      )}
                      {c.role_real_life && (
                        <p className="text-xs text-muted-foreground font-body mt-0.5">{c.role_real_life}</p>
                      )}
                    </div>
                  </div>
                  {c.bio && (
                    <p className="mt-3 text-sm text-muted-foreground font-body line-clamp-3">{c.bio}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-muted-foreground">
                    {c.social_linkedin && <Linkedin size={14} aria-hidden="true" />}
                    {c.public_email && <Mail size={14} aria-hidden="true" />}
                    {c.website && <Globe size={14} aria-hidden="true" />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Tutti gli autori con filtri */}
        <section>
          <div className="mb-6">
            <h2 className="editorial-subheading">
              Tutti i <span className="italic text-primary">membri</span>
            </h2>
            <p className="font-body text-muted-foreground mt-2 max-w-2xl">
              Chi crede e anima la rete. Puoi farne parte anche tu, se vuoi.
            </p>
          </div>

          {/* Filtri */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca per nome…"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background font-body text-sm"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
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
                className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
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
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} /> Azzera
              </button>
            )}
            <span className="ml-auto text-xs font-body text-muted-foreground">
              {visibleAutori.length} {visibleAutori.length === 1 ? "membro" : "membri"}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-muted-foreground font-body">Caricamento…</div>
          ) : visibleAutori.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-body">
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
                    className="group p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover bg-muted" loading="lazy" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg shrink-0">
                          {p.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-semibold text-base group-hover:text-primary transition-colors truncate">
                          {p.display_name}
                        </h3>
                        {p.figure_category && (
                          <p className="text-xs text-primary font-body mt-0.5">{p.figure_category}</p>
                        )}
                        {(reality || p.affiliation || p.role_real_life) && (
                          <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
                            {reality ? `${reality.name} · ${reality.city}` : (p.affiliation || p.role_real_life)}
                          </p>
                        )}
                      </div>
                    </div>
                    {p.bio && (
                      <p className="mt-4 text-sm text-muted-foreground font-body line-clamp-3">{p.bio}</p>
                    )}
                    <div className="mt-4 flex items-center gap-3 text-muted-foreground">
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
