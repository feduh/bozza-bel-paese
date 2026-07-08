import { Link } from "react-router-dom";
import { Radio, Mic, ArrowRight, PlayCircle, Headphones } from "lucide-react";
import SEO from "@/components/SEO";

// Prima versione: due esempi finti per prototipare la sezione podcast/video.
// Copertine estratte automaticamente (YouTube thumbnail per il video).
const examples = [
  {
    kind: "video" as const,
    title: "Intervista a un collettivo che non ha una sede",
    author: "Il Bel Paese",
    duration: "12'40\"",
    cover: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    href: "#",
    tag: "Video",
  },
  {
    kind: "podcast" as const,
    title: "Radio indipendenti: geografie del suono",
    author: "Ospite: nome radio partner",
    duration: "34'12\"",
    cover: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop",
    href: "#",
    tag: "Podcast",
  },
];

const LaVostraVoce = () => {
  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title="La vostra voce — Il Bel Paese"
        description="Interviste, video e podcast della scena indipendente italiana, in collaborazione con radio e piattaforme podcast indipendenti."
        canonicalPath="/la-vostra-voce"
      />
      <div className="editorial-container space-y-12 md:space-y-16">
        <header className="border-b-2 border-foreground pb-10">
          <h1 className="editorial-heading mb-6">
            La <span className="text-primary">vostra</span> voce
          </h1>
          <p className="editorial-body text-foreground/80 max-w-3xl">
            Uno spazio per interviste, testimonianze orali e video documentari della scena
            indipendente italiana. In collaborazione con radio e piattaforme podcast
            altrettanto indipendenti.
          </p>
        </header>

        {/* Esempi finti — prototipo card */}
        <section aria-labelledby="esempi-heading">
          <div className="flex items-end justify-between mb-6 border-b-2 border-foreground pb-4">
            <h2 id="esempi-heading" className="editorial-subheading">
              <span className="text-primary">Anteprima</span> — come sarà
            </h2>
            <span className="micro-label text-foreground/60">Esempi</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {examples.map((e) => {
              const Icon = e.kind === "video" ? PlayCircle : Headphones;
              return (
                <a
                  key={e.title}
                  href={e.href}
                  onClick={(ev) => ev.preventDefault()}
                  className="brutalist-card overflow-hidden group cursor-not-allowed"
                >
                  <div className="relative aspect-video bg-muted overflow-hidden border-b-2 border-foreground">
                    <img
                      src={e.cover}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(ev) => {
                        (ev.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                      <Icon size={56} className="text-background drop-shadow-lg" aria-hidden="true" />
                    </div>
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 micro-label px-2.5 py-1 brutalist-border bg-background">
                      {e.tag}
                    </span>
                    <span className="absolute bottom-3 right-3 micro-label bg-foreground text-background px-2 py-0.5">
                      {e.duration}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3
                      className="text-lg leading-tight tracking-tight"
                      style={{ fontVariationSettings: "'wght' 600" }}
                    >
                      {e.title}
                    </h3>
                    <p className="text-xs text-foreground/60">{e.author}</p>
                  </div>
                </a>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-foreground/60 font-body italic">
            Questi sono esempi finti per definire il layout: non riproducono contenuti reali.
          </p>
        </section>

        <section className="brutalist-card p-8 md:p-10">
          <div className="flex items-start gap-5">
            <Radio className="text-foreground shrink-0 mt-1" size={32} aria-hidden="true" />
            <div>
              <h2 className="text-2xl md:text-3xl leading-tight tracking-tight mb-4" style={{ fontVariationSettings: "'wght' 600" }}>
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
