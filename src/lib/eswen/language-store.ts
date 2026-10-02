import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "id";

type LanguageState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === "en" ? "id" : "en" }),
    }),
    {
      name: "eswen-lang",
      // Only persist the lang value, not the functions
      partialize: (state) => ({ lang: state.lang }),
    }
  )
);
