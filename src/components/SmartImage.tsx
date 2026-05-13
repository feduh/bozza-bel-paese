import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "loading"> & {
  /** Force eager loading (use for above-the-fold / LCP images). Default: false. */
  priority?: boolean;
  /** Aspect ratio wrapper (e.g. "16/9", "1/1"). Prevents layout shift. */
  aspect?: string;
  /** Wrapper className (the <img> uses `className`). */
  wrapperClassName?: string;
};

/**
 * Smart <img> wrapper:
 * - Native lazy loading by default; eager + fetchpriority="high" when `priority`.
 * - Async decoding to keep the main thread free.
 * - Skeleton background until load, fade-in on appear → no layout shift.
 * - Graceful fallback when the source fails to load.
 *
 * Stays purely client-side (no CDN/transform layer assumed).
 */
const SmartImage = ({
  priority = false,
  aspect,
  wrapperClassName = "",
  className = "",
  alt,
  src,
  ...rest
}: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || "Immagine non disponibile"}
        className={`flex items-center justify-center bg-muted text-muted-foreground ${wrapperClassName}`}
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        <ImageOff size={20} aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-muted ${wrapperClassName}`}
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        // fetchpriority is valid HTML; React >=18.3 accepts it via attribute.
        {...(priority ? { fetchpriority: "high" as const } : {})}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
        {...rest}
      />
    </div>
  );
};

export default SmartImage;
