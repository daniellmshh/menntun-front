import { create } from "zustand";

export type Language = "en" | "es";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "es", // Default to Spanish
  setLanguage: (language) => set({ language }),
}));
