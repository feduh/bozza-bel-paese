import { MapPin } from "lucide-react";

type MapFallbackProps = {
  height?: string;
};

/**
 * Skeleton per la mappa: bande "editoriali" + marker pulsanti fantasma.
 * Rende percepibile che sta arrivando una mappa, senza flash bianco.
 */
const MapFallback = ({ height = "600px" }: MapFallbackProps) => {
  const ghosts = [
    { top: "28%", left: "22%", delay: "0s" },
    { top: "42%", left: "48%", delay: "0.3s" },
    { top: "36%", left: "68%", delay: "0.6s" },
    { top: "58%", left: "38%", delay: "0.15s" },
    { top: "66%", left: "60%", delay: "0.45s" },
    { top: "72%", left: "24%", delay: "0.75s" },
  ];
  return (
    <div
      role="status"
      aria-label="Caricamento mappa"
      className="relative w-full overflow-hidden bg-muted"
      style={{ height }}
    >
      {/* Grid decorativo tipo carta topografica */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)/0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Shimmer diagonale */}
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-pulse"
        style={{
          background:
            "linear-gradient(120deg, transparent 30%, hsl(var(--foreground)/0.04) 50%, transparent 70%)",
        }}
      />
      {/* Marker fantasma */}
      {ghosts.map((g, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute inline-flex h-3 w-3 rounded-full bg-primary/60 animate-ping"
          style={{ top: g.top, left: g.left, animationDelay: g.delay }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-background/90 brutalist-border text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/70">
          <MapPin size={12} className="text-primary" /> Caricamento mappa
        </span>
      </div>
    </div>
  );
};

export default MapFallback;
