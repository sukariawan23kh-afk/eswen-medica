"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { patientJourney } from "@/lib/eswen/data";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";

export function PatientJourneySection() {
  const { lang } = useLanguage();
  const t = useT();

  return (
    <section className="relative py-20 sm:py-28 bg-eswen-gradient-soft overflow-hidden">
      <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 h-72 w-[80%] rounded-full bg-eswen-lavender/40 blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={t("journey_eyebrow")}
          title={
            <>
              {t("journey_title_1")} <span className="text-eswen-gradient">{t("journey_title_2")}</span>
            </>
          }
          description={t("journey_desc")}
        />

        {/* Desktop horizontal flow */}
        <div className="mt-14 hidden lg:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-12 left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-transparent via-eswen-lavender-soft/50 to-transparent" />

            <div className="grid grid-cols-9 gap-2">
              {patientJourney.map((step, idx) => (
                <motion.div
                  key={step.title.en}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white border-2 border-eswen-lavender shadow-eswen-soft hover:shadow-eswen-card hover:-translate-y-1 transition-all duration-300 group">
                    <step.icon className="h-7 w-7 text-eswen-deep group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white text-[10px] font-bold border-2 border-white">
                      {idx + 1}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-eswen-deep">{step.title[lang]}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical flow */}
        <div className="mt-10 lg:hidden">
          <div className="relative space-y-4 pl-2">
            <div className="absolute top-2 bottom-2 left-[2.75rem] w-0.5 bg-gradient-to-b from-eswen-lavender-soft/40 to-transparent" />
            {patientJourney.map((step, idx) => (
              <motion.div
                key={step.title.en}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative flex items-center gap-4"
              >
                <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-eswen-lavender shadow-eswen-soft shrink-0">
                  <step.icon className="h-5 w-5 text-eswen-deep" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-eswen-deep text-white text-[9px] font-bold border-2 border-white">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 rounded-2xl bg-white border border-eswen-lavender/60 px-4 py-3 shadow-eswen-soft">
                  <p className="text-sm font-semibold text-eswen-deep">{step.title[lang]}</p>
                </div>
                {idx < patientJourney.length - 1 && (
                  <ChevronRight className="absolute -bottom-3 left-[1.85rem] h-4 w-4 text-eswen-lavender-soft rotate-90" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
