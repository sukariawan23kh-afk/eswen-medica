"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  CalendarHeart,
  ShieldCheck,
  Loader2,
  Building2,
  Clock,
  AlertCircle,
  PartyPopper,
  Download,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useBookingDialog } from "@/lib/eswen/booking-store";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT, useServices, useDoctors, usePayment } from "@/lib/eswen/site-config-context";
import { tr } from "@/lib/eswen/i18n";
import { services as staticServices, doctors as staticDoctors } from "@/lib/eswen/data";
import {
  nextDates,
  formatIDR,
  doctorsForService,
  getBookingStatusDisplay,
  STATUS_PILL_CLASS,
} from "@/lib/eswen/booking";
import { getLucideIcon } from "@/lib/eswen/icons";
import { useMounted } from "@/hooks/use-mounted";

type Slot = { time: string; booked: boolean };
type CreatedBooking = {
  id: string;
  refCode: string;
  status: string;
  serviceName: string;
  doctorName: string;
  bookingDate: string;
  bookingTime: string;
  depositAmount: number;
  depositFormatted: string;
  patientEmail?: string;
  patientName?: string;
  // Client self-declaration flag — true after the client clicks
  // "Saya Sudah Transfer" / "I've Made the Transfer". The status STAYS
  // WAITING_PAYMENT but the displayed pill flips to "Menunggu Verifikasi".
  clientDeclaredTransfer?: boolean;
  clientDeclaredAt?: string;
};

// Online payment methods (Credit Card / QRIS / E-Wallet / Virtual Account) were
// removed — the clinic ONLY accepts Bank Transfer. The booking flow is now:
//   1. Service → 2. Doctor → 3. Date & Time → 4. Patient Info → 5. Done
// On "Book Appointment" (step 3 → 4), the booking is created with status
// WAITING_PAYMENT + paymentMethod="Bank Transfer" + paymentGateway="Manual".
// Step 4 shows the bank account details + deposit amount + a "Download Bukti
// Booking" (PDF) button. The booking is CONFIRMED later by an admin who
// verifies the deposit arrived in the clinic account.
const STEPS = ["service", "doctor", "datetime", "info", "done"] as const;

