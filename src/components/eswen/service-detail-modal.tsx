"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CalendarHeart,
  Check,
  ShieldPlus,
  Clock,
  Users,
  Globe,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";
import { useBookingDialog } from "@/lib/eswen/booking-store";
import type { CfgService } from "@/lib/eswen/site-config-context";

type Service = CfgService;

const WHAT_TO_EXPECT = [
  { icon: Stethoscope, en: "Board-certified medical specialists", id: "Spesialis medis bersertifikat" },
  { icon: Clock, en: "30–60 minute consultation", id: "Konsultasi 30–60 menit" },
  { icon: ShieldPlus, en: "Confidential & private", id: "Rahasia & privat" },
  { icon: Globe, en: "Bilingual support (EN / ID)", id: "Dukungan bahasa (EN / ID)" },
  { icon: Users, en: "International standards", id: "Standar internasional" },
];

export function ServiceDetailModal({
  service,
  onClose,
}: {
  service: Service | null;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const t = useT();
  const { openDialog } = useBookingDialog();

  const handleBook = () => {
    if (service) {
      openDialog(service.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {service && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-eswen-deep/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur text-eswen-deep hover:bg-white shadow-sm"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen">
              {/* Image header */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-eswen-light-lavender">
                <img
                  src={service.image || "/images/service-medical.png"}
                  alt={service.name[lang]}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-2.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-card border-2 border-white">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-eswen-deep">
                    {service.category[lang]}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-7 space-y-5">
                {/* Title + price */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-eswen-deep leading-tight tracking-tight">
                    {service.name[lang]}
                  </h3>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="rounded-xl bg-eswen-light-lavender px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("services_starting")}
                      </p>
                      <p className="text-lg font-bold text-eswen-deep">{service.startingPrice}</p>
                    </div>
                    <div className="rounded-xl bg-eswen-lavender/40 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {lang === "id" ? "Deposit (DP)" : "Deposit"}
                      </p>
                      <p className="text-sm font-bold text-eswen-deep">
                        IDR {(service.deposit || 0).toLocaleString("id-ID").replace(/,/g, ".")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-bold text-eswen-deep mb-2">
                    {lang === "id" ? "Tentang Layanan" : "About This Service"}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description[lang]}
                  </p>
                </div>

                {/* What to expect */}
                <div>
                  <h4 className="text-sm font-bold text-eswen-deep mb-3">
                    {lang === "id" ? "Yang Akan Anda Dapatkan" : "What to Expect"}
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {WHAT_TO_EXPECT.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-eswen-light-lavender text-eswen-deep shrink-0">
                          <item.icon className="h-3.5 w-3.5" />
                        </span>
                        {lang === "id" ? item.id : item.en}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deposit info */}
                <div className="rounded-xl bg-eswen-light-lavender/50 p-4 text-xs text-muted-foreground leading-relaxed">
                  <ShieldPlus className="inline h-3.5 w-3.5 text-eswen-soft-purple mb-1 mr-1" />
                  {lang === "id"
                    ? "Janji temu Anda teramankan setelah pembayaran deposit. DP akan dikurangi dari total biaya perawatan."
                    : "Your appointment is secured after deposit payment. The deposit will be deducted from your total treatment cost."}
                </div>
              </div>
            </div>

            {/* Footer — Book button */}
            <div className="shrink-0 border-t border-eswen-lavender bg-white p-4 sm:p-5">
              <Button
                onClick={handleBook}
                className="w-full rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-12 text-sm font-semibold shadow-eswen-soft hover:shadow-eswen-card transition-all"
              >
                <CalendarHeart className="h-4 w-4" />
                {t("nav_book")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
