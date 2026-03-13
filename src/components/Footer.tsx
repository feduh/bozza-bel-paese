import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12 mt-20">
    <div className="editorial-container">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-lg font-bold text-primary mb-3">Il Bel Paese</h3>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Mappatura delle realtà artistiche italiane: nomadi, con sede e scomparse.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Navigazione</h4>
          <div className="space-y-2">
            {[
              { to: "/chi-siamo", label: "Chi Siamo" },
              { to: "/cosa-facciamo", label: "Cosa Facciamo" },
              { to: "/mappatura", label: "Mappatura" },
              { to: "/blog", label: "Blog" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold mb-3">Contatti</h4>
          <p className="text-sm text-muted-foreground">info@artivive.it</p>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Arti Vive. Tutti i diritti riservati.
      </div>
    </div>
  </footer>
);

export default Footer;
