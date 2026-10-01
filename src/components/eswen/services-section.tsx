"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { services } from "@/lib/eswen/data";
import { cn } from "@/lib/utils";

export function ServicesSection() {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section id="services" className="relative py-20 sm:py-28 bg-eswen-gradient-soft">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Services"
          title={
            <>
              Care Designed Around <span className="text-eswen-gradient">Your Needs</span>
            </>
          }
          description="From general medical consultations to advanced aesthetic treatments — explore a complete catalog of healthcare and beauty services."
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
                  alt={`${service.name} at Eswen Medica Bali`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-eswen-deep shadow-sm">
                  {service.brand === "medical" ? "Medical" : "Aesthetic"}
                </span>
                <span className="absolute -bottom-5 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-card border-2 border-white">
                  <service.icon className="h-5 w-5" />
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5 pt-7">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-eswen-soft-purple">
                  {service.category}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-eswen-deep">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {service.description}
                </p>

                <div className="mt-5 flex items-end justify-between gap-3 pt-4 border-t border-eswen-lavender/60">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Starting from</p>
                    <p className="text-sm font-bold text-eswen-deep">{service.startingPrice}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => scrollTo("#booking")}
                    className={cn(
                      "rounded-full h-9 px-4 text-xs font-semibold transition-all",
                      "bg-eswen-light-lavender text-eswen-deep hover:bg-eswen-deep hover:text-white"
                    )}
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            onClick={() => scrollTo("#booking")}
            className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-card hover:shadow-eswen-elevated hover:-translate-y-0.5 transition-all px-6 h-12"
          >
            Book an Appointment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
