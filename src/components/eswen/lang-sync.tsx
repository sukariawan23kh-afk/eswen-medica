"use client";

import { useEffect } from "react";
import { useLanguage } from "@/lib/eswen/language-store";

/**
 * Keeps the <html lang="..."> attribute in sync with the user's chosen
 * language (stored in localStorage via the Zustand persist middleware).
 * Renders nothing visible.
 */
export function LangSync() {
  const lang = useLanguage((s) => s.lang);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return null;
}
