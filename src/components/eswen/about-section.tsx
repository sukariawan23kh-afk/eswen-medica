"use client";

import { motion } from "framer-motion";
import { aboutHighlights, whyChooseUs } from "@/lib/eswen/data";
import { SectionHeading } from "./section-heading";

export function AboutSection() {
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
                alt="Premium interior of Eswen Medica medical and aesthetic clinic in Bali"
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
              <p className="text-xs text-muted-foreground mt-1">Happy patients from 40+ countries</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="absolute -top-4 -left-4 sm:-left-6 glass-eswen rounded-2xl px-4 py-2.5 shadow-eswen-card border border-white/60"
            >
              <p className="text-xs font-bold text-eswen-deep">★ 4.9 / 5.0 rating</p>
            </motion.div>
          </motion.div>

          {/* Content side */}
          <div>
            <SectionHeading
              eyebrow="About Eswen"
              align="left"
              title={
                <>
                  Healthcare & Beauty, <span className="text-eswen-gradient">Designed Around You.</span>
                </>
              }
              description="Eswen Medica is committed to delivering a professional, comfortable, modern, and accessible care experience — purpose-built for Bali's international community."
            />

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {aboutHighlights.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group rounded-2xl border border-eswen-lavender bg-white p-5 shadow-eswen-soft hover:shadow-eswen-card hover:-translate-y-0.5 transition-all"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-light-lavender to-eswen-lavender text-eswen-deep group-hover:from-eswen-deep group-hover:to-eswen-soft-purple group-hover:text-white transition-all duration-300">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3.5 text-base font-bold text-eswen-deep">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
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
  return (
    <section className="relative py-20 sm:py-28 bg-eswen-gradient overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-0 h-72 w-72 rounded-full bg-eswen-lavender/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-eswen-light-lavender/60 blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow="Why Choose Us"
          title={
            <>
              Built for a <span className="text-eswen-gradient">Premium Experience</span>
            </>
          }
          description="Everything you need — from smart booking to secure payments and AI-guided triage — connected in one seamless ecosystem."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyChooseUs.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-3xl border border-eswen-lavender bg-white/80 backdrop-blur p-6 shadow-eswen-soft hover:shadow-eswen-elevated hover:-translate-y-1.5 transition-all duration-400"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-light-lavender to-eswen-lavender text-eswen-deep group-hover:scale-110 transition-transform duration-300">
                <item.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-eswen-deep">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>

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
