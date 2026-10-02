"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";
import { tr } from "@/lib/eswen/i18n";
import type { Lang } from "@/lib/eswen/language-store";

type Offer = {
  id: string;
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  offerType: string;
  badge: string;
  imageUrl: string;
  ctaTextEn: string;
  ctaTextId: string;
  ctaLink: string;
  priority: number;
};

const TYPE_KEY: Record<string, "promo_daily" | "promo_weekly" | "promo_monthly" | "promo_onetime"> = {
  daily: "promo_daily",
  weekly: "promo_weekly",
  monthly: "promo_monthly",
  onetime: "promo_onetime",
};

/**
 * PromoSection — public section (id="promo") rendering active special offers
 * from /api/offers. Bilingual via useLanguage + useT. Shows badge, image,
 * title, description, an offer-type label, and a CTA.
 */
export function PromoSection() {
  const { lang } = useLanguage();
  const t = useT();
  const [offers, setOffers] = useState<Offer[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/offers", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.ok) setOffers(d.offers as Offer[]);
        else setOffers([]);
      })
      .catch(() => !cancelled && setOffers([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollTo = (href: string) => {
    if (!href) return;
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="promo" className="relative py-20 sm:py-28 bg-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-eswen-lavender/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-eswen-light-lavender/60 blur-3xl" />
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("promo_eyebrow")}
          title={
            <>
              {t("promo_title_1")} <span className="text-eswen-gradient">{t("promo_title_2")}</span>
            </>
          }
          description={t("promo_desc")}
        />

        <div className="mt-14">
          {offers === null ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-eswen-soft-purple" />
              Loading offers...
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-eswen-light-lavender text-eswen-soft-purple mb-3">
                <Tag className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("promo_no_offers")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((o, idx) => {
                const typeKey = TYPE_KEY[o.offerType] || "promo_weekly";
                return (
                  <motion.article
                    key={o.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                    className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-eswen-lavender bg-white shadow-eswen-soft hover:shadow-eswen-elevated transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-eswen-light-lavender">
                      {o.imageUrl ? (
                         
                        <img
                          src={o.imageUrl}
                          alt={(lang === "id" ? o.titleId : o.titleEn) + " — Eswen Medica Bali"}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/40 via-transparent to-transparent" />
                      {o.badge && (
                        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple px-3 py-1 text-xs font-bold text-white shadow-eswen-card">
                          {o.badge}
                        </span>
                      )}
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/85 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-eswen-deep">
                        <Clock className="h-3 w-3" /> {tr(lang as Lang, typeKey)}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="flex flex-col flex-1 p-5">
                      <h3 className="text-lg font-bold tracking-tight text-eswen-deep leading-snug">
                        {lang === "id" ? o.titleId : o.titleEn}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                        {lang === "id" ? o.descId : o.descEn}
                      </p>
                      <div className="mt-5 pt-4 border-t border-eswen-lavender/60">
                        <Button
                          size="sm"
                          onClick={() => scrollTo(o.ctaLink || "#booking")}
                          className="w-full rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white hover:shadow-eswen-card h-10"
                        >
                          {(o.ctaTextEn || o.ctaTextId)
                            ? lang === "id"
                              ? o.ctaTextId || o.ctaTextEn
                              : o.ctaTextEn || o.ctaTextId
                            : t("promo_cta")}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
