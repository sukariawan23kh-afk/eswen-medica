"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Gift, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/eswen/language-store";
import { tr } from "@/lib/eswen/i18n";

type Offer = {
  id: string;
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  offerType: string;
  badge: string;
  imageUrl: string;
  ctaTextEn: string;
  ctaTextId: string;
  ctaLink: string;
  priority: number;
};

const TYPE_KEY: Record<string, "promo_daily" | "promo_weekly" | "promo_monthly" | "promo_onetime"> = {
  daily: "promo_daily",
  weekly: "promo_weekly",
  monthly: "promo_monthly",
  onetime: "promo_onetime",
};

const STORAGE_PREFIX = "eswen_offer_seen_";

/** Has the user already seen + dismissed this offer within the cooldown window? */
function isSeen(id: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    // 24h cooldown — re-show the popup if the user dismissed it more than a day ago.
    const cooldownMs = 24 * 60 * 60 * 1000;
    return Date.now() - ts < cooldownMs;
  } catch {
    return false;
  }
}

/** Mark an offer as seen now. */
function markSeen(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + id, String(Date.now()));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * OfferPopup — auto-shown modal that promotes the highest-priority unseen
 * active offer. Appears ~800ms after page load. Doesn't show on the admin
 * route. Once dismissed, the offer is marked seen for 24h.
 */
export function OfferPopup() {
  const { lang } = useLanguage();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    // Don't show on admin route
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (hash === "admin") return;

    let cancelled = false;
    fetch("/api/offers", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.ok) return;
        const offers = (d.offers as Offer[]) || [];
        // Pick the highest-priority offer that hasn't been seen within 24h
        const unseen = offers.find((o) => !isSeen(o.id));
        if (!unseen) return;
        setOffer(unseen);
        const timer = setTimeout(() => {
          if (!shownRef.current) {
            shownRef.current = true;
            setOpen(true);
          }
        }, 800);
        return () => clearTimeout(timer);
      })
      .catch(() => {
        /* silent */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => {
    setOpen(false);
    if (offer) markSeen(offer.id);
  };

  const claim = () => {
    if (offer?.ctaLink) {
      const el = document.querySelector(offer.ctaLink);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    close();
  };

  const typeKey = offer ? TYPE_KEY[offer.offerType] || "promo_weekly" : "promo_weekly";

  return (
    <AnimatePresence>
      {open && offer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-eswen-deep/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated"
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-white/85 backdrop-blur text-eswen-deep hover:bg-white shadow-eswen-soft transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header / image */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-eswen-deep to-eswen-soft-purple">
              {offer.imageUrl && (
                 
                <img
                  src={offer.imageUrl}
                  alt={(lang === "id" ? offer.titleId : offer.titleEn) + " — Eswen Medica Bali"}
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep via-eswen-deep/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-12 flex items-end justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-bold text-eswen-deep">
                  <Gift className="h-3.5 w-3.5" /> {offer.badge || "OFFER"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/85 backdrop-blur px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-eswen-deep">
                  <Clock className="h-3 w-3" /> {tr(lang, typeKey)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              <h3 className="text-xl font-extrabold tracking-tight text-eswen-deep leading-tight">
                {lang === "id" ? offer.titleId : offer.titleEn}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {lang === "id" ? offer.descId : offer.descEn}
              </p>
              <div className="mt-5 flex items-center gap-2">
                <Button
                  onClick={claim}
                  className="flex-1 rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-11"
                >
                  {(offer.ctaTextEn || offer.ctaTextId)
                    ? lang === "id"
                      ? offer.ctaTextId || offer.ctaTextEn
                      : offer.ctaTextEn || offer.ctaTextId
                    : tr(lang, "promo_cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={close}
                  variant="ghost"
                  className="rounded-full h-11 text-muted-foreground hover:text-eswen-deep"
                >
                  {lang === "id" ? "Tutup" : "Close"}
                </Button>
              </div>
              <p className="mt-3 text-[10px] text-center text-muted-foreground/70">
                {lang === "id"
                  ? "Penawaran terbatas. Berlaku selama persediaan masih ada."
                  : "Limited-time offer. Valid while supplies last."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
