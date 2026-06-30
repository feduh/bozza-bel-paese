import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LogoPittogramma from "@/components/LogoPittogramma";

const Footer = () => {
  const { t } = useTranslation();
  const navLinks = [
    { to: "/cosa-facciamo", label: t("nav.what") },
    { to: "/la-rete", label: t("nav.network") },
    { to: "/mappatura", label: t("nav.map") },
    { to: "/magazine", label: t("nav.magazine") },
    { to: "/la-vostra-voce", label: t("nav.voice") },
    { to: "/contatti", label: t("nav.contacts") },
  ];

  const legalLinks = [
    { to: "/privacy", label: t("footer.privacy") },
    { to: "/cookie-policy", label: t("footer.cookies") },
    { to: "/termini", label: t("footer.terms") },
  ];

  return (
    <footer className="border-t border-border bg-card py-12 mt-20">
      <div className="editorial-container">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-5 md:pr-8">
            <div className="flex items-center gap-2 mb-3">
              <LogoPittogramma className="w-7 h-7 text-foreground" flameClassName="text-foreground" />
              <h3 className="font-display text-lg font-bold text-foreground tracking-tight uppercase">ILBELPAESE</h3>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t("footer.tagline")}
            </p>
          </div>
          <div className="md:col-span-3">
            <h4 className="font-display text-sm font-semibold mb-3">{t("footer.navigation")}</h4>
            <div className="space-y-2">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-display text-sm font-semibold mb-3">{t("footer.legal")}</h4>
            <div className="space-y-2">
              {legalLinks.map((l) => (
                <Link key={l.to} to={l.to} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-display text-sm font-semibold mb-3">{t("footer.contacts")}</h4>
            <p className="text-sm text-muted-foreground break-words">info@ilbelpaese.it</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground space-y-1">
          <p>© {new Date().getFullYear()} Il Bel Paese. {t("footer.rights")}</p>
          <p>
            Sito realizzato da{" "}
            <span className="font-medium text-foreground">Federica Gaglianone</span>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
