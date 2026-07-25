// Categorie condivise per realtà artistiche e figure (profili).

export const REALITY_CATEGORIES = [
  "Architettura / Spazio Pubblico",
  "Arti visive",
  "Bio-Art / Sci-Art",
  "Cinema / Audiovisivo",
  "Curatela / Ricerca",
  "Danza",
  "Design / Product Design",
  "Editoria / Scrittura",
  "Formazione / Didattica",
  "Fotografia",
  "Installazione",
  "Makers / Artigianato Digitale",
  "New Media Art",
  "Residenza",

  "Performance",
  "Pittura",
  "Scultura",
  "Sound",
  "Teatro",
  "Videoarte",
] as const;

export type RealityCategory = (typeof REALITY_CATEGORIES)[number];

export const FIGURE_CATEGORIES = [
  "Istituzione",
  "Università",
  "Ricercatore indipendente",
  "Curatore indipendente",
  "Artista",
  "Critico",
  "Giornalista",
  "Studente",
  "Gallerista",
  "Editore",
  "Designer",
  "Altro",
] as const;

export type FigureCategory = (typeof FIGURE_CATEGORIES)[number];

export const MEMBER_TYPES = [
  { value: "coordinatore", label: "Coordinatore del collettivo" },
  { value: "autore", label: "Autore / contributor" },
] as const;