export function BookingDialog() {
  const mounted = useMounted();
  const { open, preselectedServiceId, closeDialog } = useBookingDialog();
  const { lang } = useLanguage();
  const t = useT();
  const services = useServices(staticServices);
  const doctors = useDoctors(staticDoctors);
  const payment = usePayment();

  const [step, setStep] = useState(0); // 0..4
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [info, setInfo] = useState({ name: "", email: "", phone: "", notes: "" });

  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedBooking | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Client self-declaration state — mirrors `booking.clientDeclaredTransfer`
  // on the server. Set to true when the client clicks "Saya Sudah Transfer".
  // Drives the dynamic status pill (Menunggu Pembayaran → Menunggu Verifikasi).
  const [declaredTransfer, setDeclaredTransfer] = useState(false);
  const [declaring, setDeclaring] = useState(false);
  const [declareMsg, setDeclareMsg] = useState<string | null>(null);

  // Reset everything when the dialog opens (or preselected service changes)
  useEffect(() => {
    if (open) {
      setStep(preselectedServiceId ? 1 : 0);
      setServiceId(preselectedServiceId);
      setDoctorId(null);
      setDate("");
      setTime("");
      setSlots(null);
      setCreated(null);
      setError(null);
      setDeclaredTransfer(false);
      setDeclaring(false);
      setDeclareMsg(null);
    }
  }, [open, preselectedServiceId]);

  // Stable error message — `tr(lang, ...)` returns a plain string (not a new
  // function each render), so fetchSlots only changes when `lang` changes,
  // preventing an infinite fetch loop.
  const errGeneric = tr(lang, "bk_err_generic");

  // Fetch real-time availability whenever doctor + date are selected
  const fetchSlots = useCallback(async (dId: string, d: string) => {
    setSlotsLoading(true);
    setSlotsError(null);
    setSlots(null);
    try {
      const res = await fetch(
        `/api/bookings/slots?doctorId=${encodeURIComponent(dId)}&date=${encodeURIComponent(d)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed");
      setSlots(data.slots);
    } catch (e) {
      setSlotsError(e instanceof Error ? e.message : errGeneric);
    } finally {
      setSlotsLoading(false);
    }
  }, [errGeneric]);

  useEffect(() => {
    if (doctorId && date) fetchSlots(doctorId, date);
    else setSlots(null);
  }, [doctorId, date, fetchSlots]);

  const selectedService = services.find((s) => s.id === serviceId) || null;
  const selectedDoctor = doctors.find((d) => d.id === doctorId) || null;
  const availableDoctors = serviceId
    ? doctorsForService(services.find((s) => s.id === serviceId)!)
    : doctors;
  const dates = nextDates(14);

  // ----- Navigation helpers -----
  const canNext = (() => {
    if (step === 0) return !!serviceId;
    if (step === 1) return !!doctorId;
    if (step === 2) return !!date && !!time;
    if (step === 3)
      return (
        info.name.trim().length >= 2 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email) &&
        info.phone.trim().length >= 6
      );
    return true;
  })();

  // Create the booking on "Book Appointment" (step 3 → 4). The booking is
  // created in WAITING_PAYMENT with paymentMethod="Bank Transfer" hardcoded
  // on the server. No payment-gateway step exists anymore.
  const createBooking = async () => {
    if (!serviceId || !doctorId || !date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          doctorId,
          bookingDate: date,
          bookingTime: time,
          patientName: info.name.trim(),
          patientEmail: info.email.trim(),
          patientPhone: info.phone.trim(),
          patientNotes: info.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        if (data?.code === "SLOT_TAKEN") {
          // Jump back to the datetime step
          setStep(2);
          setTime("");
          throw new Error(t("bk_err_slot_taken"));
        }
        throw new Error(data?.error || t("bk_err_generic"));
      }
      setCreated({
        ...data.booking,
        patientEmail: info.email.trim(),
        patientName: info.name.trim(),
      });
      // New bookings always start with clientDeclaredTransfer=false on the
      // server — mirror that locally so the dynamic pill renders the
      // "Menunggu Pembayaran" / "Awaiting Payment" state, not "Menunggu
      // Verifikasi".
      setDeclaredTransfer(false);
      setDeclareMsg(null);
      setStep(4); // → done
    } catch (e) {
      setError(e instanceof Error ? e.message : t("bk_err_generic"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      // info → done: create the booking (Bank Transfer is auto-selected)
      createBooking();
      return;
    }
    // Advance service(0)→doctor(1)→datetime(2)→info(3)
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    if (step > 0 && step < 4) setStep((s) => s - 1);
  };

  const resetAndClose = () => {
    closeDialog();
  };

  // Opens the PDF booking proof in a new tab — the email query param lets the
  // server verify the requester is the patient who booked (admin downloads
  // don't need this since admin auths via cookie).
  const downloadProof = () => {
    if (!created) return;
    const email = encodeURIComponent(created.patientEmail ?? "");
    const url = `/api/bookings/${created.id}/proof${email ? `?email=${email}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Client self-declaration: client clicked "Saya Sudah Transfer" / "I've Made
  // the Transfer". POSTs to /api/bookings/{id}/declare-transfer with the
  // patient email (server validates it matches the booking's patientEmail).
  // On success → flip declaredTransfer to true → the status pill flips from
  // "Menunggu Pembayaran" to "Menunggu Verifikasi" and the button disappears.
  const declareTransfer = async () => {
    if (!created) return;
    setDeclaring(true);
    setDeclareMsg(null);
    try {
      const res = await fetch(
        `/api/bookings/${created.id}/declare-transfer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: created.patientEmail }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || t("bk_err_generic"));
      }
      setDeclaredTransfer(true);
      setDeclareMsg(
        lang === "id"
          ? "Terima kasih! Notifikasi sudah terkirim ke admin untuk verifikasi."
          : "Thank you! The admin has been notified to verify your transfer."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t("bk_err_generic"));
    } finally {
      setDeclaring(false);
    }
  };

  const stepLabels = [
    t("bk_step_service"),
    t("bk_step_doctor"),
    t("bk_step_datetime"),
    t("bk_step_info"),
    t("bk_step_done"),
  ];

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="flex flex-col overflow-hidden p-0 gap-0 rounded-none sm:rounded-3xl border-eswen-lavender bg-white h-[100dvh] sm:h-auto w-full sm:w-[95vw] max-w-none sm:max-w-3xl max-h-[100dvh] sm:max-h-[90vh]">
        {/* Header with stepper */}
        <div className="shrink-0 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white px-5 sm:px-7 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur shrink-0">
                <CalendarHeart className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <DialogTitle asChild>
                  <h2 className="font-bold text-base leading-tight truncate">{t("bk_title")}</h2>
                </DialogTitle>
                <DialogDescription asChild>
                  <p className="text-[11px] text-white/80">
                    {t("bk_step")} {step + 1} {t("bk_of")} {STEPS.length}
                  </p>
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15 transition-colors shrink-0"
              aria-label={t("bk_close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Stepper */}
          <div className="mt-3 flex items-center gap-1 overflow-x-auto scrollbar-eswen pb-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all",
                    i < step && "bg-white/25 text-white",
                    i === step && "bg-white text-eswen-deep",
                    i > step && "bg-white/10 text-white/60"
                  )}
                >
                  {i < step ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px]">
                      {i + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">{stepLabels[i]}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className={cn("h-0.5 w-3 rounded-full", i < step ? "bg-white/50" : "bg-white/15")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body — flex-1 fills remaining space between fixed header & footer; min-h-0 enables proper scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen px-5 sm:px-7 py-6 bg-eswen-gradient-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 0: Service */}
              {step === 0 && (
                <StepWrap title={t("bk_choose_service")} desc={t("bk_choose_service_desc")}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setServiceId(s.id); setDoctorId(null); }}
                        className={cn(
                          "text-left rounded-2xl border p-4 transition-all hover:-translate-y-0.5",
                          serviceId === s.id
                            ? "border-eswen-soft-purple bg-eswen-light-lavender shadow-eswen-soft ring-2 ring-eswen-soft-purple/30"
                            : "border-eswen-lavender bg-white hover:border-eswen-soft-purple"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shrink-0">
                            {(() => { const Icon = getLucideIcon(typeof s.icon === "string" ? s.icon : "Stethoscope"); return <Icon className="h-5 w-5" />; })()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-eswen-soft-purple">
                              {s.category[lang]}
                            </p>
                            <h4 className="text-sm font-bold text-eswen-deep leading-tight">{s.name[lang]}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description[lang]}</p>
                            <p className="text-xs font-bold text-eswen-deep mt-2">
                              {t("services_starting")}: {s.startingPrice}
                            </p>
                          </div>
                          {serviceId === s.id && (
                            <Check className="h-5 w-5 text-eswen-soft-purple shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </StepWrap>
              )}

              {/* Step 1: Doctor */}
              {step === 1 && (
                <StepWrap title={t("bk_choose_doctor")} desc={t("bk_choose_doctor_desc")}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {availableDoctors.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDoctorId(d.id)}
                        className={cn(
                          "text-left rounded-2xl border p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5",
                          doctorId === d.id
                            ? "border-eswen-soft-purple bg-eswen-light-lavender shadow-eswen-soft ring-2 ring-eswen-soft-purple/30"
                            : "border-eswen-lavender bg-white hover:border-eswen-soft-purple"
                        )}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-lavender-soft to-eswen-soft-purple text-white font-bold text-sm shrink-0 overflow-hidden">
                          {d.initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-eswen-deep leading-tight">{d.name}</h4>
                          <p className="text-[11px] font-semibold text-eswen-soft-purple">{d.role[lang]}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{d.specialty[lang]}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {d.experience[lang]} · {d.languages.join(" · ")}
                          </p>
                        </div>
                        {doctorId === d.id && <Check className="h-5 w-5 text-eswen-soft-purple shrink-0" />}
                      </button>
                    ))}
                  </div>
                </StepWrap>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <StepWrap title={t("bk_choose_datetime")} desc={t("bk_choose_datetime_desc")}>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        {t("bk_select_date")}
                      </p>
                      <div className="flex gap-2 overflow-x-auto scrollbar-eswen pb-2 -mx-1 px-1">
                        {dates.map((d) => {
                          const dt = new Date(d + "T00:00:00");
                          const dayName = dt.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "short" });
                          const dayNum = dt.getDate();
                          const monName = dt.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short" });
                          const active = date === d;
                          return (
                            <button
                              key={d}
                              onClick={() => { setDate(d); setTime(""); }}
                              className={cn(
                                "flex flex-col items-center justify-center rounded-2xl border px-3 py-2 min-w-[64px] transition-all shrink-0",
                                active
                                  ? "border-eswen-soft-purple bg-eswen-deep text-white shadow-eswen-soft"
                                  : "border-eswen-lavender bg-white text-eswen-deep hover:border-eswen-soft-purple"
                              )}
                            >
                              <span className="text-[10px] font-semibold uppercase">{dayName}</span>
                              <span className="text-lg font-extrabold leading-none my-0.5">{dayNum}</span>
                              <span className="text-[10px] opacity-80">{monName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        {t("bk_select_time")}
                      </p>
                      {!date && (
                        <p className="text-xs text-muted-foreground py-4 text-center">{t("bk_select_date")} →</p>
                      )}
                      {date && slotsLoading && (
                        <p className="text-xs text-muted-foreground py-4 text-center flex items-center justify-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("bk_loading_slots")}
                        </p>
                      )}
                      {date && slotsError && (
                        <p className="text-xs text-rose-600 py-4 text-center">{slotsError}</p>
                      )}
                      {date && slots && !slotsLoading && (
                        <>
                          {slots.every((s) => s.booked) ? (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                              {t("bk_no_slots")}
                            </p>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                              {slots.map((s) => (
                                <button
                                  key={s.time}
                                  disabled={s.booked}
                                  onClick={() => setTime(s.time)}
                                  className={cn(
                                    "rounded-xl border px-2 py-2 text-sm font-semibold transition-all",
                                    s.booked
                                      ? "border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed line-through"
                                      : time === s.time
                                      ? "border-eswen-soft-purple bg-eswen-deep text-white shadow-eswen-soft"
                                      : "border-eswen-lavender bg-white text-eswen-deep hover:border-eswen-soft-purple hover:bg-eswen-light-lavender"
                                  )}
                                  title={s.booked ? t("bk_slot_booked") : s.time}
                                >
                                  {s.time}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </StepWrap>
              )}

              {/* Step 3: Patient info */}
              {step === 3 && (
                <StepWrap title={t("bk_your_info")} desc={t("bk_your_info_desc")}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label={t("bk_label_name")} required>
                      <input
                        value={info.name}
                        onChange={(e) => setInfo({ ...info, name: e.target.value })}
                        placeholder={t("bk_ph_name")}
                        className="form-input"
                        maxLength={80}
                      />
                    </Field>
                    <Field label={t("bk_label_phone")} required>
                      <input
                        value={info.phone}
                        onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                        placeholder={t("bk_ph_phone")}
                        className="form-input"
                        maxLength={24}
                      />
                    </Field>
                    <Field label={t("bk_label_email")} required className="sm:col-span-2">
                      <input
                        type="email"
                        value={info.email}
                        onChange={(e) => setInfo({ ...info, email: e.target.value })}
                        placeholder={t("bk_ph_email")}
                        className="form-input"
                        maxLength={120}
                      />
                    </Field>
                    <Field label={t("bk_label_notes")} className="sm:col-span-2">
                      <textarea
                        value={info.notes}
                        onChange={(e) => setInfo({ ...info, notes: e.target.value })}
                        placeholder={t("bk_ph_notes")}
                        className="form-input min-h-[72px] resize-none"
                        maxLength={500}
                      />
                    </Field>
                  </div>

                  {/* Bank Transfer notice — payment is offline to the clinic account */}
                  <div className="mt-5 rounded-2xl border border-eswen-soft-purple/40 bg-eswen-light-lavender/40 p-3 text-[11px] text-eswen-deep/80 leading-relaxed flex items-start gap-2">
                    <Building2 className="h-3.5 w-3.5 text-eswen-soft-purple mt-0.5 shrink-0" />
                    <span>
                      {lang === "id"
                        ? "Pembayaran hanya via Transfer Bank ke rekening klinik. Setelah Anda booking, kami tampilkan nomor rekening + jumlah deposit. Booking akan Dikonfirmasi admin setelah transfer diterima."
                        : "Payment is via Bank Transfer to the clinic's account only. After you book, we'll show the bank account + deposit amount. Your booking will be CONFIRMED by our admin once the transfer is received."}
                    </span>
                  </div>

                  {/* Inline style for form inputs */}
                  <style>{`.form-input{width:100%;border-radius:0.75rem;border:1px solid var(--eswen-lavender);background:#fff;padding:0.625rem 0.875rem;font-size:0.875rem;color:var(--eswen-deep);outline:none;transition:border-color .15s,background .15s}.form-input::placeholder{color:var(--muted-foreground);opacity:.6}.form-input:focus{border-color:var(--eswen-soft-purple);background:#FCFAFF}`}</style>
                </StepWrap>
              )}

              {/* Step 4: Done — booking created, awaiting bank transfer */}
              {step === 4 && created && (() => {
                // Dynamic status pill — reflects the client self-declaration
                // sub-state of WAITING_PAYMENT so we never misleadingly show
                // "Waiting Payment" after the client has transferred.
                const statusDisplay = getBookingStatusDisplay({
                  status: created.status,
                  clientDeclaredTransfer: declaredTransfer,
                });
                const label = lang === "id" ? statusDisplay.label : statusDisplay.labelEn;
                const showDeclareBtn =
                  created.status === "WAITING_PAYMENT" && !declaredTransfer;
                return (
                  <div className="text-center py-2">
                    <div className={cn(
                      "mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4",
                      statusDisplay.color === "green"
                        ? "bg-green-100 text-green-600"
                        : statusDisplay.color === "orange"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-amber-100 text-amber-600"
                    )}>
                      {statusDisplay.color === "green"
                        ? <CheckCircle2 className="h-8 w-8" />
                        : statusDisplay.color === "orange"
                        ? <Clock className="h-8 w-8" />
                        : <PartyPopper className="h-8 w-8" />}
                    </div>
                    <h3 className="text-xl font-extrabold text-eswen-deep">{t("bk_confirm_title")}</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{t("bk_confirm_desc")}</p>

                    <div className="mt-5 inline-block rounded-2xl border border-eswen-lavender bg-white px-5 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("bk_ref_code")}</p>
                      <p className="text-lg font-extrabold text-eswen-deep tracking-wider">{created.refCode}</p>
                    </div>

                    {/* Summary */}
                    <div className="mt-4 text-xs text-muted-foreground space-y-1 max-w-sm mx-auto text-left">
                      <div className="flex justify-between"><span>{t("bk_service")}</span><span className="font-medium text-eswen-deep">{created.serviceName}</span></div>
                      <div className="flex justify-between"><span>{t("bk_with")}</span><span className="font-medium text-eswen-deep">{created.doctorName}</span></div>
                      <div className="flex justify-between"><span>{t("bk_when")}</span><span className="font-medium text-eswen-deep">{created.bookingDate} · {created.bookingTime}</span></div>
                      <div className="flex justify-between border-t border-eswen-lavender/60 pt-1"><span>{t("bk_deposit_amount")}</span><span className="font-bold text-eswen-deep">{created.depositFormatted}</span></div>
                      <div className="flex justify-between items-center pt-1">
                        <span>{t("bk_status_label")}</span>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                          STATUS_PILL_CLASS[statusDisplay.color]
                        )}>
                          {label}
                        </span>
                      </div>
                    </div>

                    {/* Bank Transfer details */}
                    <div className="mt-5 rounded-2xl border border-eswen-soft-purple/40 bg-white p-4 text-left max-w-sm mx-auto">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-eswen-deep mb-2 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-eswen-soft-purple" />
                        {lang === "id" ? "Rekening Tujuan (Transfer Bank)" : "Destination Account (Bank Transfer)"}
                      </p>
                      <div className="rounded-xl bg-eswen-light-lavender/50 p-3 space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground text-xs">{lang === "id" ? "Bank" : "Bank"}</span><span className="font-semibold text-eswen-deep">{payment.bankName}</span></div>
                        <div className="flex justify-between items-center"><span className="text-muted-foreground text-xs">{lang === "id" ? "No. Rekening" : "Account No."}</span><span className="font-mono font-bold text-eswen-deep text-base tracking-wider">{payment.accountNumber}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground text-xs">{lang === "id" ? "Atas Nama" : "Account Holder"}</span><span className="font-semibold text-eswen-deep">{payment.accountHolder}</span></div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{lang === "id" ? payment.instructionsId : payment.instructionsEn}</p>
                      <p className="text-[11px] text-eswen-soft-purple mt-2 font-semibold flex items-start gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          {lang === "id" ? (
                            <>Transfer sejumlah <span className="font-bold text-eswen-deep">{created.depositFormatted}</span> lalu tunggu konfirmasi admin (biasanya dalam beberapa jam pada jam buka 08:00–20:00 WITA).</>
                          ) : (
                            <>Transfer <span className="font-bold text-eswen-deep">{created.depositFormatted}</span> then wait for admin confirmation (usually within a few hours during 08:00–20:00 WITA).</>
                          )}
                        </span>
                      </p>
                    </div>

                    {/* Self-declaration thank-you message (after "I've Made the Transfer") */}
                    {declareMsg && declaredTransfer && (
                      <div className="mt-4 max-w-sm mx-auto rounded-2xl border border-green-200 bg-green-50 p-3 text-left flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-green-800 leading-relaxed">{declareMsg}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
                      {showDeclareBtn && (
                        <Button
                          onClick={declareTransfer}
                          disabled={declaring}
                          className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white h-11 px-5"
                        >
                          {declaring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          {lang === "id" ? "Saya Sudah Transfer" : "I've Made the Transfer"}
                        </Button>
                      )}
                      <Button
                        onClick={downloadProof}
                        variant={showDeclareBtn ? "outline" : "default"}
                        className={cn(
                          "rounded-full h-11 px-5",
                          showDeclareBtn
                            ? "border-eswen-lavender text-eswen-deep bg-white"
                            : "bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white"
                        )}
                      >
                        <Download className="h-4 w-4" />
                        {lang === "id" ? "Unduh Bukti Booking" : "Download Bukti Booking"}
                      </Button>
                      <Button
                        onClick={resetAndClose}
                        variant="outline"
                        className="rounded-full border-eswen-lavender text-eswen-deep bg-white h-11 px-5"
                      >
                        {t("bk_close")}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lang === "id"
                        ? "Simpan kode referensi — Anda dapat mengunduh bukti PDF kapan saja."
                        : "Save your reference code — you can download the PDF proof anytime."}
                    </p>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer with Back / Next */}
        {step < 4 && (
          <div className="shrink-0 border-t border-eswen-lavender bg-white px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
            <Button
              onClick={handleBack}
              disabled={step === 0 || submitting}
              variant="ghost"
              className="rounded-full text-eswen-deep hover:bg-eswen-light-lavender h-10"
            >
              <ArrowLeft className="h-4 w-4" /> {t("bk_back")}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {selectedService && <span className="hidden sm:inline truncate max-w-[180px]">{selectedService.name[lang]}</span>}
              {selectedDoctor && <>· <span className="hidden sm:inline truncate max-w-[120px]">{selectedDoctor.name}</span></>}
            </div>
            <Button
              onClick={handleNext}
              disabled={!canNext || submitting}
              className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-10 px-5"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting
                ? t("bk_processing")
                : step === 3
                ? (lang === "id" ? "Buat Booking" : "Book Appointment")
                : t("bk_next")}
              {!submitting && step !== 3 && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StepWrap({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-extrabold text-eswen-deep">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 mb-4">{desc}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
        {label} {required && <span className="text-eswen-soft-purple">*</span>}
      </span>
      {children}
    </label>
  );
}
