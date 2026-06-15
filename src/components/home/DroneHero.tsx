import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ITALY_PATH, ITALY_VB } from "./italyPath";

/**
 * DroneHero — POV satellite/drone fisso al centro. L'Italia
 * (vettoriale) ruota e scorre sotto. I pin sono SOLO realtà reali
 * confermate nel database e dotate di coordinate.
 */

interface Pin {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  categories: string[];
  year_founded: number | null;
  slug: string | null;
  lat: number;
  lng: number;
  x: number;
  y: number;
}

const { W: VB_W, H: VB_H, LAT_MAX, LAT_MIN, LNG_MIN, LNG_MAX } = ITALY_VB;

const project = (lat: number, lng: number): [number, number] => [
  ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VB_W,
  ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VB_H,
];

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const DroneHero = () => {
  const navigate = useNavigate();

  const { data: pins = [], isLoading } = useQuery({
    queryKey: ["drone-hero-pins"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Pin[]> => {
      const { data, error } = await supabase
        .from("realities")
        .select("id, name, city, region, category, categories, year_founded, slug, lat, lng")
        .eq("confirmed_status", "confermato")
        .not("lat", "is", null)
        .not("lng", "is", null)
        .order("created_at", { ascending: false })
        .limit(80);
      if (error || !data) return [];
      return (data as any[])
        .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
        .map((r) => {
          const [x, y] = project(r.lat, r.lng);
          const cats: string[] =
            Array.isArray(r.categories) && r.categories.length > 0
              ? r.categories
              : (r.category ? [r.category] : []);
          return {
            id: r.id, name: r.name, city: r.city, region: r.region,
            categories: cats, year_founded: r.year_founded,
            slug: r.slug, lat: r.lat, lng: r.lng, x, y,
          } as Pin;
        });
    },
  });

  // ===== animation refs =====
  const tx = useRef(VB_W / 2);
  const ty = useRef(VB_H / 2);
  const rot = useRef(0);
  const fromX = useRef(VB_W / 2);
  const fromY = useRef(VB_H / 2);
  const fromRot = useRef(0);
  const toX = useRef(VB_W / 2);
  const toY = useRef(VB_H / 2);
  const toRot = useRef(0);
  const segStart = useRef<number>(0);
  const segDur = useRef<number>(4200);
  const dwellUntil = useRef<number>(0);
  const pickedRef = useRef<number>(-1);
  const baseRotStart = useRef<number>(0);

  const [, force] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  // measure panel
  const panelRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState({ w: 1200, h: 700 });
  useEffect(() => {
    if (!panelRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setPanel({ w: Math.max(320, cr.width), h: Math.max(360, cr.height) });
    });
    ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, []);

  // bootstrap first target when pins arrive
  useEffect(() => {
    if (pins.length === 0) return;
    const i = Math.floor(Math.random() * pins.length);
    pickedRef.current = i;
    fromX.current = tx.current;
    fromY.current = ty.current;
    fromRot.current = rot.current;
    toX.current = pins[i].x;
    toY.current = pins[i].y;
    toRot.current = (Math.random() - 0.5) * 30;
    segStart.current = performance.now();
    baseRotStart.current = performance.now();
    segDur.current = 4200;
    setActiveIdx(null);
  }, [pins.length]);

  // single rAF loop (no React-state deps → never tears down)
  const pinsRef = useRef<Pin[]>(pins);
  const pausedRef = useRef(false);
  const activeIdxRef = useRef<number | null>(null);
  useEffect(() => { pinsRef.current = pins; }, [pins]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { activeIdxRef.current = activeIdx; }, [activeIdx]);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const ps = pinsRef.current;
      if (ps.length === 0) { force((n) => (n + 1) & 1023); return; }
      if (pausedRef.current) { force((n) => (n + 1) & 1023); return; }

      const elapsed = now - segStart.current;
      const t = Math.min(1, elapsed / segDur.current);
      const e = easeInOutCubic(t);
      tx.current = fromX.current + (toX.current - fromX.current) * e;
      ty.current = fromY.current + (toY.current - fromY.current) * e;
      // base slow continuous drift on top of segment rot
      const drift = Math.sin((now - baseRotStart.current) / 4200) * 4;
      rot.current = fromRot.current + (toRot.current - fromRot.current) * e + drift;

      if (t >= 1) {
        if (activeIdxRef.current !== pickedRef.current) {
          setActiveIdx(pickedRef.current);
          dwellUntil.current = now + 2000;
        } else if (now >= dwellUntil.current) {
          let next = pickedRef.current;
          if (ps.length > 1) {
            while (next === pickedRef.current) next = Math.floor(Math.random() * ps.length);
          }
          pickedRef.current = next;
          fromX.current = tx.current;
          fromY.current = ty.current;
          fromRot.current = rot.current - drift; // remove drift from baseline
          toX.current = ps[next].x;
          toY.current = ps[next].y;
          toRot.current = fromRot.current + (Math.random() - 0.5) * 55;
          segStart.current = now;
          segDur.current = 3500 + Math.random() * 2200;
          setActiveIdx(null);
        }
      }
      force((n) => (n + 1) & 1023);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cx = panel.w / 2;
  const cy = panel.h / 2;
  const scale = Math.min((panel.h * 1.05) / VB_H, (panel.w * 0.95) / VB_W);
  const groupTransform = `translate(${cx} ${cy}) rotate(${rot.current.toFixed(2)}) scale(${scale.toFixed(3)}) translate(${(-tx.current).toFixed(2)} ${(-ty.current).toFixed(2)})`;

  const active = activeIdx !== null ? pins[activeIdx] : null;
  const total = pins.length;
  const scanLabel = activeIdx !== null
    ? `${(activeIdx + 1).toString().padStart(3, "0")} / ${total.toString().padStart(3, "0")}`
    : `--- / ${total.toString().padStart(3, "0")}`;

  return (
    <div
      ref={panelRef}
      className="relative w-full h-[88vh] min-h-[600px] max-h-[920px] bg-foreground text-background overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <svg
        viewBox={`0 0 ${panel.w} ${panel.h}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="dh-ping">
            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.65" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dh-vignette" cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="1" />
          </radialGradient>
          <pattern id="dh-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--background) / 0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* grid sfondo */}
        <rect x="0" y="0" width={panel.w} height={panel.h} fill="url(#dh-grid)" />

        {/* layer terra: tutto qui ruota/trasla */}
        <g transform={groupTransform}>
          {/* Italia vettoriale — outline colorato, fill = sfondo (trasparente) */}
          <path
            d={ITALY_PATH}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={1.1 / scale}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--secondary) / 0.45))" }}
          />
          {/* alone esterno tenue */}
          <path
            d={ITALY_PATH}
            fill="none"
            stroke="hsl(var(--secondary) / 0.18)"
            strokeWidth={5 / scale}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* pins */}
          {pins.map((p, i) => {
            const isActive = i === activeIdx;
            return (
              <g
                key={p.id}
                onClick={() => p.slug && navigate(`/realta/${p.slug}`)}
                style={{ cursor: p.slug ? "pointer" : "default" }}
              >
                {isActive && (
                  <circle cx={p.x} cy={p.y} r="14" fill="url(#dh-ping)"
                    style={{ animation: "dh-ping 1.6s ease-out infinite" }} />
                )}
                <circle
                  cx={p.x} cy={p.y}
                  r={isActive ? 2.4 : 1.3}
                  fill={isActive ? "hsl(var(--secondary))" : "hsl(var(--background))"}
                  stroke={isActive ? "hsl(var(--background))" : "none"}
                  strokeWidth={0.5}
                  style={isActive ? { filter: "drop-shadow(0 0 4px hsl(var(--secondary)))" } : undefined}
                />
              </g>
            );
          })}
        </g>

        {/* vignettatura */}
        <rect x="0" y="0" width={panel.w} height={panel.h} fill="url(#dh-vignette)" pointerEvents="none" />

        {/* mirino fisso */}
        <g stroke="hsl(var(--secondary))" strokeWidth="1" fill="none" pointerEvents="none">
          <circle cx={cx} cy={cy} r="38" strokeOpacity="0.55" />
          <circle cx={cx} cy={cy} r="68" strokeOpacity="0.22" strokeDasharray="4 6" />
          <line x1={cx - 56} y1={cy} x2={cx - 14} y2={cy} />
          <line x1={cx + 14} y1={cy} x2={cx + 56} y2={cy} />
          <line x1={cx} y1={cy - 56} x2={cx} y2={cy - 14} />
          <line x1={cx} y1={cy + 14} x2={cx} y2={cy + 56} />
          <circle cx={cx} cy={cy} r="2" fill="hsl(var(--secondary))" />
        </g>
      </svg>

      {/* scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 3px)",
        }}
        aria-hidden
      />

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 md:px-8 py-4 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2 text-secondary">
          <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          Drone · IT · Live
        </div>
        <div className="text-background/70">ALT 412KM · SCAN {scanLabel}</div>
        <div className="text-background/70 hidden md:block">MMXXVI</div>
      </div>

      {/* manifesto */}
      <div className="absolute left-5 md:left-8 bottom-6 md:bottom-10 max-w-[520px] space-y-4 pointer-events-none">
        <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] pointer-events-auto">
          <span className="w-1.5 h-1.5 bg-secondary-foreground rounded-full" />
          Archivio Editoriale · Vol. 01
        </div>
        <h1
          className="text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight"
          style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.03em" }}
        >
          Il Bel
          <br />
          <span className="text-secondary">Paese</span>
        </h1>
        <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.15em] text-background/70 max-w-md">
          Sorvoliamo l'Italia. Pin per pin, atelier per atelier.
        </p>
        <div className="flex flex-wrap gap-3 pointer-events-auto pt-2">
          <Link
            to="/mappatura"
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] border-2 border-secondary hover:bg-background hover:text-foreground hover:border-background transition-colors"
          >
            Entra nella mappa <ArrowRight size={14} />
          </Link>
          <Link
            to="/la-rete"
            className="inline-flex items-center gap-2 bg-transparent text-background px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] border-2 border-background/40 hover:border-background transition-colors"
          >
            La rete
          </Link>
        </div>
      </div>

      {/* target card */}
      <div className="absolute right-5 md:right-8 bottom-6 md:bottom-10 w-[280px] md:w-[320px] pointer-events-auto">
        <div className="bg-background text-foreground brutalist-border p-3 shadow-brutalist-aqua min-h-[110px]">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-primary mb-1">
            <span>{active ? "► TARGET LOCK" : "► SCANNING…"}</span>
            <span className="text-muted-foreground">
              {active ? `${active.lat.toFixed(2)}°N · ${active.lng.toFixed(2)}°E` : "--.--° · --.--°"}
            </span>
          </div>
          {active ? (
            <>
              <div
                className="text-lg md:text-xl uppercase leading-none truncate"
                style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.01em" }}
                title={active.name}
              >
                {active.slug ? (
                  <Link to={`/realta/${active.slug}`} className="hover:text-primary transition-colors">
                    {active.name}
                  </Link>
                ) : active.name}
              </div>
              <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground truncate">
                {active.city ?? "—"}
                {active.region ? ` · ${active.region}` : ""}
                {active.categories.length > 0 ? ` · ${active.categories.join(" · ")}` : ""}
                {active.year_founded ? ` · EST. ${active.year_founded}` : ""}
              </div>
            </>
          ) : (
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              {isLoading
                ? "Inizializzazione satellite…"
                : total === 0
                ? "Nessuna realtà mappata al momento."
                : "Avvicinamento al prossimo target…"}
            </div>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-background/60">
          <span>{paused ? "▣ PAUSED" : "► LIVE"}</span>
          <span>{total} REC</span>
        </div>
      </div>

      <style>{`
        @keyframes dh-ping {
          0%   { r: 3;  opacity: 0.9; }
          100% { r: 22; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DroneHero;
