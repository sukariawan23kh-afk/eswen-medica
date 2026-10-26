"use client";

import { motion } from "framer-motion";
import { Target, Compass } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { aboutHighlights, whyChooseUs } from "@/lib/eswen/data";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";
import { SectionHeading } from "./section-heading";

export function AboutSection() {
  const { lang } = useLanguage();
  const t = useT();

  const hasBody = !!t("about_body")?.trim();
  const hasVision = !!t("about_vision_body")?.trim();
  const hasMission = !!t("about_mission_body")?.trim();

  return (
    <section id="about" className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div className="pointer-events-none absolute top-20 -left-20 h-72 w-72 rounded-full bg-eswen-light-lavender/50 blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* 2-column grid — image sticky on left, content flows on right.
            items-start (NOT items-center) so the image stays at the top
            instead of vertically centering (which left empty gaps when
            content grew long). The image is lg:sticky so it stays in view
            while the user scrolls through the long body / vision / mission
            content on the right. */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Image side — sticky on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative lg:sticky lg:top-24 self-start"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-eswen-lavender/60 to-eswen-soft-purple/20 blur-2xl" />
            {/* Fixed-size image — h-[440px] + object-cover ensures the
                image never stretches or "auto-weights" regardless of how
                much content is on the right side. */}
            <div className="relative rounded-[1.75rem] overflow-hidden border-4 border-white shadow-eswen-elevated">
              <img
                src="/images/clinic-interior.png"
                alt="Premium interior of Eswen Medica medical clinic in Bali"
                className="w-full h-[440px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/30 via-transparent to-transparent" />
            </div>

            {/* Floating stat — bottom right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-6 -right-4 sm:-right-6 glass-eswen rounded-3xl p-5 shadow-eswen-card border border-white/60 w-44"
            >
              <p className="text-3xl font-extrabold text-eswen-deep leading-none">5K+</p>
              <p className="text-xs text-muted-foreground mt-1">{t("about_patients")}</p>
            </motion.div>

            {/* Floating rating — top left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="absolute -top-4 -left-4 sm:-left-6 glass-eswen rounded-2xl px-4 py-2.5 shadow-eswen-card border border-white/60"
            >
              <p className="text-xs font-bold text-eswen-deep">{t("about_rating")}</p>
            </motion.div>
          </motion.div>

          {/* Content side — flexible, can grow long with body/vision/mission */}
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

            {/* Body paragraph (markdown-rendered) — supports long text, lists, etc. */}
            {hasBody && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="mt-6 prose-eswen text-sm sm:text-[15px] text-foreground/80 leading-relaxed"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 my-4 space-y-1.5 marker:text-eswen-soft-purple">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 my-4 space-y-1.5 marker:text-eswen-soft-purple">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    strong: ({ children }) => (
                      <strong className="font-bold text-eswen-deep">{children}</strong>
                    ),
                    em: ({ children }) => <em className="text-eswen-deep/90">{children}</em>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-eswen-soft-purple underline underline-offset-2 hover:text-eswen-deep"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {t("about_body")}
                </ReactMarkdown>
              </motion.div>
            )}

            {/* Highlights grid */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {aboutHighlights.map((item, idx) => (
                <motion.div
                  key={item.title.en}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
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

            {/* Vision & Mission — appears below highlights, supports long markdown content */}
            {(hasVision || hasMission) && (
              <div className="mt-10 grid sm:grid-cols-2 gap-5">
                {/* Vision */}
                {hasVision && (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl border border-eswen-lavender bg-gradient-to-br from-eswen-light-lavender/40 to-white p-6 shadow-eswen-soft"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-sm">
                        <Compass className="h-4 w-4" />
                      </span>
                      <h3 className="text-base font-bold text-eswen-deep tracking-tight">
                        {t("about_vision_title")}
                      </h3>
                    </div>
                    <div className="prose-eswen text-sm text-foreground/80 leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 my-2 space-y-1 marker:text-eswen-soft-purple">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 my-2 space-y-1 marker:text-eswen-soft-purple">
                              {children}
                            </ol>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-eswen-deep">{children}</strong>
                          ),
                        }}
                      >
                        {t("about_vision_body")}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}

                {/* Mission */}
                {hasMission && (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="rounded-2xl border border-eswen-lavender bg-gradient-to-br from-eswen-light-lavender/40 to-white p-6 shadow-eswen-soft"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-sm">
                        <Target className="h-4 w-4" />
                      </span>
                      <h3 className="text-base font-bold text-eswen-deep tracking-tight">
                        {t("about_mission_title")}
                      </h3>
                    </div>
                    <div className="prose-eswen text-sm text-foreground/80 leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 my-2 space-y-1.5 marker:text-eswen-soft-purple">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 my-2 space-y-1.5 marker:text-eswen-soft-purple">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => (
                            <strong className="font-bold text-eswen-deep">{children}</strong>
                          ),
                        }}
                      >
                        {t("about_mission_body")}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
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
