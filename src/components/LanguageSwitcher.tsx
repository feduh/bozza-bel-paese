import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { supportedLanguages } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "it";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Language"
        className="inline-flex items-center gap-1 font-heading text-[13px] tracking-widest uppercase text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded-sm px-1"
      >
        {current}
        <ChevronDown size={12} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[80px]">
        {supportedLanguages.map((lang) => {
          const isActive = current === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              aria-pressed={isActive}
              className={`font-heading text-[13px] tracking-widest uppercase cursor-pointer justify-center ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {lang.code}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
