"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { brands } from "@/lib/eswen/data";
import { cn } from "@/lib/utils";

export function BrandsSection() {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section id="brands" className="relative py-20 sm:py-28 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Brands"
          title={
            <>
              Two Brands. <span className="text-eswen-gradient">One Care.</span>
            </>
          }
          description="Eswen Medica and Aesthetic Eswen operate as one connected ecosystem — sharing booking, payments, and your patient records — while keeping their distinct focus on health and beauty."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-6 lg:gap-8 relative">
          {/* Connector visual */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-eswen-deep to-eswen-soft-purple shadow-eswen-elevated" />
              <span className="absolute -inset-2 rounded-full border border-eswen-lavender-soft/40 animate-eswen-pulse-ring" />
              <Sparkles className="relative h-7 w-7 text-white" />
            </div>
          </div>

          {brands.map((brand, idx) => {
            const isMedical = brand.accent === "medical";
            return (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={cn(
                  "group relative overflow-hidden rounded-[1.75rem] border border-eswen-lavender bg-white shadow-eswen-card hover:shadow-eswen-elevated transition-all duration-500 hover:-translate-y-1",
                  isMedical ? "lg:rounded-l-[1.75rem]" : "lg:rounded-r-[1.75rem]"
                )}
              >
                {/* Decorative gradient header */}
                <div
                  className={cn(
                    "relative h-40 overflow-hidden",
                    isMedical
                      ? "bg-gradient-to-br from-eswen-light-lavender via-white to-eswen-lavender"
                      : "bg-gradient-to-br from-eswen-lavender via-eswen-light-lavender to-white"
                  )}
                >
                  <img
                    src={brand.image}
                    alt={`${brand.name} brand visual`}
                    className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                  <div className="absolute top-5 left-5 flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-eswen-soft",
                        isMedical
                          ? "bg-gradient-to-br from-eswen-deep to-eswen-soft-purple"
                          : "bg-gradient-to-br from-eswen-soft-purple to-eswen-lavender-soft"
                      )}
                    >
                      {isMedical ? <Activity className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-eswen-deep/80 bg-white/70 backdrop-blur px-2.5 py-1 rounded-full">
                      {isMedical ? "Medical" : "Aesthetic"}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-extrabold tracking-tight text-eswen-deep">
                    {brand.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-eswen-soft-purple tracking-wide">
                    {brand.tagline}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {brand.description}
                  </p>

                  <ul className="mt-5 grid grid-cols-2 gap-y-2 gap-x-3">
                    {brand.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                        <Check className="h-3.5 w-3.5 text-eswen-soft-purple" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => scrollTo(isMedical ? "#services" : "#services")}
                    className={cn(
                      "mt-7 w-full rounded-full h-11 text-sm font-semibold transition-all group/btn",
                      isMedical
                        ? "bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white hover:shadow-eswen-card"
                        : "bg-gradient-to-r from-eswen-soft-purple to-eswen-lavender-soft text-white hover:shadow-eswen-card"
                    )}
                  >
                    {brand.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
