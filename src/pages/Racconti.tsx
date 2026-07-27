import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const Racconti = () => (
  <div className="bg-background py-16 md:py-20">
    <SEO
      title="Racconti — Il Bel Paese"
      description="Editoriale, magazine libero e podcast: tutte le forme del racconto della scena indipendente italiana."
      canonicalPath="/racconti"
    />
    <div className="editorial-container space-y-12 md:space-y-16">
      {/* Header */}
      <header className="border-b-2 border-foreground pb-6">
        <h1 className="editorial-heading">Racconti</h1>
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mt-6">
          <p className="max-w-md text-lg md:text-xl font-body font-medium uppercase leading-none text-foreground">
            Tre voci. Un unico paese.<br />Scegli da dove iniziare.
          </p>
          <span className="self-start md:self-auto text-sm font-bold uppercase tracking-[0.2em] border-2 border-foreground px-3 py-1 bg-secondary text-foreground">
            Hub · 2026
          </span>
        </div>
      </header>

      {/* Voices grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Editoriale — grande, autoritativo */}
        <Link
          to="/editoriale"
          className="md:col-span-7 border-4 border-foreground bg-background relative flex flex-col justify-between p-8 md:p-10 shadow-[12px_12px_0_hsl(var(--primary))] hover:-translate-x-1 hover:-translate-y-1 transition-transform group"
        >
          <span
            aria-hidden="true"
            className="absolute -left-6 top-16 -rotate-90 origin-right hidden md:block"
          >
            <span className="bg-foreground text-background px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]">
              Annuale · Curato
            </span>
          </span>

          <div>
            <div className="flex justify-between items-start">
              <span
                className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tighter"
                style={{ textShadow: "2px 2px 0 hsl(var(--primary))" }}
              >
                Vol. 01
              </span>
              <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center font-display font-bold text-xl">
                E
              </div>
            </div>

            <h2
              className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter leading-[0.85] mt-8 mb-6"
              style={{ fontVariationSettings: "'wght' 700" }}
            >
              Editoriale
            </h2>
            <p className="text-base md:text-lg max-w-sm font-body font-medium border-l-4 border-primary pl-4 leading-relaxed">
              Un solo tema, sviscerato con rigore. La selezione annuale
              curata dai coordinatori attorno a una domanda che attraversa
              la scena indipendente.
            </p>
          </div>

          <div className="mt-10 md:mt-12 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-3 bg-foreground text-background px-6 md:px-8 py-4 text-base md:text-lg font-display font-bold uppercase tracking-tighter group-hover:bg-primary transition-colors">
              Entra nell'archivio
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="micro-label hidden md:inline">Ed. 2026</span>
          </div>
        </Link>

        {/* Colonna destra */}
        <div className="md:col-span-5 flex flex-col gap-8">
          {/* Magazine libero */}
          <Link
            to="/magazine"
            className="flex-1 border-2 border-foreground bg-card p-6 md:p-7 shadow-brutalist hover:shadow-brutalist-aqua hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-foreground" aria-hidden="true" />
                <span className="micro-label">Contributi liberi</span>
              </div>
              <h3
                className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tighter leading-none mb-3"
                style={{ fontVariationSettings: "'wght' 700" }}
              >
                Magazine Libero
              </h3>
              <p className="text-sm md:text-base font-body leading-snug text-foreground/80">
                Pluralità di voci, interviste e reportage dalla rete. Uno
                spazio aperto agli autori per raccontare le realtà che
                frequentano.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-display font-bold uppercase tracking-wide underline decoration-4 decoration-secondary underline-offset-4">
                Scopri
              </span>
              <ArrowRight
                size={26}
                strokeWidth={3}
                className="group-hover:translate-x-2 transition-transform"
              />
            </div>
          </Link>

          {/* Podcast */}
          <Link
            to="/la-vostra-voce"
            className="flex-1 border-2 border-foreground bg-foreground text-background p-6 md:p-7 shadow-[8px_8px_0_hsl(var(--secondary))] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <h3
                className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tighter leading-none"
                style={{ fontVariationSettings: "'wght' 700" }}
              >
                Podcast
              </h3>
              <div className="flex gap-1 items-end h-6" aria-hidden="true">
                <div className="w-1.5 h-4 bg-secondary animate-pulse" />
                <div className="w-1.5 h-6 bg-secondary" />
                <div className="w-1.5 h-3 bg-secondary animate-pulse" />
                <div className="w-1.5 h-5 bg-secondary" />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm md:text-base font-body italic text-background/80 mb-5 leading-snug">
                "La vostra voce": interviste audio e video prodotte con
                radio e piattaforme indipendenti alleate.
              </p>
              <span className="inline-flex items-center gap-2 border-2 border-secondary px-4 py-2 text-sm font-display font-bold uppercase tracking-[0.15em] text-secondary group-hover:bg-secondary group-hover:text-foreground transition-colors">
                Ascolta ora
                <ArrowRight size={16} strokeWidth={3} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Metadata footer strip */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40 font-mono">
        <span>Racconti · Hub</span>
        <span aria-hidden="true">/</span>
        <span>Editorial Brutalist v2</span>
        <span aria-hidden="true">/</span>
        <span>Il Bel Paese</span>
      </div>
    </div>
  </div>
);

export default Racconti;
