export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "ifagrithm-theme";

// Resolve the preference before the first paint to avoid flashing the wrong theme.
export const themeBootstrapScript = `(() => {
  let saved;
  try { saved = localStorage.getItem("${THEME_STORAGE_KEY}"); } catch {}
  const theme = saved === "light" || saved === "dark"
    ? saved
    : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
})();`;
