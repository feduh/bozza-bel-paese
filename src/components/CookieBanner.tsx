import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const STORAGE_KEY = "ilbelpaese-cookie-consent";

/**
 * Banner informativo cookie minimal: non blocca la navigazione,
 * ricorda la scelta in localStorage e rispetta prefers-reduced-motion.
 */
const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = window.localStorage.getItem(STORAGE_KEY);
      if (!accepted) setVisible(true);
    } catch {
      // localStorage non disponibile: mostra comunque
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed z-50 bottom-3 left-3 right-3 sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-md border-2 border-foreground bg-card rounded-lg p-3 sm:p-4 shadow-[0_10px_30px_-10px_hsl(var(--foreground)/0.25)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-body text-foreground leading-relaxed">
            Cookie tecnici e, col tuo consenso, di analisi per migliorare l'esperienza.{" "}
            <Link to="/cookie-policy" className="underline hover:text-primary transition-colors">
              Info
            </Link>
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={accept}
              className="btn-brutalist text-[11px] uppercase tracking-[0.12em] font-bold py-1.5 px-3"
            >
              Accetta
            </button>
            <button
              onClick={() => setVisible(false)}
              className="text-[11px] uppercase tracking-[0.12em] font-bold py-1.5 px-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Rifiuta
            </button>
          </div>
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Chiudi banner cookie"
          className="p-1 -m-1 rounded-md hover:bg-muted transition-colors shrink-0"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
