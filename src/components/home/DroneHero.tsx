import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { EUROPE_PATH, EUROPE_VB } from "./europePath";
import LogoPittogramma from "@/components/LogoPittogramma";

/**
 * DroneHero — hero editoriale con mappa vettoriale dell'Europa
 * che reagisce in parallasse al movimento del cursore-razzo.
 * Nessun pin reale, nessuna query al database: è puro racconto visivo.
 */

const { W: VB_W, H: VB_H } = EUROPE_VB;

const ROTATING_WORDS = [
  "realtà artistiche",
  "spazi indipendenti",
  "atelier nascosti",
  "collettivi nomadi",
  "luoghi che resistono",
];

// punto di partenza (Piemonte) e zoom della mappa — su Europa, Italia in primo piano
const PIEMONTE = { x: 0.475, y: 0.655 }; // normalizzato nel viewBox Europa (Mercator)
const ZOOM = 4.2;

const DroneHero = () => {
  // ---- parallax state (smoothed) ----
  const panelRef = useRef<HTMLDivElement>(null);
  // focus normalizzato 0..1 nel viewBox dell'Italia (dove la "telecamera" guarda)
  const target = useRef({ x: PIEMONTE.x, y: PIEMONTE.y });
  const current = useRef({ x: PIEMONTE.x, y: PIEMONTE.y });
  const cursor = useRef({ x: 0, y: 0, svx: 0, svy: 0, lastX: 0, lastY: 0, angle: -45 });
  const [, force] = useState(0);
  const [hovering, setHovering] = useState(false);
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

  // rAF smoothing
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      current.current.x += (target.current.x - current.current.x) * 0.07;
      current.current.y += (target.current.y - current.current.y) * 0.07;

      // smoothed velocity (low-pass), derive angle only above threshold
      const c = cursor.current;
      const dx = c.x - c.lastX;
      const dy = c.y - c.lastY;
      c.lastX = c.x;
      c.lastY = c.y;
      c.svx += (dx - c.svx) * 0.18;
      c.svy += (dy - c.svy) * 0.18;
      const speed = Math.hypot(c.svx, c.svy);
      if (speed > 1.2) {
        const targetAngle = (Math.atan2(c.svy, c.svx) * 180) / Math.PI + 45;
        const diff = ((targetAngle - c.angle + 540) % 360) - 180;
        const ease = Math.min(0.25, 0.06 + speed * 0.01);
        c.angle += diff * ease;
      }
      // else: tieni l'ultimo angolo (no jitter quando quasi fermo)

      force((n) => (n + 1) & 1023);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cursor.current.x = x;
    cursor.current.y = y;
    // mappa la posizione del mouse nel viewBox dell'Europa, con un piccolo padding:
    // muovendo il cursore si naviga dall'Italia al resto d'Europa mantenendo il parallasse
    const nx = Math.min(1, Math.max(0, x / rect.width));
    const ny = Math.min(1, Math.max(0, y / rect.height));
    target.current.x = 0.42 + nx * 0.18;
    target.current.y = 0.60 + ny * 0.22;
  };

  // ---- rotating word ----
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % ROTATING_WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);

  // ---- compute transforms ----
  const cx = panel.w / 2;
  const cy = panel.h / 2;
  const fit = Math.min(panel.h / VB_H, panel.w / VB_W);
  const scale = fit * ZOOM;
  const fx = current.current.x * VB_W;
  const fy = current.current.y * VB_H;
  // leggera inclinazione "drone" proporzionale alla distanza dal centro
  const tiltDeg = (current.current.x - 0.5) * 3;
  const groupTransform = `translate(${cx} ${cy}) rotate(${tiltDeg.toFixed(2)}) scale(${scale.toFixed(3)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`;

  const rocketRotation = cursor.current.angle;

  return (
    <div
      ref={panelRef}
      className="relative w-full h-[88vh] min-h-[600px] max-h-[920px] bg-foreground text-background overflow-hidden select-none"
      style={{ cursor: hovering ? "none" : "auto" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
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

        {/* grid sfondo */}
        <rect x="0" y="0" width={panel.w} height={panel.h} fill="url(#dh-grid)" />

        {/* layer mappa con parallasse */}
        <g transform={groupTransform}>
          {/* alone esterno tenue */}
          <path
            d={EUROPE_PATH}
            fill="hsl(var(--secondary) / 0.06)"
            stroke="hsl(var(--secondary) / 0.25)"
            strokeWidth={4 / scale}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Europa vettoriale */}
          <path
            d={EUROPE_PATH}
            fill="hsl(var(--secondary) / 0.10)"
            stroke="hsl(var(--secondary))"
            strokeWidth={1 / scale}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--secondary) / 0.45))" }}
          />
        </g>

        {/* vignettatura */}
        <rect x="0" y="0" width={panel.w} height={panel.h} fill="url(#dh-vignette)" pointerEvents="none" />
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
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 md:px-8 py-4 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] pointer-events-none">
        <div className="flex items-center gap-2 text-[#8B5CFF]">
          <span className="w-2 h-2 bg-[#8B5CFF] rounded-full animate-pulse" />
          Drone · IT · Live
        </div>
        <div className="text-[#8B5CFF]/70 hidden md:block">MMXXVI</div>
      </div>

      {/* manifesto */}
      <div className="absolute left-5 md:left-8 bottom-6 md:bottom-10 max-w-[640px] space-y-4 pointer-events-none">
        <h1
          className="text-4xl md:text-6xl lg:text-7xl uppercase leading-[0.95] tracking-tight"
          style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.03em" }}
        >
          Mappiamo
          <br />
          <span className="relative inline-block min-h-[1.1em] text-secondary">
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
          Sorvoliamo la penisola. Atelier per atelier, scena per scena.
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

      {/* cursore razzo */}
      {hovering && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: cursor.current.x,
            top: cursor.current.y,
            transform: `translate(-50%, -50%) rotate(${rocketRotation.toFixed(1)}deg)`,
            willChange: "transform, left, top",
          }}
          aria-hidden
        >
          <LogoPittogramma
            className="w-10 h-10 text-secondary drop-shadow-[0_0_8px_hsl(var(--secondary)/0.7)]"
            flameClassName="text-[#FF8C00] drop-shadow-[0_0_6px_rgba(255,140,0,0.7)]"
          />
        </div>
      )}
    </div>
  );
};

export default DroneHero;
