"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, MessageCircle, Phone, Mail, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { contactInfo } from "@/lib/eswen/data";

export function LocationSection() {
  return (
    <section id="contact" className="relative py-20 sm:py-28 bg-eswen-gradient-soft">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Visit Us"
          title={
            <>
              Visit <span className="text-eswen-gradient">Eswen Medica</span>
            </>
          }
          description="Centrally located in Kuta, Bali — easy to reach from Seminyak, Canggu, and the airport."
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
              <h3 className="text-lg font-bold text-eswen-deep mb-4">Contact Information</h3>
              <ul className="space-y-3.5 text-sm">
                <ContactRow icon={<MapPin className="h-4 w-4" />} label="Address" value={contactInfo.address} />
                <ContactRow icon={<Clock className="h-4 w-4" />} label="Opening Hours" value={contactInfo.hours} />
                <ContactRow icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" value={contactInfo.whatsapp} />
                <ContactRow icon={<Phone className="h-4 w-4" />} label="Phone" value={contactInfo.phone} />
                <ContactRow icon={<Mail className="h-4 w-4" />} label="Email" value={contactInfo.email} />
              </ul>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft hover:shadow-eswen-card h-11 flex-1"
                >
                  <a href={contactInfo.directions} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4" />
                    Get Directions
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
                    WhatsApp Us
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-gradient-to-br from-eswen-deep to-eswen-soft-purple p-6 text-white shadow-eswen-card">
              <h4 className="font-bold text-base">Walk-ins Welcome</h4>
              <p className="mt-1.5 text-sm text-white/85 leading-relaxed">
                Prefer to visit without an appointment? Our front desk team will help you find the next available slot.
              </p>
              <p className="mt-3 text-xs text-white/70">Avg. wait time: under 15 minutes during off-peak hours.</p>
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
