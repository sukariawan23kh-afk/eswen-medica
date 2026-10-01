"use client";

import {
  Sparkles,
  Instagram,
  Facebook,
  ArrowUp,
  ShieldPlus,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { navLinks, contactInfo } from "@/lib/eswen/data";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/i18n";
import type { TranslationKey } from "@/lib/eswen/i18n";

export function Footer() {
  const { lang } = useLanguage();
  const t = useT();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const handleNav = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <footer className="relative mt-auto bg-eswen-footer overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[60%] rounded-full bg-white/40 blur-3xl" />
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft">
                <Sparkles className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-base tracking-tight text-eswen-deep">
                  ESWEN <span className="text-eswen-purple">MEDICA</span>
                </span>
                <span className="text-[10px] tracking-[0.2em] text-eswen-purple/80 font-medium uppercase mt-0.5">
                  {t("nav_tagline")}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-eswen-deep/70 leading-relaxed max-w-xs">
              {t("footer_desc")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: TikTokIcon, label: "TikTok" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-eswen-deep hover:bg-eswen-deep hover:text-white transition-all shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-eswen-deep mb-4">
              {t("footer_quick")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNav(link.href)}
                    className="text-eswen-deep/70 hover:text-eswen-deep hover:translate-x-0.5 inline-flex items-center gap-1.5 transition-all"
                  >
                    {t(link.labelKey as TranslationKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Brands */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-eswen-deep mb-4">
              {t("footer_brands")}
            </h4>
            <ul className="space-y-3">
              <li>
                <p className="text-sm font-bold text-eswen-deep">Eswen Medica</p>
                <p className="text-xs text-eswen-deep/60">{t("footer_medical")}</p>
              </li>
              <li>
                <p className="text-sm font-bold text-eswen-purple">Aesthetic Eswen</p>
                <p className="text-xs text-eswen-deep/60">{t("footer_aesthetic")}</p>
              </li>
            </ul>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-eswen-deep">
              <ShieldPlus className="h-3 w-3" />
              {t("footer_two_brands")}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-eswen-deep mb-4">
              {t("footer_contact")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2 text-eswen-deep/70">
                <MapPin className="h-4 w-4 mt-0.5 text-eswen-purple shrink-0" />
                <span>{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-2 text-eswen-deep/70">
                <Phone className="h-4 w-4 text-eswen-purple shrink-0" />
                <span>{contactInfo.phone}</span>
              </li>
              <li className="flex items-center gap-2 text-eswen-deep/70">
                <Mail className="h-4 w-4 text-eswen-purple shrink-0" />
                <span>{contactInfo.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-eswen-deep/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-eswen-deep/70">
            <span>{t("footer_copyright")}</span>
            <span className="hidden sm:inline h-1 w-1 rounded-full bg-eswen-deep/30" />
            <button className="hover:text-eswen-deep transition-colors">{t("footer_privacy")}</button>
            <button className="hover:text-eswen-deep transition-colors">{t("footer_terms")}</button>
          </div>
          <button
            onClick={scrollTop}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 hover:bg-eswen-deep hover:text-white text-eswen-deep px-4 py-2 text-xs font-semibold transition-all shadow-sm"
            aria-label={t("footer_back")}
          >
            <ArrowUp className="h-3.5 w-3.5" />
            {t("footer_back")}
          </button>
        </div>
      </div>
    </footer>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.2v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.61c.29 0 .57.04.84.13v-3.3a6.21 6.21 0 0 0-.84-.06A6.1 6.1 0 0 0 3.16 16a6.1 6.1 0 0 0 10.49 4.25V8.66a7.94 7.94 0 0 0 4.62 1.48V6.94a4.81 4.81 0 0 1-1.68-.25Z" />
    </svg>
  );
}
