import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, LogOut, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationsBell from "./NotificationsBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  // Link primari nella navbar (cuore pulsante del progetto)
  const primaryLinks = [
    { to: "/mappatura", label: t("nav.map") },
    { to: "/la-rete", label: "La nostra rete" },
    { to: "/magazine", label: t("nav.magazine") },
    { to: "/cosa-facciamo", label: t("nav.what") },
    { to: "/contatti", label: "Contatti" },
  ];

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    const check = async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!!data);
    };
    check();
  }, [user]);

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <nav
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b-2 border-foreground"
      aria-label={t("nav.home")}
    >
      <div className="editorial-container flex items-center justify-between h-16">
        <Link
          to="/"
          className="text-xl tracking-tight text-foreground uppercase hover:text-primary transition-colors"
          style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.02em" }}
          aria-label="Il Bel Paese — home"
        >
          ILBELPAESE
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">

          {primaryLinks.map((link) => {
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
            <>
              <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Menu utente"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-body font-semibold hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {userInitial}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                <DropdownMenuLabel className="font-body text-xs text-muted-foreground truncate">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/area-personale" className="cursor-pointer">
                    <UserIcon size={14} className="mr-2" /> Area personale
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut size={14} className="mr-2" /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <Link
              to="/login"
              aria-label={t("nav.login")}
              title={t("nav.login")}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <UserIcon size={18} />
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
          {primaryLinks.map((link) => {
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
            <div className="pt-2 border-t border-border/60 space-y-2">
              <Link
                to="/area-personale"
                onClick={() => setOpen(false)}
                className="block font-body text-sm font-medium text-secondary uppercase"
              >
                ◎ Area personale
              </Link>
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="block w-full text-left font-body text-sm font-medium text-muted-foreground uppercase"
              >
                {t("nav.logout")}
              </button>
            </div>
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
