import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import SEO from "@/components/SEO";

/**
 * Storytelling scroll-based per "Cosa Facciamo".
 * Prima versione visiva: blocchi editoriali alternati (numero grande + titolo + testo)
 * pensati per essere estesi in futuro con i contributi dei coordinatori.
 */
const chapters = [
  {
    num: "01",
    title: "Un archivio che non si accontenta del centro",
    body:
      "Partiamo da una domanda semplice: **dove sono le realtà artistiche indipendenti italiane?** Non nelle grandi retrospettive, non nei circuiti istituzionali. Sono negli spazi off, nei collettivi che cambiano sede ogni due anni, nei luoghi che nascono in una cucina e finiscono per abitare un intero quartiere.",
  },
  {
    num: "02",
    title: "Mappare per non perdere memoria",
    body:
      "Ogni realtà che sparisce senza traccia è **un pezzo di paesaggio culturale che si dissolve**. Costruiamo una cartografia viva: attiva quando c'è, storica quando non c'è più, in ogni caso presente.",
  },
  {
    num: "03",
    title: "Un racconto contro il mainstream",
    body:
      "Non facciamo cronaca. Facciamo **contro-narrazione critica**: interviste, saggi, ricerche, un editoriale annuale curato da voci selezionate. La scena indipendente merita un linguaggio suo, non quello dei comunicati stampa.",
  },
  {
    num: "04",
    title: "Rete, non vetrina",
    body:
      "La mappa non è una directory. È **un punto di partenza per connettere chi fa cose simili in città diverse**: coordinatori, artisti, curatori, ricercatori. Si comincia da un profilo e si finisce in una collaborazione.",
  },
];

const CosaFacciamo = () => {
  const { t } = useTranslation();
  const bullets = (t("what.whyBullets", { returnObjects: true }) as string[]) ?? [];

  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title={t("what.title") + " " + t("what.titleAccent")}
        description={t("what.seoDesc")}
        canonicalPath="/cosa-facciamo"
      />
      <div className="editorial-container space-y-16 md:space-y-24">
        {/* Header */}
        <header className="border-b-2 border-foreground pb-10">
          <h1 className="editorial-heading mb-6">
            {t("what.title")} <span className="text-primary">{t("what.titleAccent")}</span>
          </h1>
          <div className="editorial-body text-foreground/80 space-y-4 max-w-3xl">
            <p>
              <Trans i18nKey="what.intro_html" components={{ strong: <strong className="text-foreground" /> }} />
            </p>
          </div>
        </header>

        {/* Storytelling scroll */}
        <section aria-label="Il progetto in quattro capitoli" className="space-y-12 md:space-y-20">
          {chapters.map((c, i) => {
            const rightAligned = i % 2 === 1;
            return (
              <article
                key={c.num}
                className={`grid md:grid-cols-12 gap-6 md:gap-10 items-start ${
                  rightAligned ? "md:[&>*:first-child]:col-start-6" : ""
                }`}
              >
                <div className={`md:col-span-3 ${rightAligned ? "md:order-2 md:text-right" : ""}`}>
                  <div
                    className="text-[6rem] md:text-[9rem] leading-none tracking-tight text-primary/90 select-none"
                    style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.06em" }}
                    aria-hidden="true"
                  >
                    {c.num}
                  </div>
                </div>
                <div className={`md:col-span-8 space-y-4 ${rightAligned ? "md:order-1" : ""}`}>
                  <h2
                    className="text-2xl md:text-4xl leading-[1.05] tracking-tight"
                    style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.02em" }}
                  >
                    {c.title}
                  </h2>
                  <div className="h-[2px] w-16 bg-foreground" />
                  <p
                    className="editorial-body text-foreground/80 max-w-2xl"
                    dangerouslySetInnerHTML={{
                      __html: c.body.replace(
                        /\*\*([^*]+)\*\*/g,
                        '<strong class="text-foreground">$1</strong>',
                      ),
                    }}
                  />
                </div>
              </article>
            );
          })}
        </section>

        {/* Placeholder — voci dei coordinatori */}
        <section className="brutalist-card p-8 md:p-12 bg-muted/40 border-dashed">
          <div className="micro-label text-primary mb-3">In arrivo</div>
          <h2 className="editorial-subheading mb-4">Le <span className="text-primary">voci</span> dei coordinatori</h2>
          <p className="text-sm md:text-base text-foreground/70 max-w-2xl">
            Presto qui troverai i contributi dei coordinatori del progetto: come è nato,
            perché si è scelto questo approccio, cosa succederà nei prossimi mesi. Uno spazio di racconto
            interno che vogliamo costruire insieme.
          </p>
        </section>

        {/* Why */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-foreground pb-4">
            <h2 className="editorial-subheading">
              <span className="text-primary">{t("what.whyTitle")}</span>
            </h2>
          </div>
          <div className="brutalist-card p-8 bg-primary text-primary-foreground">
            <ul className="space-y-4">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-base leading-relaxed">
                  <Check size={18} className="text-secondary mt-1 shrink-0" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="brutalist-card p-10 md:p-14 text-center">
          <h3 className="editorial-subheading mb-4">{t("what.ctaTitle")}</h3>
          <p className="text-base md:text-lg text-foreground/80 max-w-xl mx-auto mb-8">{t("what.ctaText")}</p>
          <Link to="/contatti" className="btn-brutalist">
            {t("what.ctaButton")} <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default CosaFacciamo;
