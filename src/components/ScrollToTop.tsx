import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Riporta lo scroll in alto a ogni cambio di route.
 * Se l'URL contiene un hash (#sezione), prova a scrollare a quell'elemento.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
