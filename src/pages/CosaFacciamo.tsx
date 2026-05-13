import { MapPin, Megaphone, Search, ArrowRight } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import SEO from "@/components/SEO";

const pillars = [
  { icon: MapPin, key: "mapping" },
  { icon: Megaphone, key: "promotion" },
  { icon: Search, key: "research" },
] as const;

const how = ["showcase", "archive", "magazine", "update"] as const;

const CosaFacciamo = () => {
  const { t } = useTranslation();
  return (
    <div className="py-20">
      <SEO
        title={t("what.title") + " " + t("what.titleAccent")}
        description={t("what.seoDesc")}
        canonicalPath="/cosa-facciamo"
      />
      <div className="editorial-container">
        <div className="max-w-3xl mb-16">
          <h1 className="editorial-heading mb-6">
            {t("what.title")} <span className="italic text-primary">{t("what.titleAccent")}</span>
          </h1>
          <p className="editorial-body text-muted-foreground">
            <Trans i18nKey="what.intro_html" components={{ strong: <strong className="text-foreground" /> }} />
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {pillars.map((p) => (
            <div key={p.key} className="p-8 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
              <p.icon className="text-primary mb-4" size={28} />
              <h3 className="font-display text-xl font-semibold mb-3">{t(`what.pillars.${p.key}.title`)}</h3>
              <p className="font-body text-muted-foreground leading-relaxed">{t(`what.pillars.${p.key}.desc`)}</p>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <h2 className="editorial-subheading mb-8">
            <span className="italic text-primary">{t("what.howIntro")}</span> {t("what.howSuffix")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {how.map((h) => (
              <div key={h} className="p-6 rounded-lg bg-card border border-border">
                <h4 className="font-display text-lg font-semibold mb-2">{t(`what.how.${h}.title`)}</h4>
                <p className="font-body text-sm text-muted-foreground">{t(`what.how.${h}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="editorial-subheading mb-8">
            <span className="italic text-primary">{t("what.whyTitle")}</span>
          </h2>
          <div className="p-8 rounded-lg bg-secondary/10 border border-secondary/20">
            <p className="font-body text-muted-foreground leading-relaxed">{t("what.whyText")}</p>
          </div>
        </div>

        <div className="p-10 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
          <h3 className="font-display text-2xl font-semibold mb-4">{t("what.ctaTitle")}</h3>
          <p className="font-body text-muted-foreground max-w-xl mx-auto mb-6">{t("what.ctaText")}</p>
          <a
            href="mailto:info@ilbelpaese.it"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-body font-medium hover:opacity-90 transition-opacity"
          >
            {t("what.ctaButton")} <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CosaFacciamo;
