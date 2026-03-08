export type ArtReality = {
  id: string;
  name: string;
  type: "nomade" | "con-sede" | "scomparsa";
  city: string;
  region: string;
  description: string;
  history: string;
  yearFounded: number;
  yearClosed?: number;
  lat: number;
  lng: number;
  disciplines: string[];
  website?: string;
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

export const regions = [
  "Lombardia", "Campania", "Piemonte", "Emilia-Romagna", "Toscana", "Puglia", "Lazio"
] as const;

export const disciplines = [
  "Arti visive", "Teatro", "Musica", "Danza", "Arte digitale", "Scultura", "Pittura", "Performance", "Fotografia"
] as const;

export const artRealities: ArtReality[] = [
  {
    id: "1", name: "Collettivo Aurora", type: "nomade", city: "Milano", region: "Lombardia",
    description: "Un collettivo itinerante di artisti visivi che porta installazioni temporanee nelle piazze italiane.",
    history: "Fondato nel 2015 da un gruppo di cinque artisti milanesi, il Collettivo Aurora nasce dall'esigenza di portare l'arte contemporanea fuori dalle gallerie e nei luoghi della vita quotidiana. La prima installazione, \"Luci Migranti\", fu realizzata in Piazza Gae Aulenti e attirò oltre 3.000 visitatori in un solo weekend. Da allora il collettivo ha attraversato più di 40 città italiane, collaborando con amministrazioni locali, scuole e comunità per creare opere che dialogano con il tessuto urbano e sociale dei territori.",
    yearFounded: 2015, lat: 45.4642, lng: 9.1900, disciplines: ["Arti visive", "Performance", "Fotografia"]
  },
  {
    id: "2", name: "Spazio Meridiano", type: "con-sede", city: "Napoli", region: "Campania",
    description: "Centro culturale polifunzionale nel cuore dei Quartieri Spagnoli, dedicato a teatro e arti performative.",
    history: "Spazio Meridiano apre le porte nel 2008 in un palazzo storico dei Quartieri Spagnoli, recuperato da un gruppo di artisti e attivisti culturali. Nato come risposta alla chiusura di numerosi teatri indipendenti napoletani, lo spazio è diventato un punto di riferimento per la scena performativa del Sud Italia. Ogni anno ospita oltre 100 spettacoli, residenze artistiche e laboratori aperti alla comunità del quartiere, con un'attenzione particolare all'inclusione sociale e alla formazione dei giovani.",
    yearFounded: 2008, lat: 40.8468, lng: 14.2524, disciplines: ["Teatro", "Danza", "Performance"],
    website: "https://spaziomeridiano.it"
  },
  {
    id: "3", name: "Officina delle Idee", type: "scomparsa", city: "Torino", region: "Piemonte",
    description: "Laboratorio di sperimentazione artistica attivo negli anni '90, pioniere dell'arte digitale in Italia.",
    history: "L'Officina delle Idee fu uno dei primi spazi in Italia dedicati all'intersezione tra arte e tecnologia. Fondata nel 1992 da Marco Ferretti e Anna Colombo in un ex opificio di Barriera di Milano, divenne rapidamente un laboratorio di riferimento per artisti digitali da tutta Europa. Tra le sue iniziative più importanti, il festival \"Bit & Pixel\" (1996-2004) anticipò di anni molte tendenze dell'arte digitale contemporanea. La chiusura nel 2005 fu causata dalla speculazione immobiliare che trasformò il quartiere.",
    yearFounded: 1992, yearClosed: 2005, lat: 45.0703, lng: 7.6869, disciplines: ["Arte digitale", "Arti visive"]
  },
  {
    id: "4", name: "La Carovana Creativa", type: "nomade", city: "Bologna", region: "Emilia-Romagna",
    description: "Gruppo di artisti di strada che organizza festival itineranti di arte partecipativa.",
    history: "La Carovana Creativa nasce nel 2019 dall'incontro tra artisti di strada, musicisti e performer bolognesi. Il loro format è unico: un festival itinerante che si sposta ogni mese in una diversa città emiliana, trasformando piazze e parchi in palcoscenici temporanei. L'approccio è radicalmente partecipativo: ogni evento include workshop aperti dove il pubblico diventa parte dell'opera. Durante la pandemia, la Carovana ha inventato il formato \"balcone a balcone\", portando arte nei cortili condominiali.",
    yearFounded: 2019, lat: 44.4949, lng: 11.3426, disciplines: ["Musica", "Performance", "Teatro"]
  },
  {
    id: "5", name: "Fondazione Luce", type: "con-sede", city: "Firenze", region: "Toscana",
    description: "Fondazione dedicata alla promozione dell'arte contemporanea emergente italiana.",
    history: "La Fondazione Luce è stata istituita nel 2001 dalla mecenate Elisabetta Marchetti, con la missione di sostenere giovani artisti italiani nella fase più delicata della loro carriera. Con sede in un palazzo rinascimentale nel quartiere di Oltrarno, la fondazione offre borse di studio, residenze e uno spazio espositivo di 800 mq. Il programma \"Prima Luce\" ha lanciato oltre 150 artisti emergenti, molti dei quali oggi espongono in musei e gallerie internazionali.",
    yearFounded: 2001, lat: 43.7696, lng: 11.2558, disciplines: ["Arti visive", "Scultura", "Pittura", "Fotografia"],
    website: "https://fondazioneluce.it"
  },
  {
    id: "6", name: "Atelier Vesuvio", type: "scomparsa", city: "Napoli", region: "Campania",
    description: "Storico atelier collettivo di pittura e scultura, chiuso dopo il terremoto del 1980.",
    history: "L'Atelier Vesuvio fu fondato nel 1965 da un gruppo di pittori e scultori napoletani che cercavano uno spazio di lavoro condiviso lontano dalle logiche del mercato dell'arte. Situato in un ex deposito portuale nella zona di San Giovanni a Teduccio, l'atelier divenne un crocevia di sperimentazione artistica, ospitando tra gli altri Salvatore Emblema e Gianni Pisani. Il terremoto dell'Irpinia del 1980 danneggiò gravemente la struttura, e nonostante i tentativi di recupero, l'atelier chiuse definitivamente nel 1981.",
    yearFounded: 1965, yearClosed: 1981, lat: 40.8359, lng: 14.2988, disciplines: ["Pittura", "Scultura"]
  },
  {
    id: "7", name: "Rete Nomade Sud", type: "nomade", city: "Lecce", region: "Puglia",
    description: "Network di artisti del Mezzogiorno che opera in spazi pubblici abbandonati.",
    history: "Rete Nomade Sud è un network fondato nel 2020 che riunisce artisti, architetti e urbanisti del Sud Italia con l'obiettivo di riattivare spazi pubblici abbandonati attraverso interventi artistici temporanei. Il primo progetto, \"Vuoti Pieni\", ha trasformato un ex mercato coperto di Lecce in una galleria a cielo aperto per tre mesi. Da allora la rete ha operato in oltre 15 siti abbandonati tra Puglia, Basilicata e Calabria, coinvolgendo comunità locali nella co-progettazione degli interventi.",
    yearFounded: 2020, lat: 40.3516, lng: 18.1718, disciplines: ["Arti visive", "Performance", "Fotografia"]
  },
  {
    id: "8", name: "Casa delle Arti", type: "con-sede", city: "Roma", region: "Lazio",
    description: "Spazio espositivo e residenza per artisti internazionali nel quartiere Testaccio.",
    history: "Casa delle Arti è stata inaugurata nel 2012 in un ex mattatoio ristrutturato nel quartiere Testaccio di Roma. Lo spazio combina una galleria espositiva, studi per artisti in residenza e un programma educativo rivolto alle scuole della capitale. Ogni anno accoglie 12 artisti internazionali per residenze di tre mesi, durante le quali creano opere in dialogo con la città. Il programma \"Roma Aperta\" organizza open studio mensili che attirano migliaia di visitatori.",
    yearFounded: 2012, lat: 41.8764, lng: 12.4757, disciplines: ["Arti visive", "Scultura", "Performance"],
    website: "https://casadellearti.roma.it"
  },
];

export const blogPosts: BlogPost[] = [
  { id: "1", title: "Il ritorno dell'arte nomade nelle città italiane", excerpt: "Come i collettivi itineranti stanno ridefinendo il concetto di spazio pubblico attraverso installazioni temporanee.", date: "2026-03-01", author: "Maria Rossi", category: "Tendenze" },
  { id: "2", title: "Spazi culturali a rischio: una mappa della resistenza", excerpt: "Indagine sulle realtà artistiche che lottano per sopravvivere tra gentrificazione e tagli ai fondi.", date: "2026-02-15", author: "Luca Bianchi", category: "Inchieste" },
  { id: "3", title: "Memorie perdute: le realtà artistiche scomparse del Novecento", excerpt: "Un viaggio nella storia dei centri culturali italiani che non esistono più, ma hanno lasciato un segno indelebile.", date: "2026-02-01", author: "Giulia Verdi", category: "Storia" },
  { id: "4", title: "Intervista: il Collettivo Aurora racconta 10 anni di arte in movimento", excerpt: "Dalla prima installazione a Milano alle grandi piazze del Sud: storia di un collettivo che non si ferma.", date: "2026-01-20", author: "Marco Neri", category: "Interviste" },
];
