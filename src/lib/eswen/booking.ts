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

/** Services that a given doctor/beautician can perform (by category match). */
export function servicesForDoctor(doctor: Doctor): Service[] {
  // Map doctor category → service brand filter
  if (doctor.category === "doctor" || doctor.category === "wellness") {
    return services.filter((s) => s.brand === "medical");
  }
  // aesthetic + beauty → aesthetic brand
  return services.filter((s) => s.brand === "aesthetic");
}

/** Doctors who can perform a given service (by brand match). */
export function doctorsForService(service: Service): Doctor[] {
  if (service.brand === "medical") {
    return doctors.filter(
      (d) => d.category === "doctor" || d.category === "wellness"
    );
  }
  return doctors.filter(
    (d) => d.category === "aesthetic" || d.category === "beauty"
  );
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
