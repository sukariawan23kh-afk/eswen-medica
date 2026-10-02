"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations as STATIC_T, tr as staticTr, type TranslationKey } from "@/lib/eswen/i18n";
import type { Lang } from "@/lib/eswen/language-store";
import { useLanguage } from "@/lib/eswen/language-store";

/** Shape of a service as returned by /api/site-config (mirrors data.ts Service). */
export type CfgService = {
  id: string;
  category: { en: string; id: string };
  name: { en: string; id: string };
  description: { en: string; id: string };
  startingPrice: string;
  deposit: number;
  icon: string;
  image: string;
  brand: string;
  order: number;
};
export type CfgDoctor = {
  id: string;
  name: string;
  role: { en: string; id: string };
  category: "doctor" | "wellness";
  specialty: { en: string; id: string };
  experience: { en: string; id: string };
  languages: string[];
  image: string;
  initials: string;
  order: number;
};

type SiteConfig = {
  logo: { url: string; alt: string };
  brand: { name: string; tagline: { en: string; id: string } };
  contact: {
    address: string;
    whatsapp: string;
    phone: string;
    email: string;
    hours: { en: string; id: string };
    mapEmbed: string;
    directions: string;
  };
  social: { instagram: string; facebook: string; tiktok: string };
  theme: Record<string, string>;
  translations: { en: Record<string, string>; id: Record<string, string> };
};

type Ctx = {
  config: SiteConfig | null;
  services: CfgService[];
  doctors: CfgDoctor[];
  loaded: boolean;
};

const SiteConfigContext = createContext<Ctx>({ config: null, services: [], doctors: [], loaded: false });

/** Provide the editable site config to the whole tree. Fetches once on mount. */
export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Ctx>({ config: null, services: [], doctors: [], loaded: false });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.ok && d.config) {
          setState({ config: d.config, services: d.services ?? [], doctors: d.doctors ?? [], loaded: true });
        } else {
          setState((s) => ({ ...s, loaded: true }));
        }
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loaded: true }));
      });
    return () => { cancelled = true; };
  }, []);

  return <SiteConfigContext.Provider value={state}>{children}</SiteConfigContext.Provider>;
}

/** Read the live site config (logo, brand, contact, theme). */
export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

/**
 * Translation hook backed by the live DB config (editable from admin), with a
 * static fallback so SSR + first client render work before the fetch resolves.
 */
export function useT() {
  const { config } = useSiteConfig();
  const lang = useLanguage((s) => s.lang);
  return (key: TranslationKey): string => {
    const live = config?.translations?.[lang]?.[key];
    if (live !== undefined && live !== "") return live;
    return staticTr(lang, key);
  };
}

/** Live, admin-editable services (fallback to static data.ts until loaded). */
export function useServices(servicesFallback: CfgService[]): CfgService[] {
  const { services, loaded } = useSiteConfig();
  return loaded && services.length > 0 ? services : servicesFallback;
}

/** Live, admin-editable doctors (fallback to static data.ts until loaded). */
export function useDoctors(doctorsFallback: CfgDoctor[]): CfgDoctor[] {
  const { doctors, loaded } = useSiteConfig();
  return loaded && doctors.length > 0 ? doctors : doctorsFallback;
}

/** Live, admin-editable logo. Returns {url, alt}; empty url = use default mark. */
export function useLogo() {
  const { config } = useSiteConfig();
  return config?.logo ?? { url: "", alt: "Eswen Medica" };
}

/** Live, admin-editable brand (name + tagline). */
export function useBrand() {
  const { config } = useSiteConfig();
  return config?.brand ?? { name: "ESWEN MEDICA", tagline: { en: "Health • Wellness • Confidence", id: "Kesehatan • Wellness • Kepercayaan" } };
}

/** Live, admin-editable contact info. */
export function useContact() {
  const { config } = useSiteConfig();
  return (
    config?.contact ?? {
      address: "Jl. Sunset Road No. 88, Kuta, Bali 80361, Indonesia",
      whatsapp: "+62 811-3900-8800",
      phone: "+62 361-XXX-XXXX",
      email: "hello@eswenmedica.id",
      hours: { en: "Mon – Sun · 08:00 – 20:00 WITA", id: "Sen – Min · 08:00 – 20:00 WITA" },
      mapEmbed: "https://www.google.com/maps?q=Kuta,+Bali,+Indonesia&output=embed",
      directions: "https://www.google.com/maps/dir/?api=1&destination=Kuta+Bali+Indonesia",
    }
  );
}

/** Live, admin-editable social links. */
export function useSocial() {
  const { config } = useSiteConfig();
  return config?.social ?? { instagram: "#", facebook: "#", tiktok: "#" };
}

// keep the static translations import referenced (used as fallback)
void STATIC_T;
