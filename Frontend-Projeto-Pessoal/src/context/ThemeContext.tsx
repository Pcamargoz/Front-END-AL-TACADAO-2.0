import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

interface ThemeContextValue {
  theme: Theme;             // resolved theme actually applied
  preference: ThemePreference; // user choice (may be "system")
  setPreference: (p: ThemePreference) => void;
  toggle: () => void;
}

const STORAGE_KEY = "altacadao_theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  // Hint to UA for form controls / scrollbars
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => readStoredPreference());
  const [theme, setTheme] = useState<Theme>(() => {
    const pref = readStoredPreference();
    return pref === "system" ? getSystemTheme() : pref;
  });

  // Apply on mount + whenever resolved theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Recompute resolved theme when preference changes
  useEffect(() => {
    const resolved = preference === "system" ? getSystemTheme() : preference;
    setTheme(resolved);
  }, [preference]);

  // Track system changes only when in "system" mode
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    if (p === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, p);
  };

  const toggle = () => setPreference(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
