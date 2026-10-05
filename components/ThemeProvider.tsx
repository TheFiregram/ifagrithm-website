"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "../lib/theme";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

function readPreference(value: string | null): Theme | null {
  return value === "dark" || value === "light" ? value : null;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const preference = useRef<Theme | null>(null);

  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }, []);

  useEffect(() => {
    try {
      preference.current = readPreference(localStorage.getItem(THEME_STORAGE_KEY));
    } catch {}

    const syncTheme = () => applyTheme(preference.current ?? DEFAULT_THEME);
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      preference.current = readPreference(event.newValue);
      syncTheme();
    };

    syncTheme();
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener("storage", syncStorage);
    };
  }, [applyTheme]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    preference.current = next;
    applyTheme(next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch {}
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
