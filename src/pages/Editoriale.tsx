import { Link } from "react-router-dom";
import { ArrowRight, Bookmark } from "lucide-react";
import SEO from "@/components/SEO";

const CURRENT_YEAR = new Date().getFullYear();

const Editoriale = () => {
  return (
    <div className="bg-foreground text-background py-16 md:py-24">
      <SEO
        title="Editoriale — Il Bel Paese"
        description="La selezione annuale di un tema curato dall'editore dell'anno. Un percorso critico dentro la scena indipendente italiana."
        canonicalPath="/editoriale"
      />

      <div className="editorial-container space-y-16">
        {/* Header editoriale — visivamente distinto */}
        <header className="border-b-2 border-background/40 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <Bookmark size={16} className="text-secondary" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">
              Tema {CURRENT_YEAR}
            </span>
          </div>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight mb-8"
            style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.03em" }}
          >
            <span className="text-secondary">Editoriale</span>
          </h1>
          <p className="editorial-body text-background/80 max-w-3xl">
            Una selezione annuale di un tema curato dall'<strong className="text-background">editore dell'anno</strong>.
            Uno spazio critico differenziato dagli articoli del Magazine libero:
            qui si costruisce una linea, un pensiero, un percorso di lettura.
          </p>
        </header>

        {/* Placeholder — tema dell'anno */}
        <section className="border-2 border-background/40 p-8 md:p-14">
          <div className="micro-label text-secondary mb-4">Tema dell'anno · in preparazione</div>
          <h2
            className="text-3xl md:text-5xl uppercase leading-tight tracking-tight mb-6"
            style={{ fontVariationSettings: "'wght' 700" }}
          >
            Ancora nulla da pubblicare qui.
          </h2>
          <p className="text-base md:text-lg text-background/80 max-w-2xl leading-relaxed mb-8">
            Stiamo definendo il primo tema editoriale insieme al curatore dell'anno.
            Torna presto: qui troverai una raccolta di saggi, interviste e materiali
            che compongono la nostra <strong className="text-background">visione critica</strong> sulla scena
            indipendente italiana.
          </p>
          <Link
            to="/magazine"
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] border-2 border-secondary hover:bg-background hover:text-foreground hover:border-background transition-colors"
          >
            Vai al Magazine libero <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Editoriale;
