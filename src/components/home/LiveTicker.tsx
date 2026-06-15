import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TickerRow {
  name: string;
  city: string;
  region: string;
  category: string | null;
  year_founded: number;
  lat: number;
  lng: number;
  slug?: string | null;
}

// City → (lat, lng) coarse fallback if DB row lacks coords
const CITY_COORDS: Record<string, [number, number]> = {
  Milano:   [45.46,  9.19],
  Torino:   [45.07,  7.69],
  Bologna:  [44.49, 11.34],
  Roma:     [41.89, 12.49],
  Firenze:  [43.77, 11.25],
  Palermo:  [38.11, 13.36],
  Matera:   [40.66, 16.60],
  Bolzano:  [46.49, 11.35],
  Como:     [45.81,  9.08],
  Napoli:   [40.85, 14.27],
  Venezia:  [45.44, 12.32],
  Genova:   [44.41,  8.93],
  Bari:     [41.12, 16.87],
  Cagliari: [39.22,  9.11],
  Catania:  [37.50, 15.08],
};

const FALLBACK: TickerRow[] = [
  { name: "Macao",                   city: "Milano",   region: "Lombardia",      category: "Centro culturale",    year_founded: 2012, lat: 45.46, lng: 9.19 },
  { name: "Cripta747",               city: "Torino",   region: "Piemonte",       category: "Spazio indipendente", year_founded: 2008, lat: 45.07, lng: 7.69 },
  { name: "Lokomotiv.Klub",          city: "Bologna",  region: "Emilia-Romagna", category: "Collettivo",          year_founded: 2014, lat: 44.49, lng: 11.34 },
  { name: "Spazio In Situ",          city: "Roma",     region: "Lazio",          category: "Atelier collettivo",  year_founded: 2017, lat: 41.89, lng: 12.49 },
  { name: "Numero Cromatico",        city: "Roma",     region: "Lazio",          category: "Editore d'arte",      year_founded: 2011, lat: 41.92, lng: 12.51 },
  { name: "FuturDome",               city: "Milano",   region: "Lombardia",      category: "Casa museo",          year_founded: 2015, lat: 45.50, lng: 9.20 },
  { name: "Sotterraneo",             city: "Firenze",  region: "Toscana",        category: "Compagnia teatrale",  year_founded: 2005, lat: 43.77, lng: 11.25 },
  { name: "Studio La Stanza",        city: "Palermo",  region: "Sicilia",        category: "Atelier",             year_founded: 2019, lat: 38.11, lng: 13.36 },
  { name: "Locale Due",              city: "Bologna",  region: "Emilia-Romagna", category: "Project space",       year_founded: 2018, lat: 44.49, lng: 11.34 },
  { name: "Fondazione SoutHeritage", city: "Matera",   region: "Basilicata",     category: "Fondazione",          year_founded: 2003, lat: 40.66, lng: 16.60 },
  { name: "Standards",               city: "Milano",   region: "Lombardia",      category: "Project space",       year_founded: 2020, lat: 45.48, lng: 9.18 },
  { name: "Almanac",                 city: "Torino",   region: "Piemonte",       category: "Spazio non-profit",   year_founded: 2014, lat: 45.07, lng: 7.69 },
  { name: "Diorama",                 city: "Bolzano",  region: "Trentino-AA",    category: "Project space",       year_founded: 2021, lat: 46.49, lng: 11.35 },
  { name: "Quartz Studio",           city: "Torino",   region: "Piemonte",       category: "Vetrina",             year_founded: 2010, lat: 45.07, lng: 7.69 },
  { name: "Manifattura Tabacchi",    city: "Firenze",  region: "Toscana",        category: "Hub culturale",       year_founded: 2018, lat: 43.79, lng: 11.20 },
  { name: "L'ascensore",             city: "Palermo",  region: "Sicilia",        category: "Project space",       year_founded: 2016, lat: 38.11, lng: 13.36 },
  { name: "Ramo",                    city: "Como",     region: "Lombardia",      category: "Spazio sperimentale", year_founded: 2020, lat: 45.81, lng: 9.08 },
  { name: "Riverberi",               city: "Napoli",   region: "Campania",       category: "Collettivo",          year_founded: 2019, lat: 40.85, lng: 14.27 },
  { name: "Spazio Y",                city: "Roma",     region: "Lazio",          category: "Spazio indipendente", year_founded: 2013, lat: 41.90, lng: 12.49 },
  { name: "BAM!",                    city: "Bologna",  region: "Emilia-Romagna", category: "Festival",            year_founded: 2007, lat: 44.49, lng: 11.34 },
];

