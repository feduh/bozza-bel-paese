import { toast } from "sonner";

/**
 * Global runtime error listeners.
 *
 * Catches errors that escape React's render cycle — async failures,
 * unhandled promise rejections, and event-handler exceptions — and
 * surfaces them as non-blocking toasts instead of failing silently.
 *
 * Call `installErrorHandlers()` once at app boot.
 */
let installed = false;

const isNoise = (msg: string) =>
  // Browser-extension and ResizeObserver chatter that pollutes Sentry-style sinks.
  msg.includes("ResizeObserver loop") ||
  msg.includes("Non-Error promise rejection captured") ||
  msg.includes("Script error.");

export const installErrorHandlers = () => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    const msg = event.message || String(event.error);
    if (isNoise(msg)) return;
    console.error("[window.error]", event.error ?? msg);
    toast.error("Si è verificato un errore inatteso", {
      description: msg.slice(0, 140),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason: unknown = event.reason;
    const msg =
      reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "Promise rejection";
    if (isNoise(msg)) return;
    console.error("[unhandledrejection]", reason);
    toast.error("Operazione non riuscita", {
      description: msg.slice(0, 140),
    });
  });
};
