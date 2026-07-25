import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Radio, Mic, ArrowRight, Headphones, Search, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import coverNomadi from "@/assets/podcast/voci-spazi-nomadi.jpg";
import coverSud from "@/assets/podcast/mappe-sonore-sud.jpg";
import coverArchivio from "@/assets/podcast/archivio-realta-scomparse.jpg";

type Episode = {
  slug: string;
  title: string;
  author: string;
  duration: string;
  cover: string;
  publishedAt: string; // ISO
  episodeNumber: number;
  tags: string[];
  excerpt: string;
};

// Esempi editoriali (contenuti non ancora prodotti) — copertine originali.
const episodes: Episode[] = [
  {
    slug: "voci-spazi-nomadi",
    title: "Voci dagli spazi nomadi",
    author: "Il Bel Paese × partner radio",
    duration: "28'40\"",
    cover: coverNomadi,
    publishedAt: "2026-06-14",
    episodeNumber: 1,
    tags: ["Spazi", "Collettivi", "Nomadismo"],
    excerpt:
      "Un dialogo con chi fa cultura senza una sede fissa: collettivi che occupano temporaneamente scuole, capannoni, cortili, e che ripartono ogni volta da zero.",
  },
  {
    slug: "mappe-sonore-sud",
    title: "Mappe sonore del Sud",
    author: "Il Bel Paese × partner radio",
    duration: "41'05\"",
    cover: coverSud,
    publishedAt: "2026-07-02",
    episodeNumber: 2,
    tags: ["Sud", "Geografie", "Festival"],
    excerpt:
      "Un viaggio d'ascolto attraverso le scene indipendenti che tengono viva la ricerca artistica fuori dalle rotte di Milano, Torino e Bologna.",
  },
  {
    slug: "archivio-realta-scomparse",
    title: "Archivio delle realtà scomparse",
    author: "Il Bel Paese × partner radio",
    duration: "35'22\"",
    cover: coverArchivio,
    publishedAt: "2026-07-20",
    episodeNumber: 3,
    tags: ["Archivio", "Memoria", "Spazi"],
    excerpt:
      "Una puntata dedicata alla memoria orale degli spazi che non ci sono più: gallerie chiuse, associazioni sciolte, laboratori sfrattati.",
  },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const LaVostraVoce = () => {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(episodes.flatMap((e) => e.tags))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return episodes
      .filter((e) => (activeTag ? e.tags.includes(activeTag) : true))
      .filter((e) =>
        q
          ? e.title.toLowerCase().includes(q) ||
            e.excerpt.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q))
          : true,
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
  }, [query, activeTag]);

  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title="Podcast — Il Bel Paese"
        description="Interviste, testimonianze e podcast della scena indipendente italiana, in collaborazione con radio e piattaforme podcast indipendenti."
        canonicalPath="/la-vostra-voce"
      />
      <div className="editorial-container space-y-12 md:space-y-16">
        <header className="border-b-2 border-foreground pb-10">
          <div className="micro-label text-foreground/60 mb-4">Podcast</div>
          <h1 className="editorial-heading mb-6">
            La <span className="text-primary">vostra</span> voce
          </h1>
          <p className="editorial-body text-foreground/80 max-w-3xl">
            Uno spazio per interviste, testimonianze orali e racconti audio della scena
            indipendente italiana. In collaborazione con radio e piattaforme podcast
            altrettanto indipendenti.
          </p>
        </header>

        {/* Filtri di ricerca */}
        <section aria-label="Filtri episodi" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
                placeholder="Cerca un episodio, un tema, un tag…"
                className="w-full pl-10 pr-4 py-3 brutalist-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Cerca tra gli episodi"
              />
            </div>
            <span className="micro-label text-foreground/60">
              {filtered.length} {filtered.length === 1 ? "episodio" : "episodi"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`micro-label px-3 py-1.5 brutalist-border transition-colors ${
                activeTag === null
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground hover:bg-secondary"
              }`}
            >
              Tutti
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag((cur) => (cur === tag ? null : tag))}
                className={`micro-label px-3 py-1.5 brutalist-border transition-colors ${
                  activeTag === tag
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Lista episodi */}
        <section aria-label="Episodi">
          {filtered.length === 0 ? (
            <div className="brutalist-card p-10 text-center text-foreground/60 font-body">
              Nessun episodio corrisponde ai filtri selezionati.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e) => (
                <Link
                  key={e.slug}
                  to={`/racconti/podcast/${e.slug}`}
                  className="brutalist-card overflow-hidden group block flex flex-col"
                >
                  <div className="relative aspect-video bg-muted overflow-hidden border-b-2 border-foreground">
                    <img
                      src={e.cover}
                      alt=""
                      loading="lazy"
                      width={1280}
                      height={720}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 group-hover:bg-foreground/25 transition-colors">
                      <Headphones
                        size={52}
                        className="text-background drop-shadow-lg"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="absolute top-3 left-3 micro-label px-2.5 py-1 brutalist-border bg-background">
                      Ep. {String(e.episodeNumber).padStart(2, "0")}
                    </span>
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 micro-label bg-foreground text-background px-2 py-0.5">
                      <Clock size={11} aria-hidden="true" />
                      {e.duration}
                    </span>
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[11px] text-foreground/50 font-body uppercase tracking-wider">
                      <time dateTime={e.publishedAt}>{formatDate(e.publishedAt)}</time>
                      <span aria-hidden="true">·</span>
                      <span>{e.author}</span>
                    </div>
                    <h3
                      className="text-lg leading-tight tracking-tight"
                      style={{ fontVariationSettings: "'wght' 600" }}
                    >
                      {e.title}
                    </h3>
                    <p className="text-sm text-foreground/70 font-body leading-relaxed line-clamp-3">
                      {e.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1 mt-auto">
                      {e.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-secondary text-foreground/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <p className="mt-6 text-xs text-foreground/60 font-body italic">
            Esempi editoriali: episodi non ancora prodotti. Le copertine sono illustrazioni
            originali realizzate per prototipare il layout.
          </p>
        </section>

        <section className="brutalist-card p-8 md:p-10">
          <div className="flex items-start gap-5">
            <Radio className="text-foreground shrink-0 mt-1" size={32} aria-hidden="true" />
            <div>
              <h2
                className="text-2xl md:text-3xl leading-tight tracking-tight mb-4"
                style={{ fontVariationSettings: "'wght' 600" }}
              >
                Stiamo cercando alleati
              </h2>
              <div className="h-[2px] w-12 bg-foreground mb-4" />
              <p className="text-base leading-relaxed text-foreground/80">
                Dato che non vogliamo finanziare genocidi vari ed eventuali, siamo alla ricerca di{" "}
                <strong className="text-foreground">piattaforme indipendenti o radio</strong>{" "}
                sparse per la penisola che sarebbero felici di collaborare con noi e amplificare
                il racconto di chi vive e alimenta ogni giorno la scena indipendente.
              </p>
            </div>
          </div>
        </section>

        <section className="brutalist-card p-10 md:p-14 bg-primary text-primary-foreground text-center">
          <Mic className="mx-auto mb-4" size={28} aria-hidden="true" />
          <h3 className="editorial-subheading mb-4">Sei interessato?</h3>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-8 text-primary-foreground/90">
            Scrivici qui e raccontaci come potremmo collaborare.
          </p>
          <Link
            to="/contatti"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 brutalist-border bg-background text-foreground micro-label hover:bg-secondary hover:text-foreground transition-colors"
          >
            Scrivici <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default LaVostraVoce;
