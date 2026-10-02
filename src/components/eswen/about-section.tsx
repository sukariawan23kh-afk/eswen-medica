"use client";

import { motion } from "framer-motion";
import { aboutHighlights, whyChooseUs } from "@/lib/eswen/data";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/i18n";
import { SectionHeading } from "./section-heading";

export function AboutSection() {
  const { lang } = useLanguage();
  const t = useT();

  return (
    <section id="about" className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div className="pointer-events-none absolute top-20 -left-20 h-72 w-72 rounded-full bg-eswen-light-lavender/50 blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-eswen-lavender/60 to-eswen-soft-purple/20 blur-2xl" />
            <div className="relative rounded-[1.75rem] overflow-hidden border-4 border-white shadow-eswen-elevated">
              <img
                src="/images/clinic-interior.png"
                alt="Premium interior of Eswen Medica medical clinic in Bali"
                className="w-full h-[440px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/30 via-transparent to-transparent" />
            </div>

            {/* Floating stat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-6 -right-4 sm:-right-6 glass-eswen rounded-3xl p-5 shadow-eswen-card border border-white/60 w-44"
            >
              <p className="text-3xl font-extrabold text-eswen-deep leading-none">5K+</p>
              <p className="text-xs text-muted-foreground mt-1">{t("about_patients")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="absolute -top-4 -left-4 sm:-left-6 glass-eswen rounded-2xl px-4 py-2.5 shadow-eswen-card border border-white/60"
            >
              <p className="text-xs font-bold text-eswen-deep">{t("about_rating")}</p>
            </motion.div>
          </motion.div>

          {/* Content side */}
          <div>
            <SectionHeading
              eyebrow={t("about_eyebrow")}
              align="left"
              title={
                <>
                  {t("about_title_1")} <span className="text-eswen-gradient">{t("about_title_2")}</span>
                </>
              }
              description={t("about_desc")}
            />

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {aboutHighlights.map((item, idx) => (
                <motion.div
                  key={item.title.en}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group rounded-2xl border border-eswen-lavender bg-white p-5 shadow-eswen-soft hover:shadow-eswen-card hover:-translate-y-0.5 transition-all"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-light-lavender to-eswen-lavender text-eswen-deep group-hover:from-eswen-deep group-hover:to-eswen-soft-purple group-hover:text-white transition-all duration-300">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3.5 text-base font-bold text-eswen-deep">{item.title[lang]}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.description[lang]}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUsSection() {
  const { lang } = useLanguage();
  const t = useT();

  return (
    <section className="relative py-20 sm:py-28 bg-eswen-gradient overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-0 h-72 w-72 rounded-full bg-eswen-lavender/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-eswen-light-lavender/60 blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={t("why_eyebrow")}
          title={
            <>
              {t("why_title_1")} <span className="text-eswen-gradient">{t("why_title_2")}</span>
            </>
          }
          description={t("why_desc")}
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyChooseUs.map((item, idx) => (
            <motion.div
              key={item.title.en}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-3xl border border-eswen-lavender bg-white/80 backdrop-blur p-6 shadow-eswen-soft hover:shadow-eswen-elevated hover:-translate-y-1.5 transition-all duration-400"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-light-lavender to-eswen-lavender text-eswen-deep group-hover:scale-110 transition-transform duration-300">
                <item.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-eswen-deep">{item.title[lang]}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description[lang]}</p>

              <span className="absolute top-6 right-6 font-extrabold text-3xl text-eswen-lavender-soft/30 group-hover:text-eswen-soft-purple/40 transition-colors">
                0{idx + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
