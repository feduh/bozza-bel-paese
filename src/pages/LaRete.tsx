import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Users, MapPin, Globe, Instagram, Linkedin, Mail } from "lucide-react";
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
};

type RealityRef = { id: string; name: string; city: string; region: string };

const LaRete = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [realitiesById, setRealitiesById] = useState<Record<string, RealityRef>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: profs }, { data: rels }] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, display_name, bio, avatar_url, affiliation, website, social_instagram, social_linkedin, public_email, reality_id, member_type, role_collective, role_real_life, figure_category")
          .eq("consent_public", true)
          .eq("member_type", "autore")
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

  const visible = filter
    ? profiles.filter((p) => p.figure_category === filter)
    : profiles;

  return (
    <div className="py-20">
      <SEO
        title="La rete — autori e contributor"
        description="Le persone che raccontano e ampliano la mappa delle arti italiane."
        canonicalPath="/la-rete"
      />
      <div className="editorial-container">
        <div className="max-w-3xl mb-12">
          <h1 className="editorial-heading mb-4">
            La <span className="italic text-primary">rete</span>
          </h1>
          <p className="editorial-body text-muted-foreground">
            Autori, contributor e ricercatori che animano <em>Il Bel Paese</em>. Una mappa è prima di tutto una comunità.
          </p>
        </div>

        {!loading && profiles.length > 0 && (
          <div className="mb-8 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-body text-muted-foreground">Filtra per categoria:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
            >
              <option value="">Tutte</option>
              {FIGURE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-body">Caricamento…</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            <Users size={32} className="mx-auto mb-3 opacity-50" />
            Nessun autore pubblico al momento.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((p) => {
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
                      <h2 className="font-display font-semibold text-base group-hover:text-primary transition-colors truncate">
                        {p.display_name}
                      </h2>
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
      </div>
    </div>
  );
};

export default LaRete;
