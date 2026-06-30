import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark", // Default to dark theme as per original design
      setTheme: (theme) => {
        set({ theme });
        // Also update the document class immediately when changed
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(theme);
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },
    }),
    {
      name: "menntun-theme-storage", // unique name for localStorage key
    }
  )
);
