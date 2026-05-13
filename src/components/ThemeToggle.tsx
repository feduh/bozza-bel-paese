import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      aria-label={t("common.theme.toggle")}
      title={t("common.theme.toggle")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
    >
      {mounted ? (
        isDark ? <Sun size={16} /> : <Moon size={16} />
      ) : (
        <Moon size={16} />
      )}
    </button>
  );
};

export default ThemeToggle;
