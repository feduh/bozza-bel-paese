// Lightweight anti-spam helpers for public forms.
// - Honeypot: a hidden field bots tend to fill. If it has any value, reject.
// - Time-trap: bots usually submit within < 2s. We mark page-load time and
//   reject submissions that arrive too fast.
//
// Use:
//   const trap = useAntiSpam();
//   <input {...trap.honeypotProps} />
//   if (!trap.passes()) { setError("Errore. Riprova."); return; }

import { useRef } from "react";

export type AntiSpamHandle = {
  honeypotProps: {
    type: "text";
    name: string;
    tabIndex: -1;
    autoComplete: "off";
    "aria-hidden": true;
    style: React.CSSProperties;
    ref: React.RefObject<HTMLInputElement>;
  };
  /** Returns true if the submission looks human (empty honeypot + waited ≥ MIN_MS). */
  passes: () => boolean;
};

const MIN_MS = 1500;
const HIDDEN_STYLE: React.CSSProperties = {
  position: "absolute",
  left: "-9999px",
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: "none",
};

export function useAntiSpam(fieldName = "website_url"): AntiSpamHandle {
  const ref = useRef<HTMLInputElement>(null);
  const startedAt = useRef<number>(Date.now());

  return {
    honeypotProps: {
      type: "text",
      name: fieldName,
      tabIndex: -1,
      autoComplete: "off",
      "aria-hidden": true,
      style: HIDDEN_STYLE,
      ref,
    },
    passes: () => {
      const filled = !!ref.current?.value;
      const elapsed = Date.now() - startedAt.current;
      return !filled && elapsed >= MIN_MS;
    },
  };
}
