import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Marquee from "./Marquee";

interface TickerRow {
  name: string;
  city: string;
  region: string;
  category: string | null;
  year_founded: number;
}

// Fallback mock se DB vuoto o offline — nomi plausibili, città reali
const FALLBACK: TickerRow[] = [
  { name: "Macao",                     city: "Milano",   region: "Lombardia", category: "Centro culturale",   year_founded: 2012 },
  { name: "Cripta747",                 city: "Torino",   region: "Piemonte",  category: "Spazio indipendente", year_founded: 2008 },
  { name: "Lokomotiv.Klub",            city: "Bologna",  region: "Emilia-Romagna", category: "Collettivo",     year_founded: 2014 },
  { name: "Spazio In Situ",            city: "Roma",     region: "Lazio",     category: "Atelier collettivo", year_founded: 2017 },
  { name: "Numero Cromatico",          city: "Roma",     region: "Lazio",     category: "Editore d'arte",    year_founded: 2011 },
  { name: "FuturDome",                 city: "Milano",   region: "Lombardia", category: "Casa museo",        year_founded: 2015 },
  { name: "Sotterraneo",               city: "Firenze",  region: "Toscana",   category: "Compagnia teatrale", year_founded: 2005 },
  { name: "Studio La Stanza",          city: "Palermo",  region: "Sicilia",   category: "Atelier",           year_founded: 2019 },
  { name: "Locale Due",                city: "Bologna",  region: "Emilia-Romagna", category: "Project space", year_founded: 2018 },
  { name: "Fondazione SoutHeritage",   city: "Matera",   region: "Basilicata", category: "Fondazione",       year_founded: 2003 },
  { name: "Standards",                 city: "Milano",   region: "Lombardia", category: "Project space",     year_founded: 2020 },
  { name: "Spazio Y",                  city: "Roma",     region: "Lazio",     category: "Spazio indipendente", year_founded: 2013 },
  { name: "Tile Project Space",        city: "Milano",   region: "Lombardia", category: "Project space",     year_founded: 2018 },
  { name: "Almanac",                   city: "Torino",   region: "Piemonte",  category: "Spazio non-profit", year_founded: 2014 },
  { name: "BAM!",                      city: "Bologna",  region: "Emilia-Romagna", category: "Festival",      year_founded: 2007 },
  { name: "Diorama",                   city: "Bolzano",  region: "Trentino-AA", category: "Project space",   year_founded: 2021 },
  { name: "Quartz Studio",             city: "Torino",   region: "Piemonte",  category: "Vetrina",           year_founded: 2010 },
  { name: "Manifattura Tabacchi",      city: "Firenze",  region: "Toscana",   category: "Hub culturale",     year_founded: 2018 },
  { name: "Spazio Sì",                 city: "Roma",     region: "Lazio",     category: "Galleria indipendente", year_founded: 2022 },
  { name: "L'ascensore",               city: "Palermo",  region: "Sicilia",   category: "Project space",     year_founded: 2016 },
  { name: "Ramo",                      city: "Como",     region: "Lombardia", category: "Spazio sperimentale", year_founded: 2020 },
  { name: "Riverberi",                 city: "Napoli",   region: "Campania",  category: "Collettivo",        year_founded: 2019 },
];

const SEP = (
  <span className="text-secondary mx-2" aria-hidden>
    ●
  </span>
);

const Item = ({ r, inverted = false }: { r: TickerRow; inverted?: boolean }) => (
  <span className="flex items-center gap-3 whitespace-nowrap">
    <span
      className="micro-label"
      style={{ color: inverted ? "hsl(var(--secondary))" : "hsl(var(--primary))" }}
    >
      {r.region.toUpperCase()}
    </span>
    <span className={`text-base md:text-lg uppercase ${inverted ? "text-background" : "text-foreground"}`} style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.01em" }}>
      {r.name}
    </span>
    <span className={`micro-label ${inverted ? "text-background/60" : "text-muted-foreground"}`}>
      {r.city} · {r.category ?? "—"} · {r.year_founded}
    </span>
    {SEP}
  </span>
);

const LiveTicker = () => {
  const { data } = useQuery({
    queryKey: ["home-ticker"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<TickerRow[]> => {
      const { data, error } = await supabase
        .from("realities")
        .select("name, city, region, category, year_founded")
        .eq("confirmed_status", "confermato")
        .order("created_at", { ascending: false })
        .limit(24);
      if (error || !data || data.length === 0) return FALLBACK;
      return data as TickerRow[];
    },
  });

  const rows = data && data.length > 0 ? data : FALLBACK;
  // Split in 3 fasce ~uguali
  const third = Math.ceil(rows.length / 3);
  const r1 = rows.slice(0, third);
  const r2 = rows.slice(third, third * 2);
  const r3 = rows.slice(third * 2);

  return (
    <div className="relative h-full min-h-[480px] brutalist-border bg-foreground shadow-brutalist-lg overflow-hidden flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-background/20 bg-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse" />
          <span className="micro-label text-secondary">LIVE · ARCHIVIO</span>
        </div>
        <span className="micro-label text-background/60 hidden sm:inline">FEED · IT</span>
      </div>

      {/* 3 marquee rows a velocità diverse */}
      <div className="flex-1 flex flex-col justify-around py-4 gap-2">
        <Marquee speedSec={55}>
          {r1.map((r, i) => <Item key={`a-${i}`} r={r} inverted />)}
        </Marquee>
        <Marquee speedSec={45} reverse>
          {r2.map((r, i) => <Item key={`b-${i}`} r={r} inverted />)}
        </Marquee>
        <Marquee speedSec={65}>
          {r3.map((r, i) => <Item key={`c-${i}`} r={r} inverted />)}
        </Marquee>
      </div>

      {/* Stats footer */}
      <div className="flex items-stretch border-t-2 border-background/20 micro-label divide-x-2 divide-background/20">
        <div className="flex-1 px-3 py-2 text-background/60">
          REC. <span className="text-background" style={{ fontVariationSettings: "'wght' 700" }}>{rows.length.toString().padStart(3, "0")}</span>
        </div>
        <div className="flex-1 px-3 py-2 text-background/60">
          GEO · 41.9° N
        </div>
        <div className="flex-1 px-3 py-2 text-background/60">
          ARCH · MMXXVI
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
export { FALLBACK };
export type { TickerRow };
