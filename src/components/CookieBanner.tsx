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
      className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-foreground bg-card p-4 md:p-5 shadow-[0_-8px_30px_-10px_hsl(var(--foreground)/0.15)]"
    >
      <div className="editorial-container flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-body text-foreground">
            Utilizziamo cookie tecnici e, con il tuo consenso, strumenti di analisi per migliorare l'esperienza.{" "}
            <Link to="/cookie-policy" className="underline hover:text-primary transition-colors">
              Maggiori informazioni
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={accept}
            className="btn-brutalist text-xs uppercase tracking-[0.12em] font-bold py-2 px-4"
          >
            Accetta
          </button>
          <button
            onClick={() => setVisible(false)}
            aria-label="Chiudi banner cookie"
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
