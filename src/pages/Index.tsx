import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Users, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-art.jpg";
import SEO from "@/components/SEO";
import SmartImage from "@/components/SmartImage";

const Index = () => {
  const { t } = useTranslation();
  const features = [
    { icon: MapPin, key: "mapping", link: "/mappatura" },
    { icon: Users, key: "community", link: "/chi-siamo" },
    { icon: BookOpen, key: "stories", link: "/magazine" },
  ] as const;
  const stats = [
    { num: "150+", key: "mapped" },
    { num: "18", key: "regions" },
    { num: "45", key: "vanished" },
    { num: "30+", key: "articles" },
  ] as const;

  return (
    <div>
      <SEO
        title="Il Bel Paese — Mappatura delle realtà artistiche italiane"
        description={t("home.lead")}
        canonicalPath="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Il Bel Paese",
          url: "https://il-bel-paese.lovable.app",
          description: t("home.lead"),
          inLanguage: "it-IT",
        }}
      />
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage
            src={heroImage}
            alt="Arte murale italiana"
            priority
            wrapperClassName="w-full h-full"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="relative editorial-container">
          <div className="max-w-2xl">
            <h1 className="editorial-heading text-primary-foreground mb-6 leading-tight">
              {t("home.title")}<br />
              <span className="italic text-accent">{t("home.titleAccent")}</span>
            </h1>
            <p className="editorial-body text-primary-foreground/80 mb-8 max-w-lg">
              {t("home.lead")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/mappatura"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-body font-medium hover:opacity-90 transition-opacity"
              >
                {t("home.ctaMap")} <ArrowRight size={18} />
              </Link>
              <Link
                to="/chi-siamo"
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary-foreground/30 text-primary-foreground rounded-md font-body font-medium hover:bg-primary-foreground/10 transition-colors"
              >
                {t("home.ctaAbout")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="editorial-container">
          <h2 className="editorial-subheading text-center mb-16">
            {t("home.sectionTitle")} <span className="italic text-primary">{t("home.sectionTitleAccent")}</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((item) => (
              <Link key={item.key} to={item.link} className="group p-8 rounded-lg bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg">
                <item.icon className="text-primary mb-4" size={28} />
                <h3 className="font-display text-xl font-semibold mb-3">{t(`home.features.${item.key}.title`)}</h3>
                <p className="font-body text-muted-foreground leading-relaxed">{t(`home.features.${item.key}.desc`)}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  {t("home.discover")} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card border-y border-border">
        <div className="editorial-container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.key}>
              <div className="font-display text-3xl md:text-4xl font-bold text-primary">{s.num}</div>
              <div className="font-body text-sm text-muted-foreground mt-1">{t(`home.stats.${s.key}`)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
