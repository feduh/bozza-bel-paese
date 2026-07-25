import { Link } from "react-router-dom";
import { Radio, Mic, ArrowRight, Headphones } from "lucide-react";
import SEO from "@/components/SEO";
import coverNomadi from "@/assets/podcast/voci-spazi-nomadi.jpg";
import coverSud from "@/assets/podcast/mappe-sonore-sud.jpg";
import coverArchivio from "@/assets/podcast/archivio-realta-scomparse.jpg";

// Esempi editoriali (contenuti non ancora prodotti) — copertine generate ad hoc,
// nessun materiale di terzi.
const examples = [
  {
    slug: "voci-spazi-nomadi",
    title: "Voci dagli spazi nomadi",
    author: "Il Bel Paese × partner radio",
    duration: "28'40\"",
    cover: coverNomadi,
  },
  {
    slug: "mappe-sonore-sud",
    title: "Mappe sonore del Sud",
    author: "Il Bel Paese × partner radio",
    duration: "41'05\"",
    cover: coverSud,
  },
  {
    slug: "archivio-realta-scomparse",
    title: "Archivio delle realtà scomparse",
    author: "Il Bel Paese × partner radio",
    duration: "35'22\"",
    cover: coverArchivio,
  },
];

const LaVostraVoce = () => {
  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title="La vostra voce — Il Bel Paese"
        description="Interviste, testimonianze e podcast della scena indipendente italiana, in collaborazione con radio e piattaforme podcast indipendenti."
        canonicalPath="/la-vostra-voce"
      />
      <div className="editorial-container space-y-12 md:space-y-16">
        <header className="border-b-2 border-foreground pb-10">
          <h1 className="editorial-heading mb-6">
            La <span className="text-primary">vostra</span> voce
          </h1>
          <p className="editorial-body text-foreground/80 max-w-3xl">
            Uno spazio per interviste, testimonianze orali e racconti audio della scena
            indipendente italiana. In collaborazione con radio e piattaforme podcast
            altrettanto indipendenti.
          </p>
        </header>

        {/* Esempi editoriali — copertine originali, nessun contenuto di terzi */}
        <section aria-labelledby="esempi-heading">
          <div className="flex items-end justify-between mb-6 border-b-2 border-foreground pb-4">
            <h2 id="esempi-heading" className="editorial-subheading">
              <span className="text-primary">Anteprima</span> — come sarà
            </h2>
            <span className="micro-label text-foreground/60">Esempi editoriali</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((e) => (
              <Link
                key={e.slug}
                to={`/racconti/podcast/${e.slug}`}
                className="brutalist-card overflow-hidden group block"
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
                    <Headphones size={52} className="text-background drop-shadow-lg" aria-hidden="true" />
                  </div>
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 micro-label px-2.5 py-1 brutalist-border bg-background">
                    Podcast
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
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-foreground/60 font-body italic">
            Esempi editoriali: episodi non ancora prodotti. Le copertine sono illustrazioni
            originali realizzate per prototipare il layout.
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
