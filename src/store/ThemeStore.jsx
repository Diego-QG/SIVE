import { create } from "zustand";
import { Dark, Light } from "../styles/themes";

export const THEME_STORAGE_KEY = "sive-theme-preference";

const prefersDarkQuery = "(prefers-color-scheme: dark)";
const isBrowser = typeof window !== "undefined";

const themeFromSystem = () => {
  if (!isBrowser || typeof window.matchMedia !== "function") {
    return "dark";
  }

  return window.matchMedia(prefersDarkQuery).matches ? "dark" : "light";
};

const themeFromStorage = () => {
  if (!isBrowser || typeof window.localStorage === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  return null;
};

const resolveThemeStyle = (theme) => (theme === "light" ? Light : Dark);

const initialTheme = themeFromStorage() ?? themeFromSystem();

export const useThemeStore = create((set) => ({
  theme: initialTheme,
  themeStyle: resolveThemeStyle(initialTheme),
  setTheme: (nextTheme) =>
    set(() => {
      const theme = nextTheme === "light" ? "light" : "dark";
      return { theme, themeStyle: resolveThemeStyle(theme) };
    }),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "light" ? "dark" : "light";
      return { theme, themeStyle: resolveThemeStyle(theme) };
    }),
}));