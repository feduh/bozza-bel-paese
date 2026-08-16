import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const Racconti = () => (
  <div className="bg-background py-16 md:py-20">
    <SEO
      title="Racconti — Il Bel Paese"
      description="Editoriale, bollettino e podcast: le tre forme del racconto della scena indipendente italiana."
      canonicalPath="/racconti"
    />
    <div className="editorial-container space-y-16 md:space-y-20">
      {/* Header — stessa struttura di Cosa Facciamo / Chi Siamo */}
      <header className="border-b-2 border-foreground pb-10">
        <h1 className="editorial-heading mb-6">
          I nostri <span className="text-primary">racconti</span>
        </h1>
        <div className="editorial-body text-foreground/80 space-y-4 max-w-3xl">
          <p>
            Tre voci per raccontare la scena artistica indipendente italiana:
            un <strong className="text-foreground">editoriale annuale</strong> curato,
            un <strong className="text-foreground">bollettino</strong> aggiornato durante l'anno
            e un <strong className="text-foreground">podcast</strong> prodotto con radio
            e piattaforme partner.
          </p>
        </div>
      </header>

      {/* Tre voci */}
      <section aria-label="Le tre voci dei racconti" className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Editoriale */}
        <Link
          to="/editoriale"
          className="md:col-span-7 border-2 border-foreground bg-foreground text-background flex flex-col justify-between p-8 md:p-10 shadow-brutalist hover:shadow-brutalist-aqua hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group"
        >
          <div>
            <h2 className="editorial-subheading mb-4 text-secondary">Editoriale</h2>
            <p className="editorial-body text-background/80 max-w-md">
              Un numero all'anno, un tema, una curatela affidata a una voce esperta
              del settore. Saggi, interviste e contributi che indagano in profondità
              un nodo della scena indipendente.
            </p>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <span className="font-display font-bold uppercase tracking-wide underline decoration-4 decoration-secondary underline-offset-4">
              Leggi l'edizione
            </span>
            <ArrowRight size={26} strokeWidth={3} className="text-background group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

        {/* Colonna destra */}
        <div className="md:col-span-5 flex flex-col gap-8">
          {/* Bollettino */}
          <Link
            to="/bollettino"
            className="flex-1 border-2 border-foreground bg-card p-6 md:p-7 shadow-brutalist hover:shadow-brutalist-aqua hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
          >
            <div>
              <h3 className="editorial-subheading mb-3 text-primary">Bollettino</h3>
              <p className="editorial-body text-foreground/80">
                Articoli, reportage e interviste pubblicati durante l'anno dagli
                autori della rete.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-display font-bold uppercase tracking-wide underline decoration-4 decoration-primary underline-offset-4">
                Sfoglia gli articoli
              </span>
              <ArrowRight size={26} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>

          {/* Podcast */}
          <Link
            to="/la-vostra-voce"
            className="flex-1 border-2 border-foreground bg-card p-6 md:p-7 shadow-brutalist hover:shadow-brutalist-aqua hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
          >
            <div>
              <h3 className="editorial-subheading mb-3 text-primary">La vostra voce</h3>
              <p className="editorial-body text-foreground/80">
                Il podcast del progetto: interviste alle realtà mappate, prodotte
                con radio e piattaforme indipendenti partner.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-display font-bold uppercase tracking-wide underline decoration-4 decoration-primary underline-offset-4 text-primary">
                Ascolta gli episodi
              </span>
              <ArrowRight size={26} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  </div>
);

export default Racconti;
