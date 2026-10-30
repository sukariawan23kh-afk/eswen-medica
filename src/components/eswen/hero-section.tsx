"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarHeart, ArrowRight, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroTrustPoints } from "@/lib/eswen/data";
import { useT, useHeroImage, useHeroGallery } from "@/lib/eswen/site-config-context";
import type { TranslationKey } from "@/lib/eswen/i18n";
import { useBookingDialog } from "@/lib/eswen/booking-store";

export function HeroSection() {
  const t = useT();
  const heroImage = useHeroImage();
  const heroGallery = useHeroGallery();
  const { openDialog } = useBookingDialog();

  // Build image list: main hero image + gallery images
  const allImages = [heroImage, ...heroGallery.filter(Boolean)];
  const [currentImg, setCurrentImg] = useState(0);

  // Auto-play slideshow every 4 seconds (only if more than 1 image)
  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [allImages.length]);
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-eswen-gradient pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-eswen-lavender-soft/30 blur-3xl animate-eswen-blob" />
      <div className="pointer-events-none absolute top-40 -right-32 h-96 w-96 rounded-full bg-eswen-lavender/40 blur-3xl animate-eswen-blob" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-eswen-light-lavender/50 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
          {/* Left content */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-eswen-lavender bg-white/70 backdrop-blur px-3.5 py-1.5 text-xs font-semibold text-eswen-deep shadow-eswen-soft mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-eswen-soft-purple opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-eswen-deep" />
              </span>
              {t("hero_badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-extrabold leading-[1.05] tracking-tight text-[2.5rem] sm:text-6xl lg:text-[4.25rem] text-eswen-deep"
            >
              {t("hero_h1_l1")}
              <br />
              <span className="text-eswen-gradient">{t("hero_h1_l2")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              {t("hero_sub")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={() => openDialog()}
                className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-card hover:shadow-eswen-elevated hover:-translate-y-0.5 transition-all px-6 h-12 text-sm font-semibold"
              >
                <CalendarHeart className="h-4 w-4" />
                {t("hero_cta_book")}
              </Button>
              <Button
                onClick={() => scrollTo("#services")}
                variant="outline"
                className="rounded-full border-eswen-lavender-soft text-eswen-deep bg-white/70 hover:bg-eswen-light-lavender hover:border-eswen-soft-purple h-12 px-6 text-sm font-semibold"
              >
                {t("hero_cta_explore")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Trust points */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 max-w-xl"
            >
              {heroTrustPoints.map((point) => (
                <li key={point.labelKey} className="flex items-center gap-2.5 text-sm font-medium text-foreground/80">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-eswen-light-lavender text-eswen-deep">
                    <point.icon className="h-4 w-4" />
                  </span>
                  {t(point.labelKey as TranslationKey)}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Right - Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative block mt-12 lg:mt-0"
          >
            <div className="relative">
              {/* Soft frame */}
              <div className="absolute -inset-4 sm:-inset-6 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-eswen-lavender/60 via-white/40 to-eswen-soft-purple/30 blur-2xl" />
              <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-eswen-elevated border-4 border-white animate-eswen-float">
                {/* Slideshow: main image + gallery images */}
                {allImages.map((img, idx) => (
                  <motion.img
                    key={img + idx}
                    src={img}
                    alt={`Eswen Medica Bali — ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: idx === currentImg ? 1 : 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                ))}
                {/* Placeholder to maintain height */}
                <div className="w-full h-[420px] sm:h-[500px] lg:h-[560px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/20 via-transparent to-transparent pointer-events-none" />

                {/* Gallery dots indicator (only if more than 1 image) */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImg(i)}
                        className={`h-2 rounded-full transition-all ${i === currentImg ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -left-3 sm:-left-6 top-10 glass-eswen rounded-2xl p-3.5 shadow-eswen-card border border-white/60 w-44 sm:w-52 hidden sm:block"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-eswen-soft-purple/15 text-eswen-deep">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-eswen-deep leading-tight">{t("hero_card_deposit")}</p>
                    <p className="text-[11px] text-muted-foreground">{t("hero_card_deposit_sub")}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.75 }}
                className="absolute -right-2 sm:-right-4 bottom-12 glass-eswen rounded-2xl p-3.5 shadow-eswen-card border border-white/60 w-48 sm:w-56 hidden sm:block"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs font-bold text-eswen-deep leading-tight">{t("hero_card_trusted")}</p>
                <p className="text-[11px] text-muted-foreground">{t("hero_card_trusted_sub")}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 glass-eswen rounded-full px-4 py-2 shadow-eswen-card border border-white/60 flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="h-4 w-4 text-eswen-soft-purple" />
                <span className="text-xs font-semibold text-eswen-deep">{t("hero_pill")}</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
