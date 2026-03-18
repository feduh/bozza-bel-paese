import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { MapPin, Compass, Archive, List, Map, ArrowRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MapFallback from "@/components/MapFallback";

const LazyMap = lazy(() => import("@/components/LazyMap"));

type RealityType = "nomade" | "con-sede" | "scomparsa";

type Reality = {
  id: string;
  name: string;
  type: RealityType;
  city: string;
  region: string;
  description: string;
  year_founded: number;
  year_closed: number | null;
  lat: number;
  lng: number;
  website: string | null;
  tags: string[];
};

const typeConfig: Record<RealityType, { label: string; icon: typeof MapPin; colorClass: string }> = {
  nomade: { label: "Nomade", icon: Compass, colorClass: "bg-primary/10 text-primary border-primary/20" },
  "con-sede": { label: "Con sede", icon: MapPin, colorClass: "bg-secondary/10 text-secondary border-secondary/20" },
  scomparsa: { label: "Scomparsa", icon: Archive, colorClass: "bg-muted text-muted-foreground border-border" },
};

const Mappatura = () => {
  const [realities, setRealities] = useState<Reality[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  const [typeFilter, setTypeFilter] = useState<"all" | RealityType>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRealities = async () => {
      const { data: realitiesData } = await supabase.from("realities").select("*");
      const { data: tagsData } = await supabase.from("reality_tags").select("*");

      if (realitiesData) {
        const mapped = realitiesData.map((r) => ({
          ...r,
          type: r.type as RealityType,
          tags: tagsData?.filter((t) => t.reality_id === r.id).map((t) => t.tag) ?? [],
        }));
        setRealities(mapped);
      }
      setLoading(false);
    };
    fetchRealities();
  }, []);

  const regions = useMemo(() => [...new Set(realities.map((r) => r.region))].sort(), [realities]);
  const allDisciplines = useMemo(() => [...new Set(realities.flatMap((r) => r.tags))].sort(), [realities]);

  const filtered = useMemo(() => {
    return realities.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (regionFilter !== "all" && r.region !== regionFilter) return false;
      if (disciplineFilter !== "all" && !r.tags.includes(disciplineFilter)) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.city.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [realities, typeFilter, regionFilter, disciplineFilter, search]);

  const hasFilters = typeFilter !== "all" || regionFilter !== "all" || disciplineFilter !== "all" || search !== "";

  const clearFilters = () => {
    setTypeFilter("all");
    setRegionFilter("all");
    setDisciplineFilter("all");
    setSearch("");
  };

  const mapMarkers = useMemo(
    () =>
      filtered.map((r) => ({
        id: r.id,
        lat: r.lat,
        lng: r.lng,
        name: r.name,
        city: r.city,
        popupContent: (
          <div className="font-body">
            <strong className="font-display">{r.name}</strong>
            <br />
            <span className="text-xs">{r.city}, {r.region}</span>
            <br />
            <a href={`/realta/${r.id}`} className="text-xs text-blue-600 underline">
              Vai alla scheda →
            </a>
          </div>
        ),
      })),
    [filtered]
  );

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground font-body">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="editorial-container">
        <div className="max-w-3xl mb-10">
          <h1 className="editorial-heading mb-6">
            <span className="italic text-primary">Mappatura</span> delle realtà
          </h1>
          <p className="editorial-body text-muted-foreground">
            Esplora le realtà artistiche italiane. Filtra per tipologia, regione o disciplina.
          </p>
        </div>

        {/* View toggle + Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-body font-medium transition-colors ${
                view === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={16} /> Elenco
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-body font-medium transition-colors ${
                view === "map" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map size={16} /> Mappa
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome o città..."
            className="flex-1 px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {(
            [["all", "Tutte le tipologie"], ["nomade", "Nomadi"], ["con-sede", "Con sede"], ["scomparsa", "Scomparse"]] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={`px-4 py-1.5 rounded-full text-xs font-body font-medium border transition-all ${
                typeFilter === val ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tutte le regioni</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tutte le discipline</option>
            {allDisciplines.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 px-4 py-2 text-xs font-body text-destructive hover:underline">
              <X size={14} /> Rimuovi filtri
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-6 font-body">
          {filtered.length} realtà trovate
        </p>

        {/* List view */}
        {view === "list" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => {
              const config = typeConfig[r.type];
              const Icon = config.icon;
              return (
                <Link
                  to={`/realta/${r.id}`}
                  key={r.id}
                  className="group p-6 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${config.colorClass}`}>
                      <Icon size={12} /> {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {r.year_founded}{r.year_closed ? ` – ${r.year_closed}` : " – oggi"}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{r.name}</h3>
                  <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mb-3">
                    <MapPin size={13} /> {r.city}, {r.region}
                  </p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">{r.description}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Scopri <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground font-body">
                Nessuna realtà trovata con i filtri selezionati.
              </div>
            )}
          </div>
        )}

        {/* Map view */}
        {view === "map" && (
          <div className="rounded-lg overflow-hidden border border-border h-[600px]">
            <Suspense fallback={<MapFallback height="600px" />}>
              <LazyMap
                center={[41.8719, 12.5674]}
                zoom={6}
                markers={mapMarkers}
                scrollWheelZoom={true}
                height="600px"
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mappatura;
