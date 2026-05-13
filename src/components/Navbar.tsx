import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, LogOut, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/chi-siamo", label: t("nav.about") },
    { to: "/cosa-facciamo", label: t("nav.what") },
    { to: "/mappatura", label: t("nav.map") },
    { to: "/magazine", label: t("nav.magazine") },
  ];

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    const check = async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    check();
  }, [user]);

  return (
    <nav
      className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border"
      aria-label={t("nav.home")}
    >
      <div className="editorial-container flex items-center justify-between h-16">
        <Link
          to="/"
          className="font-display text-xl font-bold text-primary tracking-tight"
          aria-label="Il Bel Paese — home"
        >
          Il Bel Paese
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? "page" : undefined}
                className={`font-body text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/area-personale"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/15 text-secondary text-xs font-body font-medium hover:bg-secondary/25 transition-colors"
              >
                <UserIcon size={12} /> Area personale
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-body font-medium hover:bg-primary/20 transition-colors"
                >
                  <Shield size={12} /> {t("nav.admin")}
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-body font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                <LogOut size={14} /> {t("nav.logout")}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="text-foreground"
            aria-label={open ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block font-body text-sm font-medium uppercase ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <>
              <Link
                to="/area-personale"
                onClick={() => setOpen(false)}
                className="block font-body text-sm font-medium text-secondary uppercase"
              >
                ◎ Area personale
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="block font-body text-sm font-medium text-primary uppercase"
                >
                  ⚙ {t("nav.admin")}
                </Link>
              )}
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="block w-full text-left font-body text-sm font-medium text-muted-foreground uppercase"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium text-center"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
