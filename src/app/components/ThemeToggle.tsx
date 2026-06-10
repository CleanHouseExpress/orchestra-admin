import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

export function ThemeToggle() {
  const { colors, theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className="fixed top-4 right-4 z-50 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        width: "40px",
        height: "40px",
        background: colors.card,
        border: `1px solid ${colors.borderStrong}`,
        color: colors.textSecondary,
        boxShadow: theme === "light" ? "0 2px 12px rgba(0,0,0,0.1)" : "0 2px 12px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
