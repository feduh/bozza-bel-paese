import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, List, Map, ArrowRight, X, ChevronDown, Navigation, Loader2, LayoutGrid, ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import MapFallback from "@/components/MapFallback";
import SEO from "@/components/SEO";
import BookmarkButton from "@/components/BookmarkButton";
import {
  type DbRealityType,
  type RealityStatus,
  type Bucket,
  matchesBucket,
  getCategory,
  categoryConfig,
} from "@/lib/realityCategory";
import { REALITY_CATEGORIES } from "@/lib/categories";

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
  category: string | null;
  categories: string[];
  image_url: string | null;
  created_at: string;
  tags: string[];
};

type ViewMode = "list" | "map" | "magazine";
type SortMode = "default" | "az" | "za" | "latest";

const Mappatura = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [searchParams, setSearchParams] = useSearchParams();

  const [realities, setRealities] = useState<Reality[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>(() => {
    const v = searchParams.get("vista");
    return v === "list" || v === "magazine" ? v : "map";
  });
  const [bucketFilter, setBucketFilter] = useState<"all" | Bucket>(
    (searchParams.get("sezione") as Bucket | null) ?? "all"
  );
  const [regionFilter, setRegionFilter] = useState<string>(searchParams.get("regione") ?? "all");
  const [disciplineFilter, setDisciplineFilter] = useState<string>(searchParams.get("disciplina") ?? "all");
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("categoria") ?? "all");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [bucketMenuOpen, setBucketMenuOpen] = useState(false);
  const [yearMin, setYearMin] = useState<string>(searchParams.get("annoMin") ?? "");
  const [yearMax, setYearMax] = useState<string>(searchParams.get("annoMax") ?? "");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "denied" | "error">("idle");

  useEffect(() => {
    const fetchRealities = async () => {
      const { data: realitiesData } = await supabase.from("realities").select("*");
      const { data: tagsData } = await supabase.from("reality_tags").select("*");

      if (realitiesData) {
        const mapped = realitiesData.map((r) => {
          const rr = r as any;
          return {
            ...rr,
            name: isEn && rr.name_en ? rr.name_en : rr.name,
            description: isEn && rr.description_en ? rr.description_en : rr.description,
            type: rr.type as DbRealityType,
            status: (rr.status ?? "attivo") as RealityStatus,
            tags: tagsData?.filter((t) => t.reality_id === rr.id).map((t) => t.tag) ?? [],
          };
        });
        setRealities(mapped);
      }
      setLoading(false);
    };
    fetchRealities();
  }, [isEn]);

  // Sync state → URL (debounced for search)
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const setOrDel = (key: string, val: string, defaultVal: string) => {
        if (val && val !== defaultVal) next.set(key, val);
        else next.delete(key);
      };
      setOrDel("sezione", bucketFilter, "all");
      setOrDel("regione", regionFilter, "all");
      setOrDel("categoria", categoryFilter, "all");
      setOrDel("disciplina", disciplineFilter, "all");
      setOrDel("q", search.trim(), "");
      setOrDel("vista", view, "map");
      setOrDel("annoMin", yearMin, "");
      setOrDel("annoMax", yearMax, "");
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true });
      }
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketFilter, regionFilter, categoryFilter, disciplineFilter, search, view, yearMin, yearMax]);

  const regions = useMemo(() => [...new Set(realities.map((r) => r.region))].sort(), [realities]);
  const allDisciplines = useMemo(() => [...new Set(realities.flatMap((r) => r.tags))].sort(), [realities]);
  const yearRange = useMemo(() => {
    const years = realities.map((r) => r.year_founded).filter(Boolean);
    return { min: Math.min(...years, 1900), max: Math.max(...years, new Date().getFullYear()) };
  }, [realities]);

  // Haversine distance in km
  const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const yMin = yearMin ? parseInt(yearMin, 10) : null;
    const yMax = yearMax ? parseInt(yearMax, 10) : null;
    const list = realities.filter((r) => {
      if (bucketFilter !== "all" && !matchesBucket(bucketFilter, r.type, r.status)) return false;
      if (regionFilter !== "all" && r.region !== regionFilter) return false;
      if (disciplineFilter !== "all" && !r.tags.includes(disciplineFilter)) return false;
      const cats = r.categories && r.categories.length > 0
        ? r.categories
        : (r.category ? [r.category] : []);
      if (categoryFilter !== "all" && !cats.includes(categoryFilter)) return false;
      if (yMin !== null && r.year_founded < yMin) return false;
      if (yMax !== null && r.year_founded > yMax) return false;
      if (q) {
        const haystack = [r.name, r.city, r.region, r.description, ...cats, ...r.tags]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    // Explicit sort (only meaningful in list view) wins over geo-sort
    if (view !== "map" && sortMode !== "default") {
      const sorted = [...list];
      if (sortMode === "az") sorted.sort((a, b) => a.name.localeCompare(b.name, "it"));
      else if (sortMode === "za") sorted.sort((a, b) => b.name.localeCompare(a.name, "it"));
      else if (sortMode === "latest")
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return sorted;
    }

    if (userPos) {
      return [...list].sort(
        (a, b) =>
          distanceKm(userPos, { lat: a.lat, lng: a.lng }) -
          distanceKm(userPos, { lat: b.lat, lng: b.lng })
      );
    }
    return list;
  }, [realities, bucketFilter, regionFilter, disciplineFilter, categoryFilter, search, yearMin, yearMax, userPos, sortMode, view]);

  const hasFilters =
    bucketFilter !== "all" ||
    regionFilter !== "all" ||
    disciplineFilter !== "all" ||
    categoryFilter !== "all" ||
    search !== "" ||
    yearMin !== "" ||
    yearMax !== "" ||
    userPos !== null ||
    sortMode !== "default";

  const clearFilters = () => {
    setBucketFilter("all");
    setRegionFilter("all");
    setDisciplineFilter("all");
    setCategoryFilter("all");
    setSortMode("default");
    setSearch("");
    setYearMin("");
    setYearMax("");
    setUserPos(null);
    setGeoStatus("idle");
  };

  const requestGeo = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setGeoStatus("idle");
      },
      (err) => {
        setGeoStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
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

        <div className="mb-6 relative inline-block">
          <button
            onClick={() => setBucketMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={bucketMenuOpen}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card font-body text-sm font-medium hover:border-primary/40 transition-colors"
          >
            {t("map.section")}: {bucketFilter === "all" ? t("common.all") : t(`map.buckets.${bucketFilter}`)}
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {bucketMenuOpen && (
            <div role="menu" className="absolute z-20 mt-2 w-64 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
              {(["all", "spazi", "spazi-senza-spazi", "spazi-che-furono"] as const).map((val) => (
                <button
                  key={val}
                  role="menuitemradio"
                  aria-checked={bucketFilter === val}
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
          <div className="flex rounded-lg border border-border overflow-hidden" role="group" aria-label="Modalità di visualizzazione">
            <button
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-body font-medium transition-colors ${
                view === "map" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map size={16} aria-hidden="true" /> {t("map.view.map")}
            </button>
            <button
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-body font-medium transition-colors border-l border-border ${
                view === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={16} aria-hidden="true" /> {t("map.view.list")}
            </button>
            <button
              onClick={() => setView("magazine")}
              aria-pressed={view === "magazine"}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-body font-medium transition-colors border-l border-border ${
                view === "magazine" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid size={16} aria-hidden="true" /> Magazine
            </button>
          </div>
          <label className="flex-1">
            <span className="sr-only">{t("map.search")}</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("map.search")}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        {/* Region + Discipline + Year + Geo filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filtra per categoria artistica"
          >
            <option value="all">{t("map.filterCategory")}</option>
            {REALITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {view !== "map" && (
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-4 py-2 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={t("magazine.sortBy")}
            >
              <option value="default">{t("map.sortDefault")}</option>
              <option value="az">{t("map.sortAZ")}</option>
              <option value="za">{t("map.sortZA")}</option>
              <option value="latest">{t("map.sortLatest")}</option>
            </select>
          )}
          <div className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-input bg-background font-body text-sm">
            <span className="text-xs text-muted-foreground mr-1">{t("map.year")}</span>
            <input
              type="number"
              value={yearMin}
              onChange={(e) => setYearMin(e.target.value)}
              placeholder={String(yearRange.min)}
              min={1800}
              max={yearRange.max}
              className="w-20 bg-transparent focus:outline-none text-sm"
              aria-label="Anno fondazione minimo"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="number"
              value={yearMax}
              onChange={(e) => setYearMax(e.target.value)}
              placeholder={String(yearRange.max)}
              min={1800}
              max={yearRange.max}
              className="w-20 bg-transparent focus:outline-none text-sm"
              aria-label="Anno fondazione massimo"
            />
          </div>
          <button
            onClick={requestGeo}
            disabled={geoStatus === "loading"}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-body text-sm transition-colors ${
              userPos
                ? "border-secondary bg-secondary/15 text-secondary"
                : "border-input bg-background hover:border-primary/40"
            } disabled:opacity-50`}
          >
            {geoStatus === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            {userPos ? t("map.nearYou") : t("map.nearMe")}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 px-4 py-2 text-xs font-body text-destructive hover:underline">
              <X size={14} /> {t("map.clearFilters")}
            </button>
          )}
        </div>
        {geoStatus === "denied" && (
          <p role="alert" className="text-xs text-destructive font-body mb-4 -mt-2">
            Permesso di geolocalizzazione negato. Abilitalo nelle impostazioni del browser.
          </p>
        )}
        {geoStatus === "error" && (
          <p role="alert" className="text-xs text-destructive font-body mb-4 -mt-2">
            Impossibile ottenere la posizione. Riprova tra poco.
          </p>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 text-xs font-body text-muted-foreground" aria-label="Legenda categorie">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-3 h-3 rounded-full bg-primary border-2 border-primary" /> {t("map.buckets.spazi")}
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-3 h-3 rounded-full bg-secondary border-2 border-secondary" /> {t("map.buckets.spazi-senza-spazi")}
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-3 h-3 rounded-full bg-background border-2 border-primary" />
            <span aria-hidden="true" className="inline-block w-3 h-3 rounded-full bg-background border-2 border-secondary" />
            {t("map.buckets.spazi-che-furono")}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-6 font-body" aria-live="polite" aria-atomic="true">
          {t("map.results", { count: filtered.length })}
        </p>

        {/* Map view */}
        {view === "map" && (
          <div className="overflow-hidden h-[600px]">
            <Suspense fallback={<MapFallback height="600px" />}>
              <LazyMap
                center={[41.8719, 12.5674]}
                zoom={6}
                markers={mapMarkers}
                scrollWheelZoom={false}
                height="600px"
                userLocation={userPos}
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
                  {((r.categories && r.categories.length > 0) || r.category) && (
                    <p className="text-[11px] uppercase tracking-wider text-primary font-body font-semibold mb-2">
                      {(r.categories && r.categories.length > 0 ? r.categories : [r.category!]).join(" · ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mb-3">
                    <MapPin size={13} /> {r.city}, {r.region}
                    {userPos && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-medium">
                        {Math.round(distanceKm(userPos, { lat: r.lat, lng: r.lng }))} km
                      </span>
                    )}
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

        {/* Magazine view: editorial card grid with cover images */}
        {view === "magazine" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((r) => {
              const cat = getCategory(r.type, r.status);
              const cfg = categoryConfig[cat];
              const Icon = cfg.icon;
              return (
                <Link
                  to={`/realta/${r.id}`}
                  key={r.id}
                  className="group flex flex-col rounded-lg overflow-hidden bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted via-muted to-muted-foreground/10">
                        <ImageOff size={32} className="text-muted-foreground/40" aria-hidden="true" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${cfg.badgeClass}`}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                    <div
                      className="absolute top-3 right-3"
                      onClick={(e) => e.preventDefault()}
                    >
                      <BookmarkButton realityId={r.id} variant="compact" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-5">
                    {((r.categories && r.categories.length > 0) || r.category) && (
                      <p className="text-[10px] uppercase tracking-wider text-primary font-body font-semibold mb-2">
                        {(r.categories && r.categories.length > 0 ? r.categories : [r.category!]).join(" · ")}
                      </p>
                    )}
                    <h3 className="font-display text-lg font-semibold mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {r.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mb-3">
                      <MapPin size={11} /> {r.city}, {r.region}
                      <span className="ml-auto">
                        {r.year_founded}{r.year_closed ? `–${r.year_closed}` : ""}
                      </span>
                    </p>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {r.description}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-4 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      {t("home.discover")} <ArrowRight size={14} />
                    </span>
                  </div>
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
