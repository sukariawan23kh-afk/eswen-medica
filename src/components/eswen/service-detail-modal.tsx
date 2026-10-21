"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CalendarHeart,
  ShieldPlus,
  Clock,
  Users,
  Globe,
  Stethoscope,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

  const allImages = service ? [service.image, ...(service.gallery || [])].filter(Boolean) : [];
  const [activeImage, setActiveImage] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
  /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setActiveImage(0);
  }, [service?.id]);

  useEffect(() => {
    if (!service || allImages.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % allImages.length);
    }, 3000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [service?.id, allImages.length]);

  const handleThumbClick = (index: number) => {
    setActiveImage(index);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (allImages.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % allImages.length);
      }, 3000);
    }
  };

  const handleBook = () => {
    if (service) {
      openDialog(service.id);
      onClose();
    }
  };

  const currentImage = allImages.length > 0
    ? allImages[Math.min(activeImage, allImages.length - 1)]
    : "/images/service-medical.png";

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
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur text-eswen-deep hover:bg-white shadow-sm"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen">
              <div className="relative h-48 sm:h-56 overflow-hidden bg-eswen-light-lavender">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage + activeImage}
                    src={currentImage}
                    alt={service.name[lang]}
                    className="h-full w-full object-cover absolute inset-0"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-5 flex items-center gap-2.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-card border-2 border-white">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-eswen-deep">
                    {service.category[lang]}
                  </span>
                </div>

                {allImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-2 rounded-full transition-all",
                          Math.min(activeImage, allImages.length - 1) === i
                            ? "w-6 bg-white"
                            : "w-2 bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-eswen bg-white border-b border-eswen-lavender">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => handleThumbClick(i)}
                      className={cn(
                        "h-14 w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                        Math.min(activeImage, allImages.length - 1) === i
                          ? "border-eswen-soft-purple ring-2 ring-eswen-soft-purple/30"
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-5 sm:p-7 space-y-5">
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

                <div>
                  <h4 className="text-sm font-bold text-eswen-deep mb-2">
                    {lang === "id" ? "Tentang Layanan" : "About This Service"}
                  </h4>
                  <div className="eswen-prose text-sm text-muted-foreground leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkBreaks, remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        ul: ({ children }) => (
                          <ul className="list-disc ml-5 mb-3 space-y-1 last:mb-0">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal ml-5 mb-3 space-y-1 last:mb-0">{children}</ol>
                        ),
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-bold text-eswen-deep">{children}</strong>
                        ),
                        em: ({ children }) => <em className="italic">{children}</em>,
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold text-eswen-deep mb-2 mt-3">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold text-eswen-deep mb-2 mt-3">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-bold text-eswen-deep mb-1 mt-2">{children}</h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-eswen-soft-purple pl-3 italic text-muted-foreground my-3">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-eswen-light-lavender px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                        hr: () => <hr className="border-eswen-lavender my-4" />,
                        a: ({ children, href }) => (
                          <a href={href} className="text-eswen-soft-purple underline hover:text-eswen-deep" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {service.description[lang]}
                    </ReactMarkdown>
                  </div>
                </div>

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

                <div className="rounded-xl bg-eswen-light-lavender/50 p-4 text-xs text-muted-foreground leading-relaxed">
                  <ShieldPlus className="inline h-3.5 w-3.5 text-eswen-soft-purple mb-1 mr-1" />
                  {lang === "id"
                    ? "Janji temu Anda teramankan setelah pembayaran deposit. DP akan dikurangi dari total biaya perawatan."
                    : "Your appointment is secured after deposit payment. The deposit will be deducted from your total treatment cost."}
                </div>
              </div>
            </div>

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