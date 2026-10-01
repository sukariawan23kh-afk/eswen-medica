"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Award, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { doctors, doctorFilters } from "@/lib/eswen/data";
import { cn } from "@/lib/utils";

export function DoctorsSection() {
  const [filter, setFilter] = useState<string>("All");

  const filtered =
    filter === "All"
      ? doctors
      : doctors.filter((d) => d.category === filter.toLowerCase());

  return (
    <section id="doctors" className="relative py-20 sm:py-28 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Professionals"
          title={
            <>
              Meet Our <span className="text-eswen-gradient">Professionals</span>
            </>
          }
          description="A trusted, multilingual team of doctors, aesthetic doctors, beauticians, and nurses — certified and experienced in international-standard care."
        />

        {/* Filters */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {doctorFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                filter === f
                  ? "bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft"
                  : "bg-eswen-light-lavender text-eswen-deep hover:bg-eswen-lavender"
              )}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Doctor grid */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((doc, idx) => (
              <motion.article
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="group relative overflow-hidden rounded-[1.5rem] border border-eswen-lavender bg-white shadow-eswen-soft hover:shadow-eswen-elevated transition-all duration-500 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden bg-gradient-to-b from-eswen-light-lavender to-white">
                  <img
                    src={doc.image}
                    alt={`${doc.name}, ${doc.role} at Eswen Medica Bali`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/70 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-eswen-deep">
                    <Award className="h-3 w-3" />
                    {doc.role}
                  </span>

                  {/* Name overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                    <h3 className="text-lg font-bold tracking-tight leading-tight">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-white/80">{doc.specialty}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-eswen-soft-purple" />
                      {doc.experience}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-eswen-lavender-soft" />
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5 text-eswen-soft-purple" />
                      {doc.languages.join(" · ")}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full rounded-full bg-eswen-light-lavender text-eswen-deep hover:bg-eswen-deep hover:text-white h-9 text-xs font-semibold group/btn"
                  >
                    View Profile
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom note */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Want to join our team of trusted professionals?</span>
          <button
            onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1 font-semibold text-eswen-deep hover:text-eswen-soft-purple"
          >
            Contact us <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
