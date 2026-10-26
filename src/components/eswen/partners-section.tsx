"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Building2, HeartPulse, FileHeart } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";

type Partner = {
  name: string;
  tagKey: string;
  icon: typeof Building2;
  accent: string; // gradient classes
};

const PARTNERS: Partner[] = [
  {
    name: "BPJS",
    tagKey: "partners_bpjs_tag",
    icon: ShieldCheck,
    accent: "from-emerald-500 to-emerald-700",
  },
  {
    name: "BNI Life",
    tagKey: "partners_bnilife_tag",
    icon: Building2,
    accent: "from-orange-500 to-orange-700",
  },
  {
    name: "MHC",
    tagKey: "partners_mhc_tag",
    icon: HeartPulse,
    accent: "from-rose-500 to-rose-700",
  },
  {
    name: "Admedika",
    tagKey: "partners_admedika_tag",
    icon: FileHeart,
    accent: "from-sky-500 to-sky-700",
  },
];

export function PartnersSection() {
  const t = useT();
  const { lang } = useLanguage();

  return (
    <section id="partners" className="relative py-20 sm:py-28 bg-eswen-gradient-soft">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("partners_eyebrow")}
          title={
            <>
              {t("partners_title_1")} <span className="text-eswen-gradient">{t("partners_title_2")}</span>
            </>
          }
          description={t("partners_desc")}
        />

        {/* Body paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mt-8 mx-auto max-w-3xl text-center"
        >
          <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">
            {t("partners_body")}
          </p>
        </motion.div>

        {/* Partner cards */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PARTNERS.map((partner, idx) => {
            const Icon = partner.icon;
            return (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-eswen-lavender bg-white shadow-eswen-soft hover:shadow-eswen-elevated hover:-translate-y-1 transition-all duration-500"
              >
                {/* Gradient accent strip on top */}
                <div className={`h-1.5 bg-gradient-to-r ${partner.accent}`} />

                <div className="p-5 sm:p-6 text-center">
                  {/* Icon */}
                  <div
                    className={`mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${partner.accent} text-white shadow-md group-hover:scale-110 transition-transform duration-500`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-bold text-eswen-deep tracking-tight">
                    {partner.name}
                  </h3>

                  {/* Tag / category */}
                  <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(partner.tagKey)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust note */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-eswen-soft-purple" />
          <span>
            {lang === "id"
              ? "Klaim asuransi diproses di klinik kami — bawa kartu asuransi Anda saat kunjungan."
              : "Insurance claims are processed at our clinic — bring your insurance card during your visit."}
          </span>
        </div>
      </div>
    </section>
  );
}
