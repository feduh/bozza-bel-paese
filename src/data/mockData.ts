export type ArtReality = {
  id: string;
  name: string;
  type: "nomade" | "con-sede" | "scomparsa";
  city: string;
  region: string;
  description: string;
  yearFounded: number;
  yearClosed?: number;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  imageUrl?: string;
};

export const artRealities: ArtReality[] = [
  { id: "1", name: "Collettivo Aurora", type: "nomade", city: "Milano", region: "Lombardia", description: "Un collettivo itinerante di artisti visivi che porta installazioni temporanee nelle piazze italiane.", yearFounded: 2015 },
  { id: "2", name: "Spazio Meridiano", type: "con-sede", city: "Napoli", region: "Campania", description: "Centro culturale polifunzionale nel cuore dei Quartieri Spagnoli, dedicato a teatro e arti performative.", yearFounded: 2008 },
  { id: "3", name: "Officina delle Idee", type: "scomparsa", city: "Torino", region: "Piemonte", description: "Laboratorio di sperimentazione artistica attivo negli anni '90, pioniere dell'arte digitale in Italia.", yearFounded: 1992, yearClosed: 2005 },
  { id: "4", name: "La Carovana Creativa", type: "nomade", city: "Bologna", region: "Emilia-Romagna", description: "Gruppo di artisti di strada che organizza festival itineranti di arte partecipativa.", yearFounded: 2019 },
  { id: "5", name: "Fondazione Luce", type: "con-sede", city: "Firenze", region: "Toscana", description: "Fondazione dedicata alla promozione dell'arte contemporanea emergente italiana.", yearFounded: 2001 },
  { id: "6", name: "Atelier Vesuvio", type: "scomparsa", city: "Napoli", region: "Campania", description: "Storico atelier collettivo di pittura e scultura, chiuso dopo il terremoto del 1980.", yearFounded: 1965, yearClosed: 1981 },
  { id: "7", name: "Rete Nomade Sud", type: "nomade", city: "Lecce", region: "Puglia", description: "Network di artisti del Mezzogiorno che opera in spazi pubblici abbandonati.", yearFounded: 2020 },
  { id: "8", name: "Casa delle Arti", type: "con-sede", city: "Roma", region: "Lazio", description: "Spazio espositivo e residenza per artisti internazionali nel quartiere Testaccio.", yearFounded: 2012 },
];

export const blogPosts: BlogPost[] = [
  { id: "1", title: "Il ritorno dell'arte nomade nelle città italiane", excerpt: "Come i collettivi itineranti stanno ridefinendo il concetto di spazio pubblico attraverso installazioni temporanee.", date: "2026-03-01", author: "Maria Rossi", category: "Tendenze" },
  { id: "2", title: "Spazi culturali a rischio: una mappa della resistenza", excerpt: "Indagine sulle realtà artistiche che lottano per sopravvivere tra gentrificazione e tagli ai fondi.", date: "2026-02-15", author: "Luca Bianchi", category: "Inchieste" },
  { id: "3", title: "Memorie perdute: le realtà artistiche scomparse del Novecento", excerpt: "Un viaggio nella storia dei centri culturali italiani che non esistono più, ma hanno lasciato un segno indelebile.", date: "2026-02-01", author: "Giulia Verdi", category: "Storia" },
  { id: "4", title: "Intervista: il Collettivo Aurora racconta 10 anni di arte in movimento", excerpt: "Dalla prima installazione a Milano alle grandi piazze del Sud: storia di un collettivo che non si ferma.", date: "2026-01-20", author: "Marco Neri", category: "Interviste" },
];
