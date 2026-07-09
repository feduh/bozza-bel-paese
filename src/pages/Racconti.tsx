import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Newspaper, Mic } from "lucide-react";
import SEO from "@/components/SEO";

const sezioni = [
  {
    to: "/editoriale",
    label: "Editoriale",
    icon: BookOpen,
    desc: "La selezione annuale curata attorno a un tema: un percorso di lettura pensato dai coordinatori per orientare lo sguardo sulla scena indipendente.",
    inverted: false,
  },
  {
    to: "/magazine",
    label: "Magazine libero",
    icon: Newspaper,
    desc: "Contributi liberi, interviste e reportage dalla rete: uno spazio aperto agli autori per raccontare le realtà che frequentano.",
    inverted: true,
  },
  {
    to: "/la-vostra-voce",
    label: "Podcast / La vostra voce",
    icon: Mic,
    desc: "Interviste audio e video prodotte con radio e piattaforme indipendenti alleate. Testimonianze orali dalla scena.",
    inverted: false,
  },
];

const Racconti = () => (
  <div className="bg-background py-16 md:py-20">
    <SEO
      title="Racconti — Il Bel Paese"
      description="Editoriale, magazine libero e podcast: tutte le forme del racconto della scena indipendente italiana."
      canonicalPath="/racconti"
    />
    <div className="editorial-container space-y-12 md:space-y-16">
      <header className="border-b-2 border-foreground pb-10">
        <h1 className="editorial-heading mb-6">
          <span className="text-primary">Racconti</span>
          <br />
          della scena indipendente
        </h1>
        <p className="editorial-body text-foreground/80 max-w-3xl">
          Tre voci diverse per uno stesso paesaggio: l'editoriale curato,
          il magazine libero e il podcast. Scegli da dove iniziare.
        </p>
      </header>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sezioni.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to}
                className={`brutalist-card p-8 flex flex-col gap-5 group ${
                  s.inverted ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                <Icon size={28} aria-hidden="true" />
                <h2
                  className="text-2xl md:text-3xl uppercase leading-[0.95] tracking-tight break-words"
                  style={{ fontVariationSettings: "'wght' 700" }}
                >
                  {s.label}
                </h2>
                <p className={`text-sm leading-relaxed ${s.inverted ? "text-primary-foreground/90" : "text-foreground/80"}`}>
                  {s.desc}
                </p>
                <div className={`h-[2px] w-full ${s.inverted ? "bg-primary-foreground/30" : "bg-foreground"}`} />
                <div className="flex items-center justify-between">
                  <span className="micro-label">Entra</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  </div>
);

export default Racconti;
