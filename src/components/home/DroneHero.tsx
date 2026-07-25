import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EUROPE_PATH, EUROPE_VB, projectLatLng } from "./europePath";
import { supabase } from "@/integrations/supabase/client";
import LogoPittogramma from "@/components/LogoPittogramma";

/**
 * DroneHero — hero editoriale con mappa vettoriale dell'Europa.
 * Desktop: il razzo segue il cursore, la mappa fa parallax.
 * Mobile/touch: il razzo vola in autoplay tra le realtà mappate (fetch dal DB),
 * rallenta e si ferma un istante su ciascuna mostrando il nome.
 *
 * Performance: tutti gli update per-frame passano da ref imperativi.
 * React ri-renderizza solo per resize, rotating word, hovering,
 * isTouchDevice e activeIdx (cambio waypoint ~ogni 4s, non per frame).
 */

const { W: VB_W, H: VB_H } = EUROPE_VB;

const ROTATING_WORDS = [
  "spazi indipendenti",
  "artist-run spaces",
  "collettivi curatoriali",
  "hybrid spaces",
  "realtà autogestite",
  "siti non-profit",
  "luoghi di ricerca",
  "reti locali",
  "residenze",
  
];

const PIEMONTE = { x: 0.475, y: 0.655 };
const ZOOM = 4.2;
const ZOOM_MOBILE = 9.5;

type Waypoint = { id: string; x: number; y: number; name: string; city?: string; region?: string };

// Fallback curato: usato se il fetch fallisce o non ci sono ancora realtà.
const FALLBACK_ROUTE: Waypoint[] = [
  { id: "f-torino", x: 0.475, y: 0.655, name: "Torino" },
  { id: "f-milano", x: 0.495, y: 0.650, name: "Milano" },
  { id: "f-venezia", x: 0.525, y: 0.660, name: "Venezia" },
  { id: "f-bologna", x: 0.515, y: 0.685, name: "Bologna" },
  { id: "f-firenze", x: 0.520, y: 0.710, name: "Firenze" },
  { id: "f-roma", x: 0.540, y: 0.750, name: "Roma" },
  { id: "f-napoli", x: 0.555, y: 0.780, name: "Napoli" },
  { id: "f-bari", x: 0.560, y: 0.780, name: "Bari" },
  { id: "f-palermo", x: 0.555, y: 0.840, name: "Palermo" },
  { id: "f-cagliari", x: 0.500, y: 0.830, name: "Cagliari" },
];

/**
 * Ordina i waypoint con nearest-neighbor + randomizzazione leggera:
 * parte da un punto casuale, ad ogni passo sceglie uno dei 3 più vicini
 * non ancora visitati. Percorso coerente ma diverso ogni sessione.
 */
function orderNearestNeighbor(points: Waypoint[]): Waypoint[] {
  if (points.length <= 1) return points.slice();
  const remaining = points.slice();
  const startIdx = Math.floor(Math.random() * remaining.length);
  const ordered: Waypoint[] = [remaining.splice(startIdx, 1)[0]];
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    const withDist = remaining
      .map((p, i) => ({ i, d: Math.hypot(p.x - last.x, p.y - last.y) }))
      .sort((a, b) => a.d - b.d);
    const pool = withDist.slice(0, Math.min(3, withDist.length));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    ordered.push(remaining.splice(pick.i, 1)[0]);
  }
  return ordered;
}

/**
 * Deduplica realtà molto vicine (< ~10km in coordinate normalizzate):
 * tiene la prima e concatena i nomi separati da " · ".
 */
