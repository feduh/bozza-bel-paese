import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supportedLanguages } from "@/i18n";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current =
    supportedLanguages.find((l) => l.code === i18n.language) ??
    supportedLanguages.find((l) => i18n.language?.startsWith(l.code)) ??
    supportedLanguages[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("common.language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-md border border-border text-xs font-body font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors uppercase tracking-wide"
      >
        <Globe size={14} aria-hidden />
        {current.code}
        <ChevronDown size={12} aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("common.language")}
          className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-popover shadow-lg overflow-hidden z-50"
        >
          {supportedLanguages.map((l) => (
            <li key={l.code}>
            <button
              role="option"
              aria-selected={current.code === l.code}
              onClick={() => {
                i18n.changeLanguage(l.code);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-body hover:bg-muted ${
                current.code === l.code ? "text-primary font-medium bg-muted/50" : ""
              }`}
            >
              <span aria-hidden>{l.flag}</span>
              {l.label}
            </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
