import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./LanguageSwitcher";
import NotificationsBell from "./NotificationsBell";
import LogoPittogramma from "./LogoPittogramma";
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  // Link primari nella navbar (ordine richiesto)
  const primaryLinks = [
    { to: "/cosa-facciamo", label: t("nav.what") },
    { to: "/la-rete", label: t("nav.network") },
    { to: "/mappatura", label: t("nav.map") },
    { to: "/magazine", label: t("nav.magazine") },
    { to: "/la-vostra-voce", label: t("nav.voice") },
    { to: "/contatti", label: t("nav.contacts") },
  ];

  useEffect(() => {
    if (!user) { setIsAdmin(false); setAvatarUrl(null); return; }
    const check = async () => {
      const [{ data: roleData }, { data: profile }] = await Promise.all([
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
        supabase.from("profiles").select("avatar_url").eq("user_id", user.id).maybeSingle(),
      ]);
      setIsAdmin(!!roleData);
      setAvatarUrl(profile?.avatar_url ?? null);
    };
    check();

    const channel = supabase
      .channel(`profile-avatar-${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const next = (payload.new as { avatar_url?: string | null })?.avatar_url ?? null;
          setAvatarUrl(next);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "?";


  return (
    <nav
      className="sticky top-0 z-[1000] bg-background/95 backdrop-blur-md border-b-2 border-foreground"
      aria-label={t("nav.home")}
    >
      <div className="editorial-container flex items-center justify-between h-16">
        <Link
          to="/"
          className="font-display flex items-center gap-2 text-xl tracking-tight text-foreground uppercase hover:text-primary transition-colors"
          style={{ fontVariationSettings: "'wght' 700", letterSpacing: "-0.02em" }}
          aria-label="Il Bel Paese — home"
        >
          <LogoPittogramma className="w-8 h-8 text-primary" flameClassName="text-orange-500" />
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
          </div>

          {user ? (
            <>
              <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t("nav.userMenu")}
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
                    <UserIcon size={14} className="mr-2" /> {t("nav.personalArea")}
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
                ◎ {t("nav.personalArea")}
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
