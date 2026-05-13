import { useTranslation, Trans } from "react-i18next";
import SEO from "@/components/SEO";

const audiences = ["indie", "researchers", "institutions"] as const;

const ChiSiamo = () => {
  const { t } = useTranslation();
  return (
    <div className="py-20">
      <SEO title={t("about.title") + " " + t("about.titleAccent")} description={t("about.seoDesc")} canonicalPath="/chi-siamo" />
      <div className="editorial-container max-w-3xl">
        <h1 className="editorial-heading mb-8">
          {t("about.title")} <span className="italic text-primary">{t("about.titleAccent")}</span>
        </h1>

        <div className="space-y-6 editorial-body text-muted-foreground">
          <p><Trans i18nKey="about.p1_html" components={{ strong: <strong className="text-foreground" /> }} /></p>
          <p><Trans i18nKey="about.p2_html" components={{ strong: <strong className="text-foreground" /> }} /></p>
          <p>{t("about.p3")}</p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-lg bg-card border border-border">
            <h3 className="font-display text-xl font-semibold mb-3">{t("about.missionTitle")}</h3>
            <p className="font-body text-muted-foreground">{t("about.missionDesc")}</p>
          </div>
          <div className="p-8 rounded-lg bg-card border border-border">
            <h3 className="font-display text-xl font-semibold mb-3">{t("about.visionTitle")}</h3>
            <p className="font-body text-muted-foreground">{t("about.visionDesc")}</p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="editorial-subheading mb-8">
            {t("about.forTitle")} <span className="italic text-primary">{t("about.forTitleAccent")}</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((a) => (
              <div key={a} className="p-6 rounded-lg bg-card border border-border">
                <h4 className="font-display text-lg font-semibold mb-2">{t(`about.audiences.${a}.title`)}</h4>
                <p className="font-body text-sm text-muted-foreground">{t(`about.audiences.${a}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiSiamo;
