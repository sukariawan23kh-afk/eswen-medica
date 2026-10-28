"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CalendarHeart,
  Award,
  Globe,
  GraduationCap,
  BadgeCheck,
  Stethoscope,
  Sparkles,
  Clock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";
import { useBookingDialog } from "@/lib/eswen/booking-store";
import type { CfgDoctor } from "@/lib/eswen/site-config-context";

type Doctor = CfgDoctor;

const ROLE_BADGES: Record<string, { icon: typeof Stethoscope; en: string; id: string }> = {
  doctor: { icon: Stethoscope, en: "Medical Doctor", id: "Dokter Medis" },
  wellness: { icon: Sparkles, en: "Wellness Specialist", id: "Spesialis Wellness" },
};

export function DoctorDetailModal({
  doctor,
  onClose,
}: {
  doctor: Doctor | null;
  onClose: () => void;
}) {
  const { lang } = useLanguage();
  const t = useT();
  const { openDialog } = useBookingDialog();

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!doctor) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [doctor]);

  // Close on Escape
  useEffect(() => {
    if (!doctor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doctor, onClose]);

  const handleBook = () => {
    if (doctor) {
      openDialog(doctor.id);
      onClose();
    }
  };

  const hasBio = !!doctor?.bio?.[lang]?.trim();
  const hasEducation = !!doctor?.education?.[lang]?.trim();
  const hasCertifications = !!doctor?.certifications?.[lang]?.trim();
  const languages = doctor?.languages?.filter(Boolean) ?? [];
  const roleBadge = doctor ? ROLE_BADGES[doctor.category] : null;

  return (
    <AnimatePresence>
      {doctor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-eswen-deep/50 backdrop-blur-sm p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${doctor.name} profile`}
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
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur text-eswen-deep hover:bg-white shadow-md transition-all hover:scale-105"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen">
              {/* Header — large photo with name overlay */}
              <div className="relative h-72 sm:h-80 overflow-hidden bg-gradient-to-b from-eswen-light-lavender via-eswen-lavender/40 to-white">
                {/* Decorative gradient blob */}
                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-eswen-soft-purple/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-eswen-lavender/40 blur-3xl pointer-events-none" />

                <img
                  src={doctor.image}
                  alt={`${doctor.name}, ${doctor.role[lang]} at Eswen Medica Bali`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Strong gradient overlay for legible text */}
                <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/90 via-eswen-deep/30 to-transparent pointer-events-none" />

                {/* Role badge — top-left */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {roleBadge && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-eswen-deep shadow-sm">
                      <roleBadge.icon className="h-3 w-3" />
                      {lang === "id" ? roleBadge.id : roleBadge.en}
                    </span>
                  )}
                </div>

                {/* Name + role overlay — bottom-left */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 mb-1.5">
                    {doctor.specialty[lang]}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-white/85 mt-0.5">{doctor.role[lang]}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-7 space-y-6">
                {/* Quick stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <Stat
                    icon={<Award className="h-3.5 w-3.5" />}
                    label={lang === "id" ? "Pengalaman" : "Experience"}
                    value={doctor.experience[lang]}
                  />
                  <Stat
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label={lang === "id" ? "Bahasa" : "Languages"}
                    value={languages.join(" · ") || "EN · ID"}
                  />
                  <Stat
                    icon={<GraduationCap className="h-3.5 w-3.5" />}
                    label={lang === "id" ? "Kategori" : "Category"}
                    value={
                      lang === "id"
                        ? roleBadge?.id ?? doctor.category
                        : roleBadge?.en ?? doctor.category
                    }
                    className="sm:col-span-1"
                  />
                </div>

                {/* About */}
                {hasBio && (
                  <Section
                    icon={<Stethoscope className="h-4 w-4" />}
                    title={lang === "id" ? "Tentang" : "About"}
                  >
                    <MarkdownContent content={doctor.bio[lang]} />
                  </Section>
                )}

                {/* Education */}
                {hasEducation && (
                  <Section
                    icon={<GraduationCap className="h-4 w-4" />}
                    title={lang === "id" ? "Pendidikan & Pelatihan" : "Education & Training"}
                  >
                    <MarkdownContent content={doctor.education[lang]} />
                  </Section>
                )}

                {/* Certifications */}
                {hasCertifications && (
                  <Section
                    icon={<BadgeCheck className="h-4 w-4" />}
                    title={lang === "id" ? "Sertifikasi" : "Certifications"}
                  >
                    <MarkdownContent content={doctor.certifications[lang]} />
                  </Section>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                  <Section
                    icon={<Globe className="h-4 w-4" />}
                    title={lang === "id" ? "Bahasa yang Dikuasai" : "Languages Spoken"}
                  >
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lng) => (
                        <span
                          key={lng}
                          className="inline-flex items-center gap-1 rounded-full bg-eswen-light-lavender text-eswen-deep px-3 py-1.5 text-xs font-semibold border border-eswen-lavender"
                        >
                          <Globe className="h-3 w-3" />
                          {lng}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            </div>

            {/* Footer — Book button */}
            <div className="shrink-0 border-t border-eswen-lavender bg-white/95 backdrop-blur p-4 sm:p-5">
              <Button
                onClick={handleBook}
                className="w-full rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-12 text-sm font-semibold shadow-eswen-soft hover:shadow-eswen-card transition-all"
              >
                <CalendarHeart className="h-4 w-4" />
                {lang === "id" ? "Booking Janji Temu" : t("nav_book")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- helpers ---------- */

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-sm">
          {icon}
        </span>
        <h4 className="text-sm font-bold text-eswen-deep tracking-tight">{title}</h4>
      </div>
      <div className="pl-9">{children}</div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-eswen-light-lavender/60 border border-eswen-lavender px-3 py-2.5 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-eswen-soft-purple mb-0.5">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-bold text-eswen-deep leading-tight">{value}</p>
    </div>
  );
}

/**
 * Render markdown content (bio, education, certifications) with consistent
 * typography. Uses remark-gfm (tables, strikethrough, task lists) +
 * remark-breaks (single newlines → <br>).
 */
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-eswen text-sm text-foreground/80 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Custom renderers to keep the medical aesthetic + tight spacing
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-1 mb-2 last:mb-0 marker:text-eswen-soft-purple">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-1 mb-2 last:mb-0 marker:text-eswen-soft-purple">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-bold text-eswen-deep">{children}</strong>
          ),
          em: ({ children }) => <em className="text-eswen-deep/90">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-eswen-soft-purple underline underline-offset-2 hover:text-eswen-deep"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
