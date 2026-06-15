import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/i18n";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "it";

  return (
    <div className="flex items-center gap-0">
      {supportedLanguages.map((lang, idx) => {
        const isActive = current === lang.code;
        return (
          <div key={lang.code} className="flex items-center">
            {idx > 0 && (
              <span className="text-border select-none mx-1 text-[10px]">|</span>
            )}
            <button
              type="button"
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`
                font-heading text-[13px] tracking-widest uppercase transition-colors
                ${isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-primary"
                }
              `}
              aria-label={lang.label}
              aria-pressed={isActive}
            >
              {lang.code}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;