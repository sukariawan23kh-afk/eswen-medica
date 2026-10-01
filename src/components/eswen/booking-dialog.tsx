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
  CreditCard,
  Wallet,
  Smartphone,
  Building2,
  Clock,
  AlertCircle,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useBookingDialog } from "@/lib/eswen/booking-store";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT, tr } from "@/lib/eswen/i18n";
import {
  services,
  doctors,
  paymentMethods,
  paymentGateways,
} from "@/lib/eswen/data";
import { nextDates, formatIDR, doctorsForService } from "@/lib/eswen/booking";
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
};
type PayResult = {
  paymentOk: boolean;
  booking: CreatedBooking;
};

const STEPS = ["service", "doctor", "datetime", "info", "payment", "done"] as const;

export function BookingDialog() {
  const mounted = useMounted();
  const { open, preselectedServiceId, closeDialog } = useBookingDialog();
  const { lang } = useLanguage();
  const t = useT();

  const [step, setStep] = useState(0); // 0..5
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [info, setInfo] = useState({ name: "", email: "", phone: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState<string>("Credit Card");
  const [paymentGateway, setPaymentGateway] = useState<string>("Midtrans");

  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [created, setCreated] = useState<CreatedBooking | null>(null);
  const [payResult, setPayResult] = useState<PayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setPayResult(null);
      setError(null);
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

  // Create the booking when moving from info → payment (reserves the slot)
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
      setCreated(data.booking);
      setStep(4); // → payment
    } catch (e) {
      setError(e instanceof Error ? e.message : t("bk_err_generic"));
    } finally {
      setSubmitting(false);
    }
  };

  const payDeposit = async () => {
    if (!created) return;
    setPaying(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${created.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, paymentGateway }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || t("bk_err_generic"));
      setPayResult(data);
      setStep(5); // → done
    } catch (e) {
      setError(e instanceof Error ? e.message : t("bk_err_generic"));
    } finally {
      setPaying(false);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      // info → payment: create the booking first
      createBooking();
      return;
    }
    if (step === 4) {
      // payment → done: pay the deposit
      payDeposit();
      return;
    }
    // Advance service(0)→doctor(1)→datetime(2)→info(3)
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    if (step > 0 && step < 5) setStep((s) => s - 1);
  };

  const resetAndClose = () => {
    closeDialog();
  };

  const stepLabels = [
    t("bk_step_service"),
    t("bk_step_doctor"),
    t("bk_step_datetime"),
    t("bk_step_info"),
    t("bk_step_payment"),
    t("bk_step_done"),
  ];

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[92vh] overflow-hidden p-0 gap-0 rounded-3xl border-eswen-lavender bg-white">
        {/* Header with stepper */}
        <div className="bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white px-5 sm:px-7 py-4">
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

        {/* Body */}
        <div className="overflow-y-auto scrollbar-eswen px-5 sm:px-7 py-6 min-h-[280px] max-h-[calc(92vh-180px)] bg-eswen-gradient-soft">
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
                            <s.icon className="h-5 w-5" />
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
                  {/* Inline style for form inputs */}
                  <style>{`.form-input{width:100%;border-radius:0.75rem;border:1px solid var(--eswen-lavender);background:#fff;padding:0.625rem 0.875rem;font-size:0.875rem;color:var(--eswen-deep);outline:none;transition:border-color .15s,background .15s}.form-input::placeholder{color:var(--muted-foreground);opacity:.6}.form-input:focus{border-color:var(--eswen-soft-purple);background:#FCFAFF}`}</style>
                </StepWrap>
              )}

              {/* Step 4: Payment */}
              {step === 4 && created && (
                <StepWrap title={t("bk_pay_deposit")} desc={t("bk_pay_desc")}>
                  {/* Summary */}
                  <div className="rounded-2xl border border-eswen-lavender bg-white p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">{t("bk_deposit_amount")}</span>
                      <span className="text-lg font-extrabold text-eswen-deep">{created.depositFormatted}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 border-t border-eswen-lavender/60 pt-2">
                      <div className="flex justify-between"><span>{t("bk_service")}</span><span className="font-medium text-eswen-deep">{created.serviceName}</span></div>
                      <div className="flex justify-between"><span>{t("bk_with")}</span><span className="font-medium text-eswen-deep">{created.doctorName}</span></div>
                      <div className="flex justify-between"><span>{t("bk_when")}</span><span className="font-medium text-eswen-deep">{created.bookingDate} · {created.bookingTime}</span></div>
                      <div className="flex justify-between items-center pt-1">
                        <span>{t("bk_status_label")}</span>
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[10px] font-bold">{created.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{t("bk_pay_method")}</p>
                      <div className="space-y-1.5">
                        {paymentMethods.map((m) => {
                          const Icon = m === "Credit Card" ? CreditCard : m === "Bank Transfer" || m === "Virtual Account" ? Building2 : m === "E-Wallet" ? Wallet : Smartphone;
                          return (
                            <button
                              key={m}
                              onClick={() => setPaymentMethod(m)}
                              className={cn(
                                "w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                                paymentMethod === m ? "border-eswen-soft-purple bg-eswen-light-lavender text-eswen-deep" : "border-eswen-lavender bg-white text-muted-foreground hover:border-eswen-soft-purple"
                              )}
                            >
                              <Icon className="h-4 w-4" /> {m}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{t("bk_pay_gateway")}</p>
                      <div className="space-y-1.5">
                        {paymentGateways.map((g) => (
                          <button
                            key={g}
                            onClick={() => setPaymentGateway(g)}
                            className={cn(
                              "w-full rounded-xl border px-3 py-2 text-xs font-bold tracking-wide transition-all",
                              paymentGateway === g ? "border-eswen-soft-purple bg-eswen-light-lavender text-eswen-deep" : "border-eswen-lavender bg-white text-muted-foreground hover:border-eswen-soft-purple"
                            )}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-eswen-light-lavender/60 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-eswen-soft-purple mt-0.5 shrink-0" />
                    {t("bk_secure_note")}
                  </div>
                </StepWrap>
              )}

              {/* Step 5: Done / Failed */}
              {step === 5 && payResult && (
                <div className="text-center py-6">
                  {payResult.paymentOk ? (
                    <>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                        <PartyPopper className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-extrabold text-eswen-deep">{t("bk_confirm_title")}</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{t("bk_confirm_desc")}</p>
                      <div className="mt-5 inline-block rounded-2xl border border-eswen-lavender bg-white px-5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("bk_ref_code")}</p>
                        <p className="text-lg font-extrabold text-eswen-deep tracking-wider">{payResult.booking.refCode}</p>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground space-y-1 max-w-sm mx-auto text-left">
                        <div className="flex justify-between"><span>{t("bk_service")}</span><span className="font-medium text-eswen-deep">{payResult.booking.serviceName}</span></div>
                        <div className="flex justify-between"><span>{t("bk_with")}</span><span className="font-medium text-eswen-deep">{payResult.booking.doctorName}</span></div>
                        <div className="flex justify-between"><span>{t("bk_when")}</span><span className="font-medium text-eswen-deep">{payResult.booking.bookingDate} · {payResult.booking.bookingTime}</span></div>
                        <div className="flex justify-between items-center pt-1">
                          <span>{t("bk_status_label")}</span>
                          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-[10px] font-bold">{payResult.booking.status}</span>
                        </div>
                      </div>
                      <Button onClick={resetAndClose} className="mt-6 rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-11 px-6">
                        {t("bk_close")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                        <AlertCircle className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-extrabold text-eswen-deep">{t("bk_pay_failed_title")}</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{t("bk_pay_failed_desc")}</p>
                      <div className="mt-5 inline-block rounded-2xl border border-eswen-lavender bg-white px-5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t("bk_ref_code")}</p>
                        <p className="text-lg font-extrabold text-eswen-deep tracking-wider">{payResult.booking.refCode}</p>
                      </div>
                      <div className="mt-5 flex gap-2 justify-center">
                        <Button onClick={() => setStep(4)} variant="outline" className="rounded-full border-eswen-lavender-soft text-eswen-deep bg-white h-11">
                          <ArrowLeft className="h-4 w-4" /> {t("bk_retry_payment")}
                        </Button>
                        <Button onClick={resetAndClose} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-11">
                          {t("bk_close")}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
        {step < 5 && (
          <div className="border-t border-eswen-lavender bg-white px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
            <Button
              onClick={handleBack}
              disabled={step === 0 || submitting || paying}
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
              disabled={!canNext || submitting || paying}
              className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-10 px-5"
            >
              {(submitting || paying) && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? t("bk_processing") : paying ? t("bk_processing") : step === 4 ? t("bk_pay_now") : t("bk_next")}
              {!submitting && !paying && step !== 4 && <ArrowRight className="h-4 w-4" />}
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
