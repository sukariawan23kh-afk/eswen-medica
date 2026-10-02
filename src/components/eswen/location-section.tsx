"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, MessageCircle, Phone, Mail, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT, useContact } from "@/lib/eswen/site-config-context";

export function LocationSection() {
  const { lang } = useLanguage();
  const t = useT();
  const contactInfo = useContact();

  return (
    <section id="contact" className="relative py-20 sm:py-28 bg-eswen-gradient-soft">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("location_eyebrow")}
          title={
            <>
              {t("location_title_1")} <span className="text-eswen-gradient">{t("location_title_2")}</span>
            </>
          }
          description={t("location_desc")}
        />

        <div className="mt-14 grid lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-8">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[1.75rem] border-4 border-white shadow-eswen-elevated h-[420px] lg:h-full min-h-[420px]"
          >
            <iframe
              title="Eswen Medica location on Google Maps"
              src={contactInfo.mapEmbed}
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-[1.5rem] bg-white border border-eswen-lavender p-6 shadow-eswen-soft">
              <h3 className="text-lg font-bold text-eswen-deep mb-4">{t("location_contact_title")}</h3>
              <ul className="space-y-3.5 text-sm">
                <ContactRow icon={<MapPin className="h-4 w-4" />} label={t("location_address")} value={contactInfo.address} />
                <ContactRow icon={<Clock className="h-4 w-4" />} label={t("location_hours")} value={contactInfo.hours[lang]} />
                <ContactRow icon={<MessageCircle className="h-4 w-4" />} label={t("location_whatsapp")} value={contactInfo.whatsapp} />
                <ContactRow icon={<Phone className="h-4 w-4" />} label={t("location_phone")} value={contactInfo.phone} />
                <ContactRow icon={<Mail className="h-4 w-4" />} label={t("location_email")} value={contactInfo.email} />
              </ul>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft hover:shadow-eswen-card h-11 flex-1"
                >
                  <a href={contactInfo.directions} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4" />
                    {t("location_directions")}
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-eswen-lavender-soft text-eswen-deep bg-white hover:bg-eswen-light-lavender h-11 flex-1"
                >
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("location_wa")}
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-eswen-deep to-eswen-soft-purple p-6 text-white shadow-eswen-card">
              <h4 className="font-bold text-base">{t("location_walkins_title")}</h4>
              <p className="mt-1.5 text-sm text-white/85 leading-relaxed">
                {t("location_walkins_desc")}
              </p>
              <p className="mt-3 text-xs text-white/70">{t("location_walkins_note")}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-eswen-light-lavender text-eswen-deep">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-eswen-deep leading-snug">{value}</p>
      </div>
    </li>
  );
}
