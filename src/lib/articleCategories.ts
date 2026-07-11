// Categorie predefinite per gli articoli del Magazine.
// Un articolo può appartenere a più categorie contemporaneamente.

export const ARTICLE_CATEGORIES = [
  "Tendenze",
  "Inchieste",
  "Interviste",
  "Reportage",
  "Recensioni",
  "Editoriali",
  "Approfondimenti",
  "Storie",
  "Territori",
  "Reti & Collettivi",
  "Archivi & Memoria",
  "Pratiche",
  "Eventi",
  "Conversazioni",
  "Podcast",
] as const;


export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

/** Serializza un array di categorie in stringa (storage DB). */
export const serializeCategories = (cats: string[]): string =>
  cats.filter(Boolean).join(", ");

/** Estrae un array di categorie da una stringa salvata. */
export const parseCategories = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
};
