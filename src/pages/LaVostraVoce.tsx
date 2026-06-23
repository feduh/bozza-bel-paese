import { Link } from "react-router-dom";
import { Radio, Mic, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const LaVostraVoce = () => {
  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title="La vostra voce — Il Bel Paese"
        description="Interviste e testimonianze orali della scena indipendente italiana, in collaborazione con radio e piattaforme podcast indipendenti."
        canonicalPath="/la-vostra-voce"
      />
      <div className="editorial-container max-w-4xl space-y-12 md:space-y-16">
        <header className="border-b-2 border-foreground pb-10">
          <h1 className="editorial-heading mb-6">
            La <span className="text-primary">vostra</span> voce
          </h1>
          <p className="editorial-body text-foreground/80">
            Per il momento non c'è nulla, ma qui troverai tutta la parte di interviste e testimonianze orali.
          </p>
        </header>

        <section className="brutalist-card p-8 md:p-10">
          <div className="flex items-start gap-5">
            <Radio className="text-foreground shrink-0 mt-1" size={32} aria-hidden="true" />
            <div>
              <h2 className="text-2xl md:text-3xl uppercase leading-tight tracking-tight mb-4" style={{ fontVariationSettings: "'wght' 700" }}>
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
