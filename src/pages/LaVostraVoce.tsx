import { Link } from "react-router-dom";
import { Radio, Mic, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const LaVostraVoce = () => {
  return (
    <div className="py-20">
      <SEO
        title="La vostra voce — Il Bel Paese"
        description="Interviste e testimonianze orali della scena indipendente italiana, in collaborazione con radio e piattaforme podcast indipendenti."
        canonicalPath="/la-vostra-voce"
      />
      <div className="editorial-container max-w-3xl">
        <div className="mb-12">
          <h1 className="editorial-heading mb-6">
            La <span className="italic text-primary">vostra</span> voce
          </h1>
          <p className="editorial-body text-muted-foreground">
            Per il momento non c'è nulla, ma qui troverai tutta la parte di interviste e testimonianze orali.
          </p>
        </div>

        <div className="p-8 rounded-lg bg-card border border-border mb-10">
          <div className="flex items-start gap-4">
            <Radio className="text-primary shrink-0 mt-1" size={28} aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-semibold mb-3">Stiamo cercando alleati</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                Dato che non vogliamo finanziare genocidi vari ed eventuali, siamo alla ricerca di
                <strong className="text-foreground"> piattaforme indipendenti o radio </strong>
                sparse per la penisola che sarebbero felici di collaborare con noi e amplificare
                il racconto di chi vive e alimenta ogni giorno la scena indipendente.
              </p>
            </div>
          </div>
        </div>

        <div className="p-10 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
          <Mic className="text-secondary mx-auto mb-4" size={28} aria-hidden="true" />
          <h3 className="font-display text-2xl font-semibold mb-3">Sei interessato?</h3>
          <p className="font-body text-muted-foreground max-w-xl mx-auto mb-6">
            Scrivici qui e raccontaci come potremmo collaborare.
          </p>
          <Link
            to="/contatti"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-body font-medium hover:opacity-90 transition-opacity"
          >
            Scrivici <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LaVostraVoce;
