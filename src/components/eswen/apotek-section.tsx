"use client";

import { motion } from "framer-motion";
import { Pill, Package, MessageSquare, Clock, MessageCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT, useContact } from "@/lib/eswen/site-config-context";
import { useApotekOverlay } from "@/lib/eswen/apotek-overlay-store";

export function ApotekSection() {
  const t = useT();
  const { lang } = useLanguage();
  const contact = useContact();
  const { openStore: openApotekStore } = useApotekOverlay();

  const services = [
    { icon: Pill, titleKey: "apotek_rx_title", descKey: "apotek_rx_desc" },
    { icon: Package, titleKey: "apotek_otc_title", descKey: "apotek_otc_desc" },
    { icon: MessageSquare, titleKey: "apotek_care_title", descKey: "apotek_care_desc" },
  ];

  const wa = contact.whatsapp.replace(/[^0-9]/g, "");

  return (
    <section id="apotek" className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div className="pointer-events-none absolute top-10 -right-20 h-72 w-72 rounded-full bg-eswen-light-lavender/40 blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={t("apotek_eyebrow")}
          title={
            <>
              {t("apotek_title_1")} <span className="text-eswen-gradient">{t("apotek_title_2")}</span>
            </>
          }
          description={t("apotek_desc")}
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
            {t("apotek_body")}
          </p>
        </motion.div>

        {/* Service cards */}
        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={svc.titleKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group rounded-2xl border border-eswen-lavender bg-gradient-to-br from-eswen-light-lavender/30 to-white p-6 shadow-eswen-soft hover:shadow-eswen-card hover:-translate-y-1 transition-all duration-500"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-md group-hover:scale-110 transition-transform duration-300 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-eswen-deep tracking-tight mb-1.5">
                  {t(svc.titleKey as Parameters<typeof t>[0])}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(svc.descKey as Parameters<typeof t>[0])}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Hours + CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-eswen-light-lavender px-4 py-2 text-xs font-semibold text-eswen-deep">
            <Clock className="h-3.5 w-3.5 text-eswen-soft-purple" />
            <span>{t("apotek_hours_body")}</span>
          </div>
          <Button
            type="button"
            onClick={openApotekStore}
            className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft hover:shadow-eswen-card hover:-translate-y-0.5 transition-all px-6 h-11 text-sm font-semibold"
          >
            <Store className="h-4 w-4" />
            {t("apotek_store_view_all")}
          </Button>
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(
              lang === "id"
                ? "Halo Apotek Eswen, saya ingin tanya tentang obat/layanan apotek."
                : "Hello Apotek Eswen, I'd like to ask about pharmacy services."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="rounded-full border-eswen-lavender text-eswen-deep hover:bg-eswen-light-lavender hover:text-eswen-deep hover:border-eswen-soft-purple transition-all px-6 h-11 text-sm font-semibold">
              <MessageCircle className="h-4 w-4" />
              {t("apotek_cta")}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
