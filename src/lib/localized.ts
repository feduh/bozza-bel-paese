import { useTranslation } from "react-i18next";

/**
 * Returns the English value if current language is EN and it exists,
 * otherwise falls back to the Italian source.
 */
export function pickLocalized(it: string | null | undefined, en: string | null | undefined, lang: string): string {
  const isEn = lang?.toLowerCase().startsWith("en");
  if (isEn && en && en.trim().length > 0) return en;
  return it ?? "";
}

export function useLocalized() {
  const { i18n } = useTranslation();
  const lang = i18n.language || "it";
  return (it: string | null | undefined, en: string | null | undefined) => pickLocalized(it, en, lang);
}
