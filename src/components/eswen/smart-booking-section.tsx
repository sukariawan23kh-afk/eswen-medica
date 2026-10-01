"use client";

import { motion } from "framer-motion";
import {
  CalendarHeart,
  ShieldCheck,
  CreditCard,
  Wallet,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { bookingSteps, paymentMethods, paymentGateways, bookingStatuses } from "@/lib/eswen/data";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/i18n";
import { useBookingDialog } from "@/lib/eswen/booking-store";
import { cn } from "@/lib/utils";

export function SmartBookingSection() {
  const { lang } = useLanguage();
  const t = useT();
  const { openDialog } = useBookingDialog();
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section id="booking" className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-eswen-light-lavender/60 blur-3xl" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={t("booking_eyebrow")}
          title={
            <>
              {t("booking_title_1")} <span className="text-eswen-gradient">{t("booking_title_2")}</span>
            </>
          }
          description={t("booking_desc")}
        />

        {/* Booking steps */}
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookingSteps.map((s, idx) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="group relative rounded-3xl border border-eswen-lavender bg-white p-6 shadow-eswen-soft hover:shadow-eswen-card transition-all duration-400 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-light-lavender to-eswen-lavender text-eswen-deep group-hover:from-eswen-deep group-hover:to-eswen-soft-purple group-hover:text-white transition-all duration-300">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-extrabold text-3xl sm:text-4xl text-eswen-lavender-soft/40 group-hover:text-eswen-soft-purple/50 transition-colors">
                  0{s.step}
                </span>
              </div>
              <h3 className="text-base font-bold text-eswen-deep">{s.title[lang]}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.description[lang]}</p>

              {/* Connector arrow */}
              {idx < bookingSteps.length - 1 && (
                <span className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full bg-white border border-eswen-lavender text-eswen-soft-purple shadow-sm z-10">
                  <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Deposit + Payment info */}
        <div className="mt-16 grid lg:grid-cols-[1.2fr_1fr] gap-6">
          {/* Deposit card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-eswen-deep via-eswen-purple to-eswen-soft-purple p-8 sm:p-10 text-white shadow-eswen-elevated"
          >
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-eswen-lavender-soft/20 blur-2xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold mb-4">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t("booking_deposit_badge")}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                {t("booking_deposit_title")}
              </h3>
              <p className="mt-3 text-sm text-white/80 max-w-lg leading-relaxed">
                {t("booking_deposit_desc")}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[t("booking_reduce_noshow"), t("booking_avoid_fake"), t("booking_lock"), t("booking_protect")].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-eswen-lavender-soft" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Payment methods */}
              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-3">
                  {t("booking_methods")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map((m) => {
                    const Icon =
                      m === "Credit Card"
                        ? CreditCard
                        : m === "Bank Transfer" || m === "Virtual Account"
                        ? Building2
                        : m === "E-Wallet"
                        ? Wallet
                        : Smartphone;
                    return (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur px-3 py-1.5 text-xs font-medium"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {m}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Gateways */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  {t("booking_gateways")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {paymentGateways.map((g) => (
                    <span
                      key={g}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold tracking-wide"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => openDialog()}
                className="mt-7 rounded-full bg-white text-eswen-deep hover:bg-eswen-light-lavender h-11 px-6 text-sm font-bold shadow-lg"
              >
                <CalendarHeart className="h-4 w-4" />
                {t("booking_cta")}
              </Button>
            </div>
          </motion.div>

          {/* Booking statuses */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[1.75rem] border border-eswen-lavender bg-white p-7 sm:p-8 shadow-eswen-soft"
          >
            <h3 className="text-xl font-bold text-eswen-deep">{t("booking_status_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("booking_status_desc")}
            </p>

            <div className="mt-6 space-y-3">
              <StatusRow icon={<Clock className="h-4 w-4" />} label={t("booking_pending")} desc={t("booking_pending_desc")} color="bg-amber-100 text-amber-700" />
              <StatusRow icon={<CheckCircle2 className="h-4 w-4" />} label={t("booking_confirmed")} desc={t("booking_confirmed_desc")} color="bg-green-100 text-green-700" />
              <StatusRow icon={<AlertCircle className="h-4 w-4" />} label={t("booking_failed")} desc={t("booking_failed_desc")} color="bg-rose-100 text-rose-700" />
            </div>

            <div className="mt-6 pt-5 border-t border-eswen-lavender/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {t("booking_all_statuses")}
              </p>
              <div className="flex flex-wrap gap-2">
                {bookingStatuses.map((s) => (
                  <span
                    key={s.label.en}
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide",
                      s.color
                    )}
                  >
                    {s.label[lang]}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-eswen-light-lavender/50 p-4 text-xs text-muted-foreground leading-relaxed">
              <ShieldCheck className="inline h-4 w-4 text-eswen-soft-purple mb-1 mr-1" />
              {t("booking_secure_note")}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatusRow({
  icon,
  label,
  desc,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-eswen-lavender/60 p-3">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", color)}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-eswen-deep tracking-wide">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
