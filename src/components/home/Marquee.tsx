import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  speedSec?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * Marquee CSS-only infinite. Duplica i children due volte per scroll continuo.
 * Pausa su hover. Rispetta prefers-reduced-motion (animation auto-disabled via CSS layer).
 */
const Marquee = ({ children, speedSec = 40, reverse = false, className = "" }: MarqueeProps) => {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <div
        className="flex w-max gap-12 motion-reduce:animate-none"
        style={{
          animation: `ibp-marquee ${speedSec}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: "running",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "paused")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "running")}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12" aria-hidden>{children}</div>
      </div>
      <style>{`
        @keyframes ibp-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Marquee;
