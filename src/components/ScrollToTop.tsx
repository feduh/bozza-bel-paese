import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Riporta lo scroll in alto a ogni cambio di route e al refresh.
 * Se l'URL contiene un hash (#sezione), prova a scrollare a quell'elemento.
 */
const ScrollToTop = () => {
  const { pathname, hash, search } = useLocation();

  // Disabilita il ripristino automatico dello scroll del browser al refresh.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = prev;
      };
    }
  }, []);

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash, search]);

  return null;
};

export default ScrollToTop;

