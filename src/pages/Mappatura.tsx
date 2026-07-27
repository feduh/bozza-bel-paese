import { useState, useMemo, useEffect, useCallback, useDeferredValue, lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, List, Map, ArrowRight, X, Navigation, Loader2, Search, SlidersHorizontal, AlertTriangle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import MapFallback from "@/components/MapFallback";
import SEO from "@/components/SEO";
import {
  type DbRealityType,
  type RealityStatus,
  type Category,
  getCategory,
  categoryConfig,
} from "@/lib/realityCategory";
import { REALITY_CATEGORIES } from "@/lib/categories";
import { escapeHtml } from "@/lib/utils";
import MultiSelectPopover from "@/components/MultiSelectPopover";

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

type ViewMode = "list" | "map";
type SortMode = "default" | "az" | "za" | "latest";

const CATEGORY_CHIPS = [
  { val: "spazio" as Category, label: "Spazi", color: "hsl(var(--primary))", outline: false },
  { val: "spazio-senza-spazio" as Category, label: "Spazi senza spazi", color: "hsl(var(--secondary))", outline: false },
  { val: "spazio-fu-spazio" as Category, label: "Spazi che furono", color: "hsl(var(--primary))", outline: true },
  { val: "spazio-fu-senza" as Category, label: "Spazi che furono itineranti", color: "hsl(var(--secondary))", outline: true },
];

const Mappatura = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [realities, setRealities] = useState<Reality[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [view, setView] = useState<ViewMode>(() => {
    const v = searchParams.get("vista");
    return v === "list" ? v : "map";
  });
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(() => {
    const raw = searchParams.get("tipo");
    if (!raw) return new Set();
    const valid: Category[] = ["spazio", "spazio-senza-spazio", "spazio-fu-spazio", "spazio-fu-senza"];
    return new Set(raw.split(",").filter((v): v is Category => (valid as string[]).includes(v)));
  });
  const parseSet = (raw: string | null) =>
    new Set(raw ? raw.split(",").filter(Boolean) : []);
  const [regionFilter, setRegionFilter] = useState<Set<string>>(() => parseSet(searchParams.get("regione")));
  const [disciplineFilter, setDisciplineFilter] = useState<Set<string>>(() => parseSet(searchParams.get("disciplina")));
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(() => parseSet(searchParams.get("categoria")));
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const deferredSearch = useDeferredValue(search);
  const [yearMin, setYearMin] = useState<string>(searchParams.get("annoMin") ?? "");
  const [yearMax, setYearMax] = useState<string>(searchParams.get("annoMax") ?? "");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "denied" | "error">("idle");
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchRealities = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") setLoading(true);
    else setRefreshing(true);
    setError(false);
    try {
      const { data: realitiesData, error: realitiesError } = await supabase.from("realities").select("*");
      const { data: tagsData, error: tagsError } = await supabase.from("reality_tags").select("*");
      if (realitiesError || tagsError) throw realitiesError || tagsError;
      if (realitiesData) {
        const mapped = realitiesData.map((r) => {
          const rr = r as any;
          return {
            ...rr,
            type: rr.type as DbRealityType,
            status: (rr.status ?? "attivo") as RealityStatus,
            tags: tagsData?.filter((t) => t.reality_id === rr.id).map((t) => t.tag) ?? [],
          };
        });
        setRealities(mapped);
      }
    } catch (err) {
      console.error("Error fetching realities:", err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRealities("initial");
  }, [fetchRealities]);

  // Sync state → URL (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const setOrDel = (key: string, val: string, defaultVal: string) => {
        if (val && val !== defaultVal) next.set(key, val);
        else next.delete(key);
      };
      const tipoStr = [...selectedCategories].join(",");
      setOrDel("tipo", tipoStr, "");
      setOrDel("regione", [...regionFilter].join(","), "");
      setOrDel("categoria", [...categoryFilter].join(","), "");
      setOrDel("disciplina", [...disciplineFilter].join(","), "");
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
  }, [selectedCategories, regionFilter, categoryFilter, disciplineFilter, search, view, yearMin, yearMax]);

  const regions = useMemo(() => [...new Set(realities.map((r) => r.region))].sort(), [realities]);
  const allDisciplines = useMemo(() => [...new Set(realities.flatMap((r) => r.tags))].sort(), [realities]);
  const yearRange = useMemo(() => {
    const years = realities.map((r) => r.year_founded).filter(Boolean);
    return { min: Math.min(...years, 1900), max: Math.max(...years, new Date().getFullYear()) };
  }, [realities]);

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
    const q = deferredSearch.trim().toLowerCase();
    const yMin = yearMin ? parseInt(yearMin, 10) : null;
    const yMax = yearMax ? parseInt(yearMax, 10) : null;
    const list = realities.filter((r) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(getCategory(r.type, r.status))) return false;
      if (regionFilter.size > 0 && !regionFilter.has(r.region)) return false;
      if (disciplineFilter.size > 0 && !r.tags.some((tg) => disciplineFilter.has(tg))) return false;
      const cats = r.categories && r.categories.length > 0 ? r.categories : (r.category ? [r.category] : []);
      if (categoryFilter.size > 0 && !cats.some((c) => categoryFilter.has(c))) return false;
      if (yMin !== null && r.year_founded < yMin) return false;
      if (yMax !== null && r.year_founded > yMax) return false;
      if (q) {
        const haystack = [r.name, r.city, r.region, r.description, ...cats, ...r.tags].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

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
        (a, b) => distanceKm(userPos, { lat: a.lat, lng: a.lng }) - distanceKm(userPos, { lat: b.lat, lng: b.lng })
      );
    }
    return list;
  }, [realities, selectedCategories, regionFilter, disciplineFilter, categoryFilter, deferredSearch, yearMin, yearMax, userPos, sortMode, view]);

  // Numero di filtri "attivi" per badge
  const activeFilterCount =
    selectedCategories.size +
    regionFilter.size +
    disciplineFilter.size +
    categoryFilter.size +
    (yearMin ? 1 : 0) +
    (yearMax ? 1 : 0) +
    (sortMode !== "default" ? 1 : 0);

  const hasAnyFilter = activeFilterCount > 0 || search !== "" || userPos !== null;

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setRegionFilter(new Set());
    setDisciplineFilter(new Set());
    setCategoryFilter(new Set());
    setSortMode("default");
    setSearch("");
    setYearMin("");
    setYearMax("");
    setUserPos(null);
    setGeoStatus("idle");
  };

  const requestGeo = () => {
    if (!navigator.geolocation) { setGeoStatus("error"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => { setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoStatus("idle"); },
      (err) => { setGeoStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error"); },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const mapMarkers = useMemo(
    () => filtered.map((r) => {
      const cat = getCategory(r.type, r.status);
      const cfg = categoryConfig[cat];
      return {
        id: r.id, lat: r.lat, lng: r.lng, name: r.name, city: r.city,
        color: cfg.markerColor, outline: cfg.outline,
        popupContent: `
          <div style="font-family:var(--font-body)">
            <strong style="font-family:var(--font-display);font-size:14px">${escapeHtml(r.name)}</strong><br/>
            <span style="font-size:12px">${escapeHtml(r.city)}, ${escapeHtml(r.region)}</span><br/>
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:.05em;opacity:.7">${escapeHtml(cfg.label)}</span><br/>
            <a href="/realta/${encodeURIComponent(r.id)}" style="font-size:12px;color:hsl(var(--primary));text-decoration:underline">Vai alla scheda →</a>
          </div>`,
      };
    }),
    [filtered]
  );

  // ============= Skeleton allineato al layout reale =============
  if (loading) {
    return (
      <div className="bg-background py-16 md:py-20">
        <div className="editorial-container">
          <div className="border-b-2 border-foreground pb-10 mb-10">
            <Skeleton className="h-12 w-2/3 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Skeleton className="h-11 w-full sm:w-40" />
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-full sm:w-40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            <Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" />
          </div>
          <MapFallback height="600px" />
        </div>
      </div>
    );
  }

  // ============= Errore migliorato =============
  if (error) {
    return (
      <div className="py-20 editorial-container">
        <div className="max-w-lg mx-auto text-center brutalist-border p-10 bg-card">
          <AlertTriangle size={40} className="text-destructive mx-auto mb-4" />
          <h2 className="editorial-subheading mb-3">Non riusciamo a caricare la mappa</h2>
          <p className="text-sm text-foreground/70 mb-6">
            Controlla la connessione e riprova. Se il problema persiste, riprova più tardi.
          </p>
          <button
            onClick={() => fetchRealities("initial")}
            className="inline-flex items-center gap-2 px-6 py-3 brutalist-border bg-primary text-primary-foreground hover:opacity-90 font-bold uppercase tracking-widest transition-opacity text-xs"
          >
            <RefreshCw size={14} /> Riprova
          </button>
        </div>
      </div>
    );
  }

  const totalCount = realities.length;
  const isSearching = search !== deferredSearch;

  // ============= Blocco interno filtri secondari (region/discipline/category/year/sort) =============
  const SecondaryFilters = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "flex flex-col gap-3" : "w-full flex flex-col sm:flex-row sm:flex-wrap gap-3 items-stretch sm:items-center"}>
      <MultiSelectPopover
        label={t("map.filterRegion")}
        placeholder={t("map.filterRegion")}
        options={regions}
        selected={regionFilter}
        onChange={setRegionFilter}
        className={compact ? "w-full" : "w-full sm:flex-1 sm:min-w-[160px]"}
      />
      <MultiSelectPopover
        label="Tag / media"
        placeholder="Tutti i tag / media"
        options={allDisciplines}
        selected={disciplineFilter}
        onChange={setDisciplineFilter}
        className={compact ? "w-full" : "w-full sm:flex-1 sm:min-w-[160px]"}
      />
      <MultiSelectPopover
        label={t("map.filterCategory")}
        placeholder={t("map.filterCategory")}
        options={[...REALITY_CATEGORIES]}
        selected={categoryFilter}
        onChange={setCategoryFilter}
        className={compact ? "w-full" : "w-full sm:flex-1 sm:min-w-[160px]"}
      />
      {view !== "map" && (
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="w-full sm:flex-1 sm:min-w-[160px] min-h-[44px] px-4 py-2.5 brutalist-border bg-background text-sm focus:outline-none focus:border-primary"
          aria-label={t("magazine.sortBy")}
        >
          <option value="default">{t("map.sortDefault")}</option>
          <option value="az">{t("map.sortAZ")}</option>
          <option value="za">{t("map.sortZA")}</option>
          <option value="latest">{t("map.sortLatest")}</option>
        </select>
      )}
      <div className="w-full sm:flex-1 sm:min-w-[200px] min-h-[44px] inline-flex items-center gap-1 px-3 py-2 brutalist-border bg-background text-sm">
        <span className="micro-label mr-1">{t("map.year")}</span>
        <input type="number" value={yearMin} onChange={(e) => setYearMin(e.target.value)} placeholder={String(yearRange.min)} min={1800} max={yearRange.max} className="w-full min-w-0 bg-transparent focus:outline-none text-sm" aria-label="Anno fondazione minimo" />
        <span className="text-foreground/60">–</span>
        <input type="number" value={yearMax} onChange={(e) => setYearMax(e.target.value)} placeholder={String(yearRange.max)} min={1800} max={yearRange.max} className="w-full min-w-0 bg-transparent focus:outline-none text-sm" aria-label="Anno fondazione massimo" />
      </div>
    </div>
  );

  // Chip tipologia (multi-select)
  const CategoryChips = ({ scrollable = false }: { scrollable?: boolean }) => (
    <div
      className={
        scrollable
          ? "flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-hidden"
          : "w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2"
      }
      role="group"
      aria-label="Tipologia di realtà"
    >
      {CATEGORY_CHIPS.map((b) => {
        const active = selectedCategories.has(b.val);
        return (
          <button
            key={b.val}
            type="button"
            onClick={() => {
              setSelectedCategories((prev) => {
                const next = new Set(prev);
                if (next.has(b.val)) next.delete(b.val);
                else next.add(b.val);
                return next;
              });
            }}
            aria-pressed={active}
            className={`${scrollable ? "shrink-0 snap-start" : "w-full"} inline-flex items-center justify-center gap-2 px-3 py-2 min-h-[44px] brutalist-border text-xs uppercase tracking-[0.12em] font-bold transition-colors ${
              active ? "bg-primary text-primary-foreground" : "bg-background hover:bg-foreground/5"
            }`}
          >
            <span
              aria-hidden="true"
              className="inline-block w-3 h-3 rounded-full"
              style={
                b.outline
                  ? { background: "transparent", border: `2px solid ${b.color}` }
                  : { background: b.color, border: `2px solid ${b.color}` }
              }
            />
            {b.label}
          </button>
        );
      })}
    </div>
  );

  // Chip "filtro attivo" con × per rimuovere il singolo criterio
  const ActiveFilterPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/40 hover:bg-secondary/70 brutalist-border text-[11px] uppercase tracking-[0.1em] font-bold transition-colors"
    >
      <span className="truncate max-w-[180px]">{label}</span>
      <X size={12} aria-hidden="true" />
      <span className="sr-only">Rimuovi filtro</span>
    </button>
  );

  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title="Mappatura — realtà artistiche italiane"
        description="Esplora la scena indipendente italiana: spazi con sede, nomadi e archivio storico. Filtra per regione, disciplina e stato."
        canonicalPath="/mappatura"
      />
      <div className="editorial-container">
        <header className="border-b-2 border-foreground pb-10 mb-10">
          <h1 className="editorial-heading mb-6 max-w-3xl">
            <span className="text-primary">{t("map.title")}</span>
            <br />
            {t("map.titleSuffix")}
          </h1>
          <p className="editorial-body text-foreground/80 max-w-3xl">{t("map.lead")}</p>
        </header>

        <h2 className="sr-only">Filtri di ricerca</h2>

        {/* ============ Toolbar principale (sticky su mobile) ============ */}
        <div className="sticky top-16 z-30 -mx-4 md:mx-0 px-4 md:px-0 py-3 md:py-0 bg-background/95 md:bg-transparent backdrop-blur md:backdrop-blur-0 md:static">
          <div className="w-full flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <div className="flex w-full sm:w-auto brutalist-border overflow-hidden" role="group" aria-label="Modalità di visualizzazione">
              <button
                onClick={() => setView("map")}
                aria-pressed={view === "map"}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 min-h-[44px] text-[10px] sm:text-xs uppercase tracking-[0.12em] font-bold transition-colors ${
                  view === "map" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-foreground/5"
                }`}
              >
                <Map size={14} aria-hidden="true" /> <span>{t("map.view.map")}</span>
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 min-h-[44px] text-[10px] sm:text-xs uppercase tracking-[0.12em] font-bold transition-colors border-l-2 border-foreground ${
                  view === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-foreground/5"
                }`}
              >
                <List size={14} aria-hidden="true" /> <span>{t("map.view.list")}</span>
              </button>
            </div>

            {/* Ricerca con icona e clear */}
            <label className="w-full sm:flex-1 sm:min-w-[200px] relative">
              <span className="sr-only">Cerca</span>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca per nome, città, disciplina, tag…"
                className="w-full min-h-[44px] pl-9 pr-9 py-2.5 brutalist-border bg-background text-sm focus:outline-none focus:border-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Svuota ricerca"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <button
              onClick={requestGeo}
              disabled={geoStatus === "loading"}
              className={`hidden md:inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] brutalist-border text-xs uppercase tracking-[0.15em] font-bold transition-colors ${
                userPos ? "bg-secondary text-foreground" : "bg-background hover:bg-foreground hover:text-background"
              } disabled:opacity-50`}
            >
              {geoStatus === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {userPos ? t("map.nearYou") : t("map.nearMe")}
            </button>

            {/* Bottom sheet trigger su mobile */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="md:hidden relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] brutalist-border text-xs uppercase tracking-[0.15em] font-bold transition-colors bg-background hover:bg-foreground hover:text-background"
                >
                  <SlidersHorizontal size={14} aria-hidden="true" />
                  Filtri
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filtri</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="micro-label text-foreground/70 mb-2">Tipologia</p>
                    <div className="grid grid-cols-1 gap-2">
                      {CATEGORY_CHIPS.map((b) => {
                        const active = selectedCategories.has(b.val);
                        return (
                          <button
                            key={b.val}
                            type="button"
                            onClick={() => {
                              setSelectedCategories((prev) => {
                                const next = new Set(prev);
                                if (next.has(b.val)) next.delete(b.val); else next.add(b.val);
                                return next;
                              });
                            }}
                            aria-pressed={active}
                            className={`w-full inline-flex items-center justify-start gap-2 px-3 py-3 min-h-[48px] brutalist-border text-xs uppercase tracking-[0.12em] font-bold transition-colors ${
                              active ? "bg-primary text-primary-foreground" : "bg-background"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className="inline-block w-3 h-3 rounded-full shrink-0"
                              style={b.outline ? { background: "transparent", border: `2px solid ${b.color}` } : { background: b.color, border: `2px solid ${b.color}` }}
                            />
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="micro-label text-foreground/70 mb-2">Regione, disciplina, anno</p>
                    <SecondaryFilters compact />
                  </div>
                  <button
                    onClick={requestGeo}
                    disabled={geoStatus === "loading"}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] brutalist-border text-xs uppercase tracking-[0.15em] font-bold transition-colors ${
                      userPos ? "bg-secondary text-foreground" : "bg-background"
                    } disabled:opacity-50`}
                  >
                    {geoStatus === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                    {userPos ? t("map.nearYou") : t("map.nearMe")}
                  </button>
                </div>
                <SheetFooter className="mt-6 flex flex-row gap-2 sm:justify-between">
                  {hasAnyFilter && (
                    <button
                      onClick={clearFilters}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-3 text-xs uppercase tracking-[0.15em] font-bold text-destructive hover:underline"
                    >
                      <X size={14} /> Reimposta
                    </button>
                  )}
                  <button
                    onClick={() => setSheetOpen(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-primary text-primary-foreground text-xs uppercase tracking-[0.15em] font-bold hover:opacity-90 transition-opacity"
                  >
                    Applica · {filtered.length} risultati
                  </button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ============ Filtri desktop (chip tipologia + secondari) ============ */}
        <div className="hidden md:block mt-4">
          <CategoryChips />
          <div className="mt-4">
            <SecondaryFilters />
          </div>
        </div>

        {geoStatus === "denied" && (
          <p role="alert" className="text-xs text-destructive font-body mt-3">
            Permesso di geolocalizzazione negato. Abilitalo nelle impostazioni del browser.
          </p>
        )}
        {geoStatus === "error" && (
          <p role="alert" className="text-xs text-destructive font-body mt-3">
            Impossibile ottenere la posizione. Riprova tra poco.
          </p>
        )}

        {/* ============ Barra "filtri attivi" ============ */}
        {hasAnyFilter && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="micro-label text-foreground/60">Filtri attivi:</span>
            {[...selectedCategories].map((c) => {
              const cfg = CATEGORY_CHIPS.find((x) => x.val === c);
              return cfg ? (
                <ActiveFilterPill
                  key={c}
                  label={cfg.label}
                  onRemove={() => setSelectedCategories((prev) => { const n = new Set(prev); n.delete(c); return n; })}
                />
              ) : null;
            })}
            {[...regionFilter].map((v) => (
              <ActiveFilterPill
                key={`reg-${v}`}
                label={v}
                onRemove={() => setRegionFilter((prev) => { const n = new Set(prev); n.delete(v); return n; })}
              />
            ))}
            {[...disciplineFilter].map((v) => (
              <ActiveFilterPill
                key={`tag-${v}`}
                label={`Tag: ${v}`}
                onRemove={() => setDisciplineFilter((prev) => { const n = new Set(prev); n.delete(v); return n; })}
              />
            ))}
            {[...categoryFilter].map((v) => (
              <ActiveFilterPill
                key={`cat-${v}`}
                label={v}
                onRemove={() => setCategoryFilter((prev) => { const n = new Set(prev); n.delete(v); return n; })}
              />
            ))}
            {yearMin && <ActiveFilterPill label={`Da ${yearMin}`} onRemove={() => setYearMin("")} />}
            {yearMax && <ActiveFilterPill label={`A ${yearMax}`} onRemove={() => setYearMax("")} />}
            {search && <ActiveFilterPill label={`"${search}"`} onRemove={() => setSearch("")} />}
            {userPos && <ActiveFilterPill label="Vicino a me" onRemove={() => { setUserPos(null); setGeoStatus("idle"); }} />}
            {sortMode !== "default" && <ActiveFilterPill label={`Ordine: ${sortMode.toUpperCase()}`} onRemove={() => setSortMode("default")} />}
            <button
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] font-bold text-destructive hover:underline"
            >
              <X size={12} /> Reimposta tutto
            </button>
          </div>
        )}

        <h2 className="sr-only">Risultati</h2>

        {/* ============ Contatore risultati prominente ============ */}
        <div className="mt-6 mb-4 flex items-baseline gap-3" aria-live="polite" aria-atomic="true">
          <span
            key={filtered.length}
            className="text-2xl md:text-3xl leading-none animate-in fade-in duration-300"
            style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.02em" }}
          >
            {filtered.length}
          </span>
          <span className="micro-label text-foreground/70">
            {filtered.length === 1 ? "realtà" : "realtà"} di {totalCount}
          </span>
          {isSearching && <Loader2 size={12} className="animate-spin text-primary" aria-hidden="true" />}
        </div>

        {/* ============ Mappa ============ */}
        {view === "map" && (
          <div
            className="brutalist-border shadow-brutalist overflow-hidden relative"
            style={{ height: "min(600px, calc(100dvh - 220px))", minHeight: "420px" }}
          >
            <Suspense fallback={<MapFallback height="100%" />}>
              <LazyMap
                center={[41.8719, 12.5674]}
                zoom={6}
                markers={mapMarkers}
                scrollWheelZoom={true}
                height="100%"
                userLocation={userPos}
              />
            </Suspense>
            {refreshing && (
              <div className="pointer-events-none absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-[500]">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            )}
            {filtered.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-[500]">
                <div className="pointer-events-auto bg-background/95 brutalist-border shadow-brutalist px-6 py-5 max-w-sm text-center">
                  <p className="font-body text-sm text-foreground mb-3">
                    Nessuna realtà corrisponde ai filtri impostati.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.15em] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    <X size={12} /> Reimposta filtri
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ Lista ============ */}
        {view === "list" && (
          <div className="relative">
            {refreshing && (
              <div className="pointer-events-none absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-start justify-center z-30 pt-10">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => {
                const cat = getCategory(r.type, r.status);
                const cfg = categoryConfig[cat];
                const Icon = cfg.icon;
                return (
                  <Link to={`/realta/${r.id}`} key={r.id} className="group brutalist-card p-6 block">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] font-bold px-2.5 py-1 rounded-full border ${cfg.badgeClass}`}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                      <span className="text-xs text-foreground/60">
                        {r.year_founded}{r.year_closed ? ` – ${r.year_closed}` : r.status === "attivo" ? " – oggi" : ""}
                      </span>
                    </div>
                    <h3 className="text-xl leading-tight tracking-tight mb-2 group-hover:text-primary transition-colors" style={{ fontVariationSettings: "'wght' 600" }}>{r.name}</h3>
                    {((r.categories && r.categories.length > 0) || r.category) && (
                      <p className="micro-label text-primary mb-2">
                        {(r.categories && r.categories.length > 0 ? r.categories : [r.category!]).join(" · ")}
                      </p>
                    )}
                    <p className="text-sm text-foreground/80 flex items-center gap-1 mb-3">
                      <MapPin size={13} /> {r.city}, {r.region}
                      {userPos && (
                        <span className="ml-auto text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-0.5 brutalist-border bg-secondary">
                          {Math.round(distanceKm(userPos, { lat: r.lat, lng: r.lng }))} km
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">{r.description}</p>
                    <span className="inline-flex items-center gap-1 mt-4 text-primary text-xs uppercase tracking-[0.15em] font-bold group-hover:gap-2 transition-all">
                      {t("home.discover")} <ArrowRight size={14} />
                    </span>
                  </Link>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-foreground/60">
                  {t("map.empty")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mappatura;
