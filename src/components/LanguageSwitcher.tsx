import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/i18n";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "it";

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center h-8 rounded-full border border-border bg-background overflow-hidden font-heading text-[11px] tracking-widest"
    >
      {supportedLanguages.map((lang) => {
        const isActive = current === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => i18n.changeLanguage(lang.code)}
            aria-pressed={isActive}
            className={`px-2.5 h-full uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
              isActive
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.code}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
