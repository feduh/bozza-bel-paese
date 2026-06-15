import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import heroImage from "@/assets/hero-art.jpg";
import SEO from "@/components/SEO";
import SmartImage from "@/components/SmartImage";
import CountUp from "@/components/CountUp";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { t } = useTranslation();

  const { data: liveStats } = useQuery({
    queryKey: ["home-stats"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_stats");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        mapped: row?.mapped ?? 0,
        regions: row?.regions ?? 0,
        members: row?.members ?? 0,
        articles: row?.articles ?? 0,
      };
    },
  });

  const features = [
    { num: "01", section: "Cartografia", key: "mapping", link: "/mappatura", inverted: false },
    { num: "02", section: "Network",     key: "community", link: "/la-rete", inverted: true },
    { num: "03", section: "Editoria",    key: "stories",   link: "/magazine", inverted: false },
  ] as const;

  const stats = [
    { num: liveStats?.mapped ?? null, key: "mapped", color: "text-foreground" },
    { num: liveStats?.regions ?? null, key: "regions", color: "text-primary" },
    { num: liveStats?.members ?? null, key: "members", color: "text-foreground" },
    { num: liveStats?.articles ?? null, key: "articles", color: "text-secondary" },
  ] as const;

  return (
    <div className="bg-background">
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

      <div className="editorial-container py-12 md:py-20 space-y-16 md:space-y-24">

        {/* ============ HERO ============ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-block bg-card brutalist-border px-3 py-1 micro-label">
              Archivio Editoriale · Vol. 01
            </div>

            <h1 className="editorial-heading">
              {t("home.title")} <br />
              <span className="text-primary">{t("home.titleAccent")}</span>{" "}
              <span className="ink-highlight">d'Italia</span>
            </h1>

            <p className="editorial-body max-w-xl">
              {t("home.lead")}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/mappatura" className="btn-brutalist shadow-brutalist hover:shadow-brutalist-aqua transition-shadow">
                {t("home.ctaMap")} <ArrowRight size={16} />
              </Link>
              <Link to="/la-rete" className="btn-brutalist-outline">
                {t("home.ctaAbout")}
              </Link>
            </div>
          </div>

          {/* Visual area destra */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] brutalist-border bg-foreground overflow-hidden relative shadow-brutalist-lg">
              <SmartImage
                src={heroImage}
                alt="Arte contemporanea italiana"
                priority
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Scanline overlay */}
              <div
                className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--secondary) / 0.4) 3px)",
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <span className="micro-label text-background">COORD · 41.9028° N, 12.4964° E</span>
              </div>
            </div>
            {/* Badge acqua angolo */}
            <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-20 h-20 md:w-24 md:h-24 bg-secondary brutalist-border flex items-center justify-center text-center micro-label leading-tight">
              Live<br/>Archive
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-foreground pb-4">
            <h2 className="editorial-subheading">
              {t("home.sectionTitle")}{" "}
              <span className="text-primary">{t("home.sectionTitleAccent")}</span>
            </h2>
            <span className="micro-label hidden md:block">§ 02 / Sezioni</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Link
                key={f.key}
                to={f.link}
                className={`brutalist-card p-8 flex flex-col gap-5 group ${
                  f.inverted ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                <div className={`micro-label ${f.inverted ? "text-secondary" : "text-primary"}`}>
                  {f.num} // {f.section}
                </div>
                <h3 className="text-3xl md:text-4xl uppercase leading-none tracking-tight" style={{ fontVariationSettings: "'wght' 700" }}>
                  {t(`home.features.${f.key}.title`)}
                </h3>
                <p className={`text-sm leading-relaxed ${f.inverted ? "text-primary-foreground/90" : "text-foreground/80"}`}>
                  {t(`home.features.${f.key}.desc`)}
                </p>
                <div className={`h-[2px] w-full ${f.inverted ? "bg-primary-foreground/30" : "bg-foreground"}`} />
                <div className="flex items-center justify-between">
                  <span className="micro-label">{t("home.discover")}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section className="border-y-2 border-foreground py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.key} className="flex flex-col">
                <span
                  className={`text-4xl md:text-6xl leading-none ${s.color}`}
                  style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.04em" }}
                >
                  <CountUp end={s.num} />
                </span>
                <span className="micro-label mt-3 text-muted-foreground">
                  {t(`home.stats.${s.key}`)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ============ WORDMARK FOOTER ACCENT ============ */}
        <div className="w-full flex flex-wrap justify-between items-center gap-2 text-xs uppercase tracking-[0.4em] border-b-2 border-foreground pb-3">
          <span style={{ fontVariationSettings: "'wght' 700" }}>ILBELPAESE</span>
          <span className="text-muted-foreground hidden sm:inline">Italian Art Archive</span>
          <span className="text-muted-foreground">MMXXVI</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