// Italy bounding box
const LAT_MAX = 47.1, LAT_MIN = 36.5, LNG_MIN = 6.6, LNG_MAX = 18.6;

// SVG viewBox dimensions
const VB_W = 220;
const VB_H = 340;

const project = (lat: number, lng: number): [number, number] => {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VB_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VB_H;
  return [x, y];
};

// Coarse boot mask: each "#" is a 10×10 grid cell that belongs to Italy.
// Rendered as small dots → arcade dot-matrix Italy.
const MASK = [
  "...........###......",
  "..........#####.....",
  ".........#######....",
  "....############....",
  "...##############...",
  "..###############...",
  "...##############...",
  "....############....",
  ".....##########.....",
  "......########......",
  ".......#######......",
  "........######......",
  ".........######.....",
  "..........######....",
  "...........######...",
  "............######..",
  ".............######.",
  "..............#####.",
  "..............#####.",
  ".............######.",
  "............#######.",
  "...........#####....",
  "#..........####.....",
  "##........####......",
  "###......###........",
  ".###................",
];

const MASK_COLS = MASK[0].length; // 20
const MASK_ROWS = MASK.length;    // 26

const LiveTicker = () => {
  const { data } = useQuery({
    queryKey: ["home-radar"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<TickerRow[]> => {
      const { data, error } = await supabase
        .from("realities")
        .select("name, city, region, category, year_founded, lat, lng, slug")
        .eq("confirmed_status", "confermato")
        .order("created_at", { ascending: false })
        .limit(40);
      if (error || !data || data.length === 0) return FALLBACK;
      return (data as any[]).map((r) => {
        let lat = r.lat as number | null;
        let lng = r.lng as number | null;
        if ((!lat || !lng) && r.city && CITY_COORDS[r.city]) {
          [lat, lng] = CITY_COORDS[r.city];
        }
        return {
          name: r.name,
          city: r.city,
          region: r.region,
          category: r.category,
          year_founded: r.year_founded,
          lat: lat ?? 42,
          lng: lng ?? 12.5,
          slug: r.slug,
        } as TickerRow;
      });
    },
  });

  const rows = data && data.length > 0 ? data : FALLBACK;

  // dot-matrix Italy points
  const matrixDots = useMemo(() => {
    const dots: { x: number; y: number }[] = [];
    const cellW = VB_W / MASK_COLS;
    const cellH = VB_H / MASK_ROWS;
    for (let r = 0; r < MASK_ROWS; r++) {
      for (let c = 0; c < MASK_COLS; c++) {
        if (MASK[r][c] === "#") {
          dots.push({ x: c * cellW + cellW / 2, y: r * cellH + cellH / 2 });
        }
      }
    }
    return dots;
  }, []);

  // pin positions
  const pins = useMemo(
    () => rows.map((r) => {
      const [x, y] = project(r.lat, r.lng);
      return { x, y, row: r };
    }),
    [rows]
  );

  // Active index — auto-rotates, pauses on hover
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = window.setInterval(() => {
      setActive((i) => (i + 1) % rows.length);
    }, 2400);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused, rows.length]);

  const current = pins[active];
  const total = rows.length;
  const scanLabel = `${(active + 1).toString().padStart(3, "0")} / ${total.toString().padStart(3, "0")}`;

  return (
    <div
      className="relative h-full min-h-[480px] brutalist-border bg-foreground shadow-brutalist-lg overflow-hidden flex flex-col select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Arcade header */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-background/20 font-mono text-[10px] tracking-[0.15em] uppercase">
        <div className="flex items-center gap-2 text-secondary">
          <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          RADAR · IT
        </div>
        <span className="text-background/60">SCAN {scanLabel}</span>
      </div>

      {/* Radar surface */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-3 overflow-hidden">
        {/* CRT scanlines overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px)",
          }}
          aria-hidden
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, hsl(var(--foreground)) 100%)",
          }}
          aria-hidden
        />

        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="relative h-full w-auto max-h-[340px]"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--secondary) / 0.35))" }}
        >
          <defs>
            <linearGradient id="scanGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--secondary))" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="pingGrad">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.55" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Crosshair frame */}
          <g stroke="hsl(var(--background) / 0.18)" strokeWidth="0.6" fill="none">
            <line x1="0" y1={VB_H / 2} x2={VB_W} y2={VB_H / 2} strokeDasharray="2 4" />
            <line x1={VB_W / 2} y1="0" x2={VB_W / 2} y2={VB_H} strokeDasharray="2 4" />
            <rect x="2" y="2" width={VB_W - 4} height={VB_H - 4} stroke="hsl(var(--background) / 0.3)" />
          </g>

          {/* Italy dot-matrix */}
          <g fill="hsl(var(--background) / 0.35)">
            {matrixDots.map((d, i) => (
              <rect key={i} x={d.x - 1.2} y={d.y - 1.2} width="2.4" height="2.4" />
            ))}
          </g>

          {/* Sweeping scan band */}
          <rect
            x="0"
            width={VB_W}
            height={VB_H * 0.18}
            fill="url(#scanGrad)"
            style={{ animation: paused ? "none" : "radar-sweep 6s linear infinite" }}
          />

          {/* Pins */}
          {pins.map((p, i) => {
            const isActive = i === active;
            return (
              <g
                key={i}
                onMouseEnter={() => setActive(i)}
                style={{ cursor: "pointer" }}
              >
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="16"
                    fill="url(#pingGrad)"
                    style={{ animation: "radar-ping 1.6s ease-out infinite" }}
                  />
                )}
                <rect
                  x={p.x - (isActive ? 3 : 1.5)}
                  y={p.y - (isActive ? 3 : 1.5)}
                  width={isActive ? 6 : 3}
                  height={isActive ? 6 : 3}
                  fill={isActive ? "hsl(var(--secondary))" : "hsl(var(--background) / 0.75)"}
                  style={
                    isActive
                      ? { filter: "drop-shadow(0 0 4px hsl(var(--secondary)))" }
                      : undefined
                  }
                />
                {isActive && (
                  <>
                    <line x1={p.x - 9} y1={p.y} x2={p.x - 5} y2={p.y} stroke="hsl(var(--secondary))" strokeWidth="1" />
                    <line x1={p.x + 5} y1={p.y} x2={p.x + 9} y2={p.y} stroke="hsl(var(--secondary))" strokeWidth="1" />
                    <line x1={p.x} y1={p.y - 9} x2={p.x} y2={p.y - 5} stroke="hsl(var(--secondary))" strokeWidth="1" />
                    <line x1={p.x} y1={p.y + 5} x2={p.x} y2={p.y + 9} stroke="hsl(var(--secondary))" strokeWidth="1" />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating arcade info card for active pin */}
        {current && (
          <div className="absolute left-3 right-3 bottom-3 pointer-events-auto">
            <div className="bg-background brutalist-border p-3 shadow-brutalist-aqua">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-primary mb-1">
                <span>► TARGET</span>
                <span className="text-muted-foreground">
                  {current.row.lat.toFixed(2)}°N · {current.row.lng.toFixed(2)}°E
                </span>
              </div>
              <div
                className="text-lg md:text-xl uppercase leading-none truncate"
                style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.01em" }}
                title={current.row.name}
              >
                {current.row.slug ? (
                  <Link to={`/realta/${current.row.slug}`} className="hover:text-primary transition-colors">
                    {current.row.name}
                  </Link>
                ) : (
                  current.row.name
                )}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground truncate">
                {current.row.city} · {current.row.region} · {current.row.category ?? "—"} · EST. {current.row.year_founded}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Arcade footer / score */}
      <div className="flex items-stretch border-t-2 border-background/20 font-mono text-[10px] uppercase tracking-[0.15em] divide-x-2 divide-background/20">
        <div className="flex-1 px-3 py-2 text-background/60">
          REC <span className="text-background" style={{ fontVariationSettings: "'wght' 700" }}>{total.toString().padStart(3, "0")}</span>
        </div>
        <div className="flex-1 px-3 py-2 text-background/60">
          {paused ? <span className="text-secondary">▣ PAUSED</span> : <span className="text-secondary">► LIVE</span>}
        </div>
        <div className="flex-1 px-3 py-2 text-background/60 text-right">
          MMXXVI
        </div>
      </div>

      <style>{`
        @keyframes radar-sweep {
          0%   { transform: translateY(-${VB_H * 0.2}px); }
          100% { transform: translateY(${VB_H}px); }
        }
        @keyframes radar-ping {
          0%   { r: 3;  opacity: 0.9; }
          100% { r: 22; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LiveTicker;
export { FALLBACK };
export type { TickerRow };
