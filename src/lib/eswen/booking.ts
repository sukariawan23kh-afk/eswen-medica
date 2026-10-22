import { db } from "@/lib/db";
import { services, doctors, type Service, type Doctor } from "./data";

/** Daily appointment slots (WITA). Same for every working day. */
export const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

/** Services offered at the clinic. All services are medical (single brand). */
export function servicesForDoctor(_doctor: Doctor): Service[] {
  return services;
}

/** Doctors who can perform a given service. All doctors are medical
 *  professionals and can be assigned to any medical service at the clinic. */
export function doctorsForService(_service: Service): Doctor[] {
  return doctors;
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

export function getDoctorById(id: string): Doctor | undefined {
  return doctors.find((d) => d.id === id);
}

/** Generate a short human-friendly booking reference, e.g. "ESM-7F3A9K". */
export function generateRefCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ESM-${code}`;
}

/** Format an IDR amount, e.g. 100000 → "IDR 100.000". */
export function formatIDR(amount: number): string {
  return "IDR " + amount.toLocaleString("id-ID").replace(/,/g, ".");
}

/** Today's ISO date (YYYY-MM-DD) in WITA (UTC+8). */
export function todayWITA(): string {
  // WITA = UTC+8. Shift "now" by +8 hours then take the date parts.
  const now = new Date();
  const wita = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return wita.toISOString().slice(0, 10);
}

/** Return the next N selectable dates (YYYY-MM-DD) starting today, max 14 days. */
export function nextDates(count = 14): string[] {
  const out: string[] = [];
  const base = new Date();
  let added = 0;
  let offset = 0;
  while (added < count && offset < 60) {
    const d = new Date(base.getTime() + offset * 24 * 60 * 60 * 1000);
    // Skip the date-shifted ISO bug: build YYYY-MM-DD from local-ish WITA
    const wita = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const iso = wita.toISOString().slice(0, 10);
    out.push(iso);
    added++;
    offset++;
  }
  return out;
}

/** Get the set of already-booked time slots for a doctor on a given date. */
export async function getBookedSlots(
  doctorId: string,
  date: string
): Promise<string[]> {
  const existing = await db.booking.findMany({
    where: {
      doctorId,
      bookingDate: date,
      // Only bookings that actually occupy the slot count as "booked"
      status: {
        in: ["WAITING_PAYMENT", "CONFIRMED", "CHECKED IN", "IN TREATMENT"],
      },
    },
    select: { bookingTime: true },
  });
  return existing.map((b) => b.bookingTime);
}

/** Validate a date string is YYYY-MM-DD and within the allowed window. */
export function isValidBookingDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  const today = new Date(todayWITA() + "T00:00:00Z");
  const max = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  return d.getTime() >= today.getTime() && d.getTime() <= max.getTime();
}

/** Validate a time string is one of the known slots. */
export function isValidSlot(time: string): boolean {
  return (TIME_SLOTS as readonly string[]).includes(time);
}

/**
 * Dynamic booking status display.
 *
 * Drives the bilingual (Indonesian + English) status pill label + color across
 * the booking dialog, admin bookings table, and PDF proof endpoint.
 *
 * The key trick: a booking in `WAITING_PAYMENT` has TWO sub-states depending on
 * whether the client has clicked "I've Made the Transfer":
 *   - `clientDeclaredTransfer = false` → "Menunggu Pembayaran" / "Awaiting Payment" (amber)
 *   - `clientDeclaredTransfer = true`  → "Menunggu Verifikasi" / "Awaiting Verification" (orange)
 *
 * Without this, the system would keep showing "Waiting Payment" even after the
 * client transferred the money — misleading. The flag lets us surface the
 * client's self-declaration without changing the underlying status (the admin
 * must still verify receipt before flipping to CONFIRMED).
 */
export type BookingStatusDisplay = {
  label: string; // Indonesian label
  labelEn: string; // English label
  color: "amber" | "orange" | "green" | "red" | "gray";
};

export function getBookingStatusDisplay(booking: {
  status: string;
  clientDeclaredTransfer: boolean;
}): BookingStatusDisplay {
  if (booking.status === "CONFIRMED") {
    return { label: "Terkonfirmasi", labelEn: "Confirmed", color: "green" };
  }
  if (booking.status === "WAITING_PAYMENT") {
    if (booking.clientDeclaredTransfer) {
      return {
        label: "Menunggu Verifikasi",
        labelEn: "Awaiting Verification",
        color: "orange",
      };
    }
    return {
      label: "Menunggu Pembayaran",
      labelEn: "Awaiting Payment",
      color: "amber",
    };
  }
  if (booking.status === "CANCELLED") {
    return { label: "Dibatalkan", labelEn: "Cancelled", color: "red" };
  }
  if (booking.status === "PAYMENT_FAILED") {
    return { label: "Pembayaran Gagal", labelEn: "Payment Failed", color: "red" };
  }
  if (booking.status === "COMPLETED") {
    return { label: "Selesai", labelEn: "Completed", color: "green" };
  }
  if (booking.status === "CHECKED IN") {
    return { label: "Sudah Check-in", labelEn: "Checked In", color: "gray" };
  }
  if (booking.status === "IN TREATMENT") {
    return { label: "Sedang Ditangani", labelEn: "In Treatment", color: "gray" };
  }
  if (booking.status === "NO SHOW") {
    return { label: "Tidak Hadir", labelEn: "No Show", color: "red" };
  }
  return { label: booking.status, labelEn: booking.status, color: "gray" };
}

/** Map a BookingStatusDisplay color → Tailwind class string (for client UI). */
export const STATUS_PILL_CLASS: Record<BookingStatusDisplay["color"], string> = {
  amber: "bg-amber-100 text-amber-700",
  orange: "bg-orange-100 text-orange-700",
  green: "bg-green-100 text-green-700",
  red: "bg-rose-100 text-rose-700",
  gray: "bg-stone-100 text-stone-600",
};