function dedupeNearby(points: Waypoint[]): Waypoint[] {
  const EPS = 0.005;
  const out: Waypoint[] = [];
  for (const p of points) {
    const near = out.find((q) => Math.hypot(q.x - p.x, q.y - p.y) < EPS);
    if (near) {
      near.name = `${near.name} · ${p.name}`;
    } else {
      out.push({ ...p });
    }
  }
  return out;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;


const DroneHero = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: PIEMONTE.x, y: PIEMONTE.y });
  const current = useRef({ x: PIEMONTE.x, y: PIEMONTE.y });
  const cursor = useRef({ x: 0, y: 0, svx: 0, svy: 0, lastX: 0, lastY: 0, angle: -45 });
  const lastTarget = useRef({ x: PIEMONTE.x, y: PIEMONTE.y });
  const panelSize = useRef({ w: 1200, h: 700 });
  const phaseRef = useRef<"travel" | "dwell">("travel");

  const [panel, setPanel] = useState({ w: 1200, h: 700 });
  const [hovering, setHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!panelRef.current || isVisible) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    io.observe(panelRef.current);
    return () => io.disconnect();
  }, [isVisible]);

  // Fetch delle realtà confermate per costruire la rotta reale.
  const { data: realities } = useQuery({
    queryKey: ["drone-waypoints"],
    staleTime: 10 * 60_000,
    enabled: isVisible && !reducedMotion,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("realities")
        .select("id, name, lat, lng, city, region")
        .eq("confirmed_status", "confermato");
      if (error || !data) return [] as { id: string; name: string; lat: number; lng: number; city: string | null; region: string | null }[];
      return data;
    },
  });

  // Ordinamento nearest-neighbor + dedup, memoizzato: cambia solo quando
  // arrivano dati nuovi. La randomizzazione è fissata per la sessione.
  const route = useMemo<Waypoint[]>(() => {
    if (reducedMotion) {
      return [{ id: "static-piemonte", ...PIEMONTE, name: "Piemonte" }];
    }
    const raw: Waypoint[] = (realities ?? [])
      .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng))
      .map((r) => {
        const { x, y } = projectLatLng(r.lat, r.lng);
        return { id: r.id, x, y, name: r.name, city: r.city ?? undefined, region: (r as any).region ?? undefined };
      });
    const source = raw.length >= 3 ? raw : FALLBACK_ROUTE;
    return orderNearestNeighbor(dedupeNearby(source));
  }, [realities, reducedMotion]);


  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mqTouch = window.matchMedia("(hover: none) and (pointer: coarse)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => {
      setIsTouchDevice(mqTouch.matches);
      setReducedMotion(mqReduce.matches);
    };
    upd();
    mqTouch.addEventListener?.("change", upd);
    mqReduce.addEventListener?.("change", upd);
    return () => {
      mqTouch.removeEventListener?.("change", upd);
      mqReduce.removeEventListener?.("change", upd);
    };
  }, []);

  useEffect(() => {
    if (!panelRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(320, cr.width);
      const h = Math.max(360, cr.height);
      panelSize.current = { w, h };
      setPanel({ w, h });
    });
    ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (isTouchDevice) setHovering(true);
  }, [isTouchDevice]);

  const applyMapTransform = () => {
    const g = mapGroupRef.current;
    if (!g) return;
    const { w, h } = panelSize.current;
    const cx = w / 2;
    const cy = h / 2;
    const fit = Math.min(h / VB_H, w / VB_W);
    const scale = fit * (isTouchDevice ? ZOOM_MOBILE : ZOOM);
    const fx = current.current.x * VB_W;
    const fy = current.current.y * VB_H;
    const tiltDeg = (current.current.x - 0.5) * 3;
    g.setAttribute(
      "transform",
      `translate(${cx} ${cy}) rotate(${tiltDeg.toFixed(2)}) scale(${scale.toFixed(3)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`,
    );
  };

  const applyRocketTransform = () => {
    const el = rocketRef.current;
    if (!el) return;
    const c = cursor.current;
    el.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${c.angle.toFixed(1)}deg)`;
  };

  useLayoutEffect(() => {
    applyMapTransform();
    applyRocketTransform();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel.w, panel.h]);

  // Main rAF loop — imperativo, con pausa su visibility/intersection
  useEffect(() => {
    if (reducedMotion) {
      current.current.x = PIEMONTE.x;
      current.current.y = PIEMONTE.y;
      applyMapTransform();
      return;
    }

    let raf = 0;
    let running = false;
    let visible = true;
    let intersecting = true;
    let t0 = performance.now();
    let lastFrame = 0;
    const minFrameMs = isTouchDevice ? 22 : 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      if (minFrameMs && now - lastFrame < minFrameMs) return;
      lastFrame = now;

      const t = (now - t0) / 1000;
      current.current.x += (target.current.x - current.current.x) * 0.07;
      current.current.y += (target.current.y - current.current.y) * 0.07;

      const c = cursor.current;
      const { w, h } = panelSize.current;

      if (isTouchDevice) {
        const cx = w / 2;
        const cy = h / 2;
        c.x = cx + Math.sin(t * 0.9) * 6;
        c.y = cy + Math.cos(t * 1.1) * 5;

        const dtx = (target.current.x - lastTarget.current.x) * w * 40;
        const dty = (target.current.y - lastTarget.current.y) * h * 40;
        lastTarget.current.x = target.current.x;
        lastTarget.current.y = target.current.y;
        c.svx += (dtx - c.svx) * 0.28;
        c.svy += (dty - c.svy) * 0.28;
        // Ruota SOLO durante il viaggio. In sosta (dwell) resta fermo,
        // con la sola micro-oscillazione: sembra che stia osservando la tappa.
        if (phaseRef.current === "travel") {
          const speed = Math.hypot(c.svx, c.svy);
          if (speed > 0.6) {
            const targetAngle = (Math.atan2(c.svy, c.svx) * 180) / Math.PI + 45;
            const diff = ((targetAngle - c.angle + 540) % 360) - 180;
            const ease = Math.min(0.28, 0.08 + speed * 0.012);
            c.angle += diff * ease;
          }
        }
      } else {
        const dx = c.x - c.lastX;
        const dy = c.y - c.lastY;
        c.lastX = c.x;
        c.lastY = c.y;
        c.svx += (dx - c.svx) * 0.28;
        c.svy += (dy - c.svy) * 0.28;
        const speed = Math.hypot(c.svx, c.svy);
        if (speed > 0.6) {
          const targetAngle = (Math.atan2(c.svy, c.svx) * 180) / Math.PI + 45;
          const diff = ((targetAngle - c.angle + 540) % 360) - 180;
          const ease = Math.min(0.32, 0.10 + speed * 0.015);
          c.angle += diff * ease;
        }
      }

      applyMapTransform();
      applyRocketTransform();
    };

    const start = () => {
      if (running) return;
      running = true;
      t0 = performance.now();
      lastFrame = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    const evaluate = () => {
      if (visible && intersecting) start();
      else stop();
    };

    const onVis = () => {
      visible = document.visibilityState === "visible";
      evaluate();
    };
    document.addEventListener("visibilitychange", onVis);

    let io: IntersectionObserver | null = null;
    if (panelRef.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          intersecting = entries[0]?.isIntersecting ?? true;
          evaluate();
        },
        { threshold: 0 },
      );
      io.observe(panelRef.current);
    }

    evaluate();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, [isTouchDevice, reducedMotion]);

  // Autoplay dei waypoint (touch device only) — volo con micro-pause su ogni realtà
  useEffect(() => {
    if (!isTouchDevice || reducedMotion) return;
    if (!route.length) return;

    let raf = 0;
    let running = false;
    let visible = true;
    let intersecting = true;
    let idx = 0;
    let phase: "travel" | "dwell" = "travel";
    phaseRef.current = "travel";
    let phaseStart = performance.now();
    let from = { x: target.current.x, y: target.current.y };
    let to = route[0];
    let travelDur = 3000;
    let dwellDur = 1100;

    setActiveIdx(-1);

    const nextLeg = (now: number) => {
      from = { x: to.x, y: to.y };
      idx = (idx + 1) % route.length;
      to = route[idx];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      const jitter = 0.85 + Math.random() * 0.3;
      // Volo lento e curato: 2.5-5s a leg su distanze italiane tipiche.
      travelDur = (2200 + dist * 6800) * jitter;
      dwellDur = 900 + Math.random() * 500;
      phase = "travel";
      phaseRef.current = "travel";
      phaseStart = now;
      setActiveIdx(-1);
    };

    const step = () => {
      raf = requestAnimationFrame(step);
      const now = performance.now();
      if (phase === "travel") {
        const t = Math.min(1, (now - phaseStart) / travelDur);
        const e = easeInOutCubic(t);
        target.current.x = from.x + (to.x - from.x) * e;
        target.current.y = from.y + (to.y - from.y) * e;
        if (t >= 1) {
          phase = "dwell";
          phaseRef.current = "dwell";
          phaseStart = now;
          // Blocca esattamente sulla tappa per stabilizzare la mappa.
          target.current.x = to.x;
          target.current.y = to.y;
          setActiveIdx(idx);
        }
      } else {
        if (now - phaseStart >= dwellDur) {
          nextLeg(now);
        }
      }
    };




    const start = () => {
      if (running) return;
      running = true;
      phaseStart = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    const evaluate = () => {
      if (visible && intersecting) start();
      else stop();
    };

    const onVis = () => {
      visible = document.visibilityState === "visible";
      evaluate();
    };
    document.addEventListener("visibilitychange", onVis);

    let io: IntersectionObserver | null = null;
    if (panelRef.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          intersecting = entries[0]?.isIntersecting ?? true;
          evaluate();
        },
        { threshold: 0 },
      );
      io.observe(panelRef.current);
    }

    evaluate();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, [isTouchDevice, reducedMotion, route]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cursor.current.x = x;
    cursor.current.y = y;
    const nx = Math.min(1, Math.max(0, x / rect.width));
    const ny = Math.min(1, Math.max(0, y / rect.height));
    target.current.x = 0.42 + nx * 0.18;
    target.current.y = 0.60 + ny * 0.22;
  };

  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % ROTATING_WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const fit0 = Math.min(panel.h / VB_H, panel.w / VB_W);
  const scale0 = fit0 * ZOOM;
  const effectiveScale = fit0 * (isTouchDevice ? ZOOM_MOBILE : ZOOM);
  const showRocket = hovering const showRocket = hovering && !(reducedMotion && isTouchDevice);const showRocket = hovering && !(reducedMotion && isTouchDevice); !reducedMotion;

  return (
    <div
      ref={panelRef}
      className="relative w-full h-[88vh] min-h-[600px] max-h-[920px] bg-foreground text-background overflow-hidden select-none"
      style={{ cursor: !isTouchDevice && hovering ? "none" : "auto" }}
      onMouseEnter={() => !isTouchDevice && setHovering(true)}
      onMouseLeave={() => {
        if (isTouchDevice) return;
        setHovering(false);
        target.current.x = PIEMONTE.x;
        target.current.y = PIEMONTE.y;
      }}
      onMouseMove={handleMove}
    >
      <svg
        viewBox={`0 0 ${panel.w} ${panel.h}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="dh-vignette" cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="1" />
          </radialGradient>
          <pattern id="dh-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--background) / 0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={panel.w} height={panel.h} fill="url(#dh-grid)" />

        <g ref={mapGroupRef} style={{ willChange: "transform" }}>
          <path
            d={EUROPE_PATH}
            fill="hsl(var(--secondary) / 0.06)"
            stroke="hsl(var(--secondary) / 0.25)"
            strokeWidth={4 / scale0}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={EUROPE_PATH}
            fill="hsl(var(--secondary) / 0.10)"
            stroke="hsl(var(--secondary))"
            strokeWidth={1 / scale0}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--secondary) / 0.45))" }}
          />

          {/* Marker realtà: pallini sempre presenti, label solo sulla tappa attiva */}
          {route.map((w, i) => {
            const active = i === activeIdx;
            const cx = w.x * VB_W;
            const cy = w.y * VB_H;
            const r = active ? 2.6 / effectiveScale : 1.6 / effectiveScale;
            const labelSize = 7 / effectiveScale;
            const labelDx = 4 / effectiveScale;
            const labelDy = -4 / effectiveScale;
            return (
              <g key={w.id} transform={`translate(${cx} ${cy})`} style={{ pointerEvents: "none" }}>
                <circle
                  r={r}
                  fill="hsl(var(--secondary))"
                  opacity={active ? 1 : isTouchDevice ? 0.45 : 0.2}
                  style={{ transition: "opacity 400ms, r 400ms" }}
                />
                {active && !isTouchDevice && (
                  <text
                    x={labelDx}
                    y={labelDy}
                    fontSize={labelSize}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={labelSize * 0.25}
                    paintOrder="stroke"
                    style={{
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      opacity: 1,
                    }}
                  >
                    {w.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>


        <rect x="0" y="0" width={panel.w} height={panel.h} fill="url(#dh-vignette)" pointerEvents="none" />
      </svg>

      <div
        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 3px)",
        }}
        aria-hidden
      />

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 md:px-8 py-4 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] pointer-events-none">
        <div className="flex items-center gap-2 text-[#8B5CFF]">
          <span className="w-2 h-2 bg-[#8B5CFF] rounded-full animate-pulse" />
          IT · Live
        </div>
      </div>

      {/* Etichetta realtà attiva — solo mobile, sfrutta lo spazio in alto della mappa */}
      {isTouchDevice && (
        <div
          className="md:hidden absolute left-1/2 -translate-x-1/2 top-12 max-w-[82%] text-center pointer-events-none z-10"
          aria-live="polite"
        >
          {route.map((w, i) => {
            const active = i === activeIdx;
            return (
              <div
                key={w.id}
                className="absolute left-1/2 -translate-x-1/2 top-0 w-max max-w-[85vw] transition-all duration-500"
                style={{
                  opacity: active ? 1 : 0,
                  transform: `translate(-50%, ${active ? "0" : "-6px"})`,
                }}
              >
                <div
                  className="uppercase text-background text-base leading-tight px-3"
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    letterSpacing: "0.08em",
                    textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                  }}
                >
                  {w.name}
                </div>
                {(w.city || w.region) && (
                  <div
                    className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-background/60"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
                  >
                    {[w.city, w.region].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="absolute left-5 md:left-8 bottom-6 md:bottom-10 max-w-[640px] space-y-4 pointer-events-none">
        <h1
          className="text-4xl md:text-6xl lg:text-7xl uppercase leading-[0.95] tracking-tight"
          style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.03em" }}
        >
          Mappiamo
          <br />
          <span className="relative inline-block min-h-[1.1em] text-[#8B5CFF]" style={{ textShadow: "0 0 18px rgba(139,92,255,0.45)" }}>
            {ROTATING_WORDS.map((w, i) => (
              <span
                key={w}
                className="block transition-all duration-500"
                style={{
                  position: i === wordIdx ? "relative" : "absolute",
                  inset: i === wordIdx ? undefined : 0,
                  opacity: i === wordIdx ? 1 : 0,
                  transform: i === wordIdx ? "translateY(0)" : "translateY(12px)",
                }}
              >
                {w}
              </span>
            ))}
          </span>
          <br />
          d'Italia
        </h1>
        <p className="font-mono text-[11px] md:text-xs uppercase tracking-[0.15em] text-background/70 max-w-md">
          Sorvoliamo la penisola, scena per scena.
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

      <div
        ref={rocketRef}
        className="absolute top-0 left-0 pointer-events-none z-20"
        style={{
          willChange: "transform",
          visibility: showRocket ? "visible" : "hidden",
        }}
        aria-hidden
      >
        <LogoPittogramma
          className="w-10 h-10 text-secondary drop-shadow-[0_0_8px_hsl(var(--secondary)/0.7)]"
          flameClassName="text-[#FF8C00] drop-shadow-[0_0_6px_rgba(255,140,0,0.7)]"
        />
      </div>
    </div>
  );
};

export default DroneHero;
