const THEME_STORAGE_KEY = "portfolio-theme";

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme, themeToggle) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-theme", isDark);
  document.documentElement.style.colorScheme = theme;

  themeToggle.checked = isDark;
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );
}

export function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");

  if (!(themeToggle instanceof HTMLInputElement)) return;

  applyTheme(getInitialTheme(), themeToggle);

  themeToggle.addEventListener("change", () => {
    const theme = themeToggle.checked ? "dark" : "light";

    applyTheme(theme, themeToggle);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  });
}
