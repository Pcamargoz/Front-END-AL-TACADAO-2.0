import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const label = theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <span className="icon-stack" aria-hidden="true">
        <Sun size={20} className="icon-sun" strokeWidth={2} />
        <Moon size={20} className="icon-moon" strokeWidth={2} />
      </span>
    </button>
  );
}
