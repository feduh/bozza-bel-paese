import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, List, Map, ArrowRight, X, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import MapFallback from "@/components/MapFallback";
import SEO from "@/components/SEO";
import {
  type DbRealityType,
  type RealityStatus,
  type Bucket,
  matchesBucket,
  getCategory,
  categoryConfig,
} from "@/lib/realityCategory";

const LazyMap = lazy(() => import("@/components/LazyMap"));

type Reality = {
  id: string;
  name: string;
  type: DbRealityType;
  status: RealityStatus;
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

const Mappatura = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBucket = (searchParams.get("sezione") as Bucket | null) ?? null;

  const [realities, setRealities] = useState<Reality[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("map");
  const [bucketFilter, setBucketFilter] = useState<"all" | Bucket>(initialBucket ?? "all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [bucketMenuOpen, setBucketMenuOpen] = useState(false);

  useEffect(() => {
    const fetchRealities = async () => {
      const { data: realitiesData } = await supabase.from("realities").select("*");
      const { data: tagsData } = await supabase.from("reality_tags").select("*");

      if (realitiesData) {
        const mapped = realitiesData.map((r) => ({
          ...r,
          type: r.type as DbRealityType,
          status: ((r as { status?: string }).status ?? "attivo") as RealityStatus,
          tags: tagsData?.filter((t) => t.reality_id === r.id).map((t) => t.tag) ?? [],
        }));
        setRealities(mapped);
      }
      setLoading(false);
    };
    fetchRealities();
  }, []);

  // Sync URL ↔ state
  useEffect(() => {
    if (bucketFilter === "all") {
      if (searchParams.get("sezione")) {
        searchParams.delete("sezione");
        setSearchParams(searchParams, { replace: true });
      }
    } else if (searchParams.get("sezione") !== bucketFilter) {
      searchParams.set("sezione", bucketFilter);
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketFilter]);

  const regions = useMemo(() => [...new Set(realities.map((r) => r.region))].sort(), [realities]);
  const allDisciplines = useMemo(() => [...new Set(realities.flatMap((r) => r.tags))].sort(), [realities]);

  const filtered = useMemo(() => {
    return realities.filter((r) => {
      if (bucketFilter !== "all" && !matchesBucket(bucketFilter, r.type, r.status)) return false;
      if (regionFilter !== "all" && r.region !== regionFilter) return false;
      if (disciplineFilter !== "all" && !r.tags.includes(disciplineFilter)) return false;
      if (
        search &&
        !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.city.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [realities, bucketFilter, regionFilter, disciplineFilter, search]);

  const hasFilters =
    bucketFilter !== "all" || regionFilter !== "all" || disciplineFilter !== "all" || search !== "";

  const clearFilters = () => {
    setBucketFilter("all");
    setRegionFilter("all");
    setDisciplineFilter("all");
    setSearch("");
  };

  const mapMarkers = useMemo(
    () =>
      filtered.map((r) => {
        const cat = getCategory(r.type, r.status);
        const cfg = categoryConfig[cat];
        return {
          id: r.id,
          lat: r.lat,
          lng: r.lng,
          name: r.name,
          city: r.city,
          color: cfg.markerColor,
          outline: cfg.outline,
          popupContent: `
            <div style="font-family:var(--font-body)">
              <strong style="font-family:var(--font-display);font-size:14px">${r.name.replace(/</g, "&lt;")}</strong><br/>
              <span style="font-size:12px">${r.city}, ${r.region}</span><br/>
              <span style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;opacity:.7">${cfg.label}</span><br/>
              <a href="/realta/${r.id}" style="font-size:12px;color:hsl(var(--primary));text-decoration:underline">Vai alla scheda →</a>
            </div>`,
        };
      }),
    [filtered]
  );

  if (loading) {
    return (
      <div className="py-20 editorial-container">
        <Skeleton className="h-12 w-2/3 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-10" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="py-20">
      <SEO
        title="Mappatura — realtà artistiche italiane"
        description="Esplora la scena indipendente italiana: spazi con sede, nomadi e archivio storico. Filtra per regione, media artistico e stato."
        canonicalPath="/mappatura"
      />
      <div className="editorial-container">
        <div className="max-w-3xl mb-10">
          <h1 className="editorial-heading mb-6">
            <span className="italic text-primary">{t("map.title")}</span> {t("map.titleSuffix")}
          </h1>
          <p className="editorial-body text-muted-foreground">
            {t("map.lead")}
          </p>
        </div>

        {/* Section dropdown (3 main categories) */}
        <div className="mb-6 relative inline-block">
          <button
            onClick={() => setBucketMenuOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card font-body text-sm font-medium hover:border-primary/40 transition-colors"
          >
            {t("map.section")}: {bucketFilter === "all" ? t("common.all") : t(`map.buckets.${bucketFilter}`)}
            <ChevronDown size={14} />
          </button>
          {bucketMenuOpen && (
            <div className="absolute z-20 mt-2 w-64 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
              {(["all", "spazi", "spazi-senza-spazi", "spazi-che-furono"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setBucketFilter(val as "all" | Bucket);
                    setBucketMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm font-body hover:bg-muted ${
                    bucketFilter === val ? "bg-muted text-primary font-medium" : ""
                  }`}
                >
                  {val === "all" ? t("common.all") : t(`map.buckets.${val}`)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View toggle + Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-body font-medium transition-colors ${
                view === "map" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map size={16} /> {t("map.view.map")}
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-body font-medium transition-colors ${
                view === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={16} /> {t("map.view.list")}
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("map.search")}
            className="flex-1 px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Region + Discipline filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t("map.filterRegion")}</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t("map.filterMedia")}</option>
            {allDisciplines.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 px-4 py-2 text-xs font-body text-destructive hover:underline">
              <X size={14} /> {t("map.clearFilters")}
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 text-xs font-body text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-primary border-2 border-primary" /> {t("map.buckets.spazi")}
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-secondary border-2 border-secondary" /> {t("map.buckets.spazi-senza-spazi")}
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-background border-2 border-primary" />
            <span className="inline-block w-3 h-3 rounded-full bg-background border-2 border-secondary" />
            {t("map.buckets.spazi-che-furono")}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-6 font-body">
          {t("map.results", { count: filtered.length })}
        </p>

        {/* Map view */}
        {view === "map" && (
          <div className="rounded-lg overflow-hidden border border-border h-[600px]">
            <Suspense fallback={<MapFallback height="600px" />}>
              <LazyMap
                center={[41.8719, 12.5674]}
                zoom={6}
                markers={mapMarkers}
                scrollWheelZoom={false}
                height="600px"
              />
            </Suspense>
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => {
              const cat = getCategory(r.type, r.status);
              const cfg = categoryConfig[cat];
              const Icon = cfg.icon;
              return (
                <Link
                  to={`/realta/${r.id}`}
                  key={r.id}
                  className="group p-6 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${cfg.badgeClass}`}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">
                      {r.year_founded}{r.year_closed ? ` – ${r.year_closed}` : r.status === "attivo" ? " – oggi" : ""}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{r.name}</h3>
                  <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mb-3">
                    <MapPin size={13} /> {r.city}, {r.region}
                  </p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">{r.description}</p>
                  <span className="inline-flex items-center gap-1 mt-4 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    {t("home.discover")} <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground font-body">
                {t("map.empty")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mappatura;
