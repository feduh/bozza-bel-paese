import { Link } from "react-router-dom";
import { MapPin, Megaphone, Search, ArrowRight, RefreshCw, Sliders, Share2, Check } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import SEO from "@/components/SEO";

const pillars = [
  { icon: MapPin, key: "mapping", withHtml: true },
  { icon: Megaphone, key: "promotion", withHtml: false },
  { icon: Search, key: "research", withHtml: false },
] as const;

const howIcons: Record<string, typeof RefreshCw> = {
  update: RefreshCw,
  personalized: Sliders,
  milestones: Share2,
};
const how = ["update", "personalized", "milestones"] as const;

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
      <div className="editorial-container space-y-16 md:space-y-20">
        {/* Header */}
        <header className="border-b-2 border-foreground pb-10">
          <div className="micro-label text-primary mb-4">§ 01 / Cosa facciamo</div>
          <h1 className="editorial-heading mb-6">
            {t("what.title")} <span className="text-primary">{t("what.titleAccent")}</span>
          </h1>
          <div className="editorial-body text-foreground/80 space-y-4 max-w-3xl">
            <p>
              <Trans i18nKey="what.intro_html" components={{ strong: <strong className="text-foreground" /> }} />
            </p>
            <p>
              <Trans i18nKey="what.intro_html2" components={{ strong: <strong className="text-foreground" /> }} />
            </p>
          </div>
        </header>

        {/* Pillars */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-foreground pb-4">
            <h2 className="editorial-subheading">I <span className="text-primary">pilastri</span></h2>
            <span className="micro-label hidden md:block">§ 02 / Pilastri</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <div key={p.key} className="brutalist-card p-8 flex flex-col gap-4">
                <div className="micro-label text-primary">0{i + 1} // {p.key}</div>
                <p.icon className="text-foreground" size={28} aria-hidden="true" />
                <h3 className="text-2xl uppercase leading-none tracking-tight" style={{ fontVariationSettings: "'wght' 700" }}>
                  {t(`what.pillars.${p.key}.title`)}
                </h3>
                <div className="h-[2px] w-12 bg-foreground" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  {p.withHtml ? (
                    <Trans
                      i18nKey={`what.pillars.${p.key}.desc_html`}
                      components={{ strong: <strong className="text-foreground" /> }}
                    />
                  ) : (
                    t(`what.pillars.${p.key}.desc`)
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-foreground pb-4">
            <h2 className="editorial-subheading">
              <span className="text-primary">{t("what.howIntro")}</span> {t("what.howSuffix")}
            </h2>
            <span className="micro-label hidden md:block">§ 03 / Metodo</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {how.map((h, i) => {
              const Icon = howIcons[h];
              return (
                <div key={h} className="brutalist-card p-6 flex flex-col gap-3">
                  <div className="micro-label text-primary">0{i + 1}</div>
                  <Icon className="text-foreground" size={22} aria-hidden="true" />
                  <h4 className="text-lg uppercase tracking-tight" style={{ fontVariationSettings: "'wght' 700" }}>
                    {t(`what.how.${h}.title`)}
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{t(`what.how.${h}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-foreground pb-4">
            <h2 className="editorial-subheading">
              <span className="text-primary">{t("what.whyTitle")}</span>
            </h2>
            <span className="micro-label hidden md:block">§ 04 / Perché</span>
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
          <div className="micro-label text-primary mb-4">§ 05 / Unisciti</div>
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
