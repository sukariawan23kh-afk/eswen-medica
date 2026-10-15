"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { services as staticServices } from "@/lib/eswen/data";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT, useServices } from "@/lib/eswen/site-config-context";
import { useBookingDialog } from "@/lib/eswen/booking-store";
import { getLucideIcon } from "@/lib/eswen/icons";
import { cn } from "@/lib/utils";

export function ServicesSection() {
  const { lang } = useLanguage();
  const t = useT();
  const { openDialog } = useBookingDialog();
  const services = useServices(staticServices);
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section id="services" className="relative py-20 sm:py-28 bg-eswen-gradient-soft">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("services_eyebrow")}
          title={
            <>
              {t("services_title_1")} <span className="text-eswen-gradient">{t("services_title_2")}</span>
            </>
          }
          description={t("services_desc")}
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-eswen-lavender bg-white shadow-eswen-soft hover:shadow-eswen-elevated transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-eswen-light-lavender">
                <img
                  src={service.image}
                  alt={`${service.name[lang]} at Eswen Medica Bali`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                <span className="absolute -bottom-5 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-card border-2 border-white">
                  {(() => { const Icon = getLucideIcon(typeof service.icon === "string" ? service.icon : "Stethoscope"); return <Icon className="h-5 w-5" />; })()}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5 pt-7">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-eswen-soft-purple">
                  {service.category[lang]}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-eswen-deep">
                  {service.name[lang]}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {service.description[lang]}
                </p>

                <div className="mt-5 flex items-end justify-between gap-3 pt-4 border-t border-eswen-lavender/60">
                  <div>
                    <p className="text-[11px] text-muted-foreground">{t("services_starting")}</p>
                    <p className="text-sm font-bold text-eswen-deep">{service.startingPrice}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openDialog(service.id)}
                    className={cn(
                      "rounded-full h-9 px-4 text-xs font-semibold transition-all",
                      "bg-eswen-light-lavender text-eswen-deep hover:bg-eswen-deep hover:text-white"
                    )}
                  >
                    {t("services_view")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            onClick={() => openDialog()}
            className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-card hover:shadow-eswen-elevated hover:-translate-y-0.5 transition-all px-6 h-12"
          >
            {t("services_book")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
