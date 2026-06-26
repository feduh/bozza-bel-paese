import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import it from "./locales/it.json";

// Single-language project (Italian only). EN translation pipeline was removed.
export const resources = {
  it: { translation: it },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "it",
  fallbackLng: "it",
  supportedLngs: ["it"],
  interpolation: { escapeValue: false },
});

if (typeof document !== "undefined") {
  document.documentElement.lang = "it";
}

export default i18n;
