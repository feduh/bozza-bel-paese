import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/chi-siamo", label: "Chi Siamo" },
  { to: "/cosa-facciamo", label: "Cosa Facciamo" },
  { to: "/mappatura", label: "Mappatura" },
  { to: "/blog", label: "Blog" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="editorial-container flex items-center justify-between h-16">
        <Link to="/" className="font-display text-xl font-bold text-primary tracking-tight">
          Il Bel Paese
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-body text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-body font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <LogOut size={14} /> Esci
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Accedi
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block font-body text-sm font-medium uppercase ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="block w-full text-left font-body text-sm font-medium text-muted-foreground uppercase"
            >
              Esci
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium text-center"
            >
              Accedi
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
