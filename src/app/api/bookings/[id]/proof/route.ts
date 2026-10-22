import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatIDR } from "@/lib/eswen/booking";
import { isAdmin } from "@/lib/eswen/admin-auth";
import { ensureSiteSeeded, DEFAULT_CONFIG } from "@/lib/eswen/seed-full";
import type PDFKit from "pdfkit";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SiteConfig = typeof DEFAULT_CONFIG;

/** Read the live site config (DB) merged with defaults — same merge logic as
 *  /api/site-config so the PDF always reflects the admin's latest bank +
 *  contact info. */
async function getLiveConfig(): Promise<SiteConfig> {
  try {
    await ensureSiteSeeded();
    const row = await db.siteConfig.findUnique({ where: { id: "singleton" } });
    const stored = row ? JSON.parse(row.config) : DEFAULT_CONFIG;
    return {
      ...DEFAULT_CONFIG,
      ...stored,
      payment: { ...DEFAULT_CONFIG.payment, ...(stored.payment || {}) },
      contact: { ...DEFAULT_CONFIG.contact, ...(stored.contact || {}) },
    } as SiteConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** Format bookingDate (YYYY-MM-DD) + bookingTime (HH:mm) into a friendly
 *  Indonesian long date string e.g. "Senin, 15 Januari 2026 · 10:00 WITA". */
function formatWhen(bookingDate: string, bookingTime: string): string {
  try {
    const d = new Date(bookingDate + "T00:00:00");
    if (isNaN(d.getTime())) return `${bookingDate} · ${bookingTime} WITA`;
    const dayName = d.toLocaleDateString("id-ID", { weekday: "long" });
    const dayNum = d.getDate();
    const monName = d.toLocaleDateString("id-ID", { month: "long" });
    const year = d.getFullYear();
    return `${dayName}, ${dayNum} ${monName} ${year} · ${bookingTime} WITA`;
  } catch {
    return `${bookingDate} · ${bookingTime} WITA`;
  }
}

/** Pull a stable displayable booking summary. */
function summarize(b: {
  refCode: string;
  serviceName: string;
  doctorName: string;
  bookingDate: string;
  bookingTime: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientNotes: string | null;
  depositAmount: number;
  status: string;
  paymentMethod: string | null;
  paymentGateway: string | null;
}) {
  return {
    refCode: b.refCode,
    service: b.serviceName,
    doctor: b.doctorName,
    when: formatWhen(b.bookingDate, b.bookingTime),
    name: b.patientName,
    email: b.patientEmail,
    phone: b.patientPhone,
    notes: b.patientNotes ?? "",
    deposit: formatIDR(b.depositAmount),
    status: b.status,
  };
}

/** Colors that mirror the Eswen Medica brand palette. */
const COLORS = {
  deep: "#5B3A91",
  softPurple: "#8B5CC7",
  lavender: "#E9DDFF",
  lightLavender: "#F4EEFF",
  ink: "#1F2438",
  muted: "#6B7280",
  amber: "#B45309",
  amberBg: "#FEF3C7",
  green: "#15803D",
  greenBg: "#DCFCE7",
  white: "#FFFFFF",
  border: "#D9D1E8",
};

/** Build the PDF buffer for a single booking. */
async function buildProofPdf(
  doc: PDFKit.PDFDocument,
  booking: ReturnType<typeof summarize>,
  cfg: SiteConfig,
  generatedAt: Date
): Promise<Buffer> {
  // Logo mark + brand name + document title (top header band)
  const pageWidth = doc.page.width;
  const margin = 50;
  const headerHeight = 84;

  // Top header band — deep purple gradient feel
  doc.rect(0, 0, pageWidth, headerHeight).fill(COLORS.deep);

  // Logo mark (a small rounded square with the Eswen "E" — drawn since we
  // don't bundle image assets server-side; this stays crisp at any DPI).
  const markX = margin;
  const markY = 22;
  const markSize = 40;
  doc.roundedRect(markX, markY, markSize, markSize, 10).fill(COLORS.softPurple);
  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("E", markX + 13, markY + 9, { width: markSize - 26, align: "center" });

  // Brand name + document title
  doc
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(cfg.brand.name, markX + markSize + 14, markY + 4, { width: pageWidth - markX - markSize - 14 - margin });

  doc
    .fillColor("#E5D8FF")
    .font("Helvetica")
    .fontSize(9)
    .text("BOOKING CONFIRMATION · BUKTI BOOKING", markX + markSize + 14, markY + 26, { width: pageWidth - markX - markSize - 14 - margin });

  // ── Booking reference banner ─────────────────────────────────────────────
  const refY = headerHeight + 28;
  doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(9).text("BOOKING REFERENCE", margin, refY, { width: pageWidth - 2 * margin });
  doc
    .fillColor(COLORS.deep)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text(booking.refCode, margin, refY + 14, { width: pageWidth - 2 * margin });

  // Status pill (right side, next to ref code line)
  const statusUpper = booking.status.toUpperCase();
  const isConfirmed = booking.status === "CONFIRMED";
  const pillBg = isConfirmed ? COLORS.greenBg : COLORS.amberBg;
  const pillFg = isConfirmed ? COLORS.green : COLORS.amber;
  // PDFKit doesn't auto-measure text width for the pill background easily, so
  // we draw a fixed-size pill that comfortably fits our two possible labels.
  const pillW = 165;
  const pillH = 22;
  const pillX = pageWidth - margin - pillW;
  const pillY = refY + 22;
  doc.roundedRect(pillX, pillY, pillW, pillH, 11).fill(pillBg);
  doc
    .fillColor(pillFg)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(statusUpper, pillX, pillY + 6, { width: pillW, align: "center" });

  // ── Divider ────────────────────────────────────────────────────────────
  let y = refY + 70;
  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(1).strokeColor(COLORS.border).stroke();

  // ── Appointment details (2-column) ──────────────────────────────────────
  y += 14;
  doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(9).text("APPOINTMENT DETAILS", margin, y, { width: pageWidth - 2 * margin });
  y += 16;

  const colW = (pageWidth - 2 * margin) / 2 - 6;
  const leftX = margin;
  const rightX = margin + colW + 12;

  const rows: Array<[string, string]> = [
    ["Patient Name", booking.name],
    ["Email", booking.email],
    ["Phone / WhatsApp", booking.phone],
    ["Service", booking.service],
    ["Doctor", booking.doctor],
    ["Date & Time", booking.when],
  ];

  rows.forEach((entry, i) => {
    const label = entry[0];
    const value = entry[1];
    const col = i % 2;
    const rowIdx = Math.floor(i / 2);
    const cellX = col === 0 ? leftX : rightX;
    const cellY = y + rowIdx * 38;
    doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(8).text(label.toUpperCase(), cellX, cellY, { width: colW });
    doc.fillColor(COLORS.ink).font("Helvetica").fontSize(11).text(value, cellX, cellY + 12, { width: colW, lineGap: 1 });
  });

  y += Math.ceil(rows.length / 2) * 38 + 6;

  // Notes (if any) — single full-width row
  if (booking.notes) {
    doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(8).text("PATIENT NOTES", margin, y, { width: pageWidth - 2 * margin });
    doc.fillColor(COLORS.ink).font("Helvetica-Oblique").fontSize(10).text(booking.notes, margin, y + 12, { width: pageWidth - 2 * margin, lineGap: 1 });
    y += 12 + Math.max(14, doc.heightOfString(booking.notes, { width: pageWidth - 2 * margin, font: "Helvetica-Oblique", size: 10 })) + 6;
  }

  // ── Divider ────────────────────────────────────────────────────────────
  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(1).strokeColor(COLORS.border).stroke();
  y += 14;

  // ── Deposit + Bank Transfer details ─────────────────────────────────────
  doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(9).text("DEPOSIT PAYMENT — BANK TRANSFER", margin, y, { width: pageWidth - 2 * margin });
  y += 16;

  // Deposit amount — large bold
  doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(8).text("DEPOSIT AMOUNT", margin, y, { width: pageWidth - 2 * margin });
  doc.fillColor(COLORS.deep).font("Helvetica-Bold").fontSize(20).text(booking.deposit, margin, y + 12, { width: pageWidth - 2 * margin });
  y += 36;

  // Bank account card (filled lavender)
  const cardH = 96;
  doc.roundedRect(margin, y, pageWidth - 2 * margin, cardH, 10).fill(COLORS.lightLavender);
  const cardPadX = 18;
  const cardPadY = 14;
  const cardInnerX = margin + cardPadX;
  const cardInnerW = pageWidth - 2 * margin - 2 * cardPadX;

  doc.fillColor(COLORS.deep).font("Helvetica-Bold").fontSize(9).text("DESTINATION BANK ACCOUNT", cardInnerX, y + cardPadY, { width: cardInnerW });

  const bankRows: Array<[string, string]> = [
    ["Bank", cfg.payment.bankName],
    ["Account No.", cfg.payment.accountNumber],
    ["Account Holder", cfg.payment.accountHolder],
  ];
  bankRows.forEach((entry, i) => {
    const ry = y + cardPadY + 16 + i * 16;
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9).text(entry[0], cardInnerX, ry, { width: 110 });
    doc.fillColor(COLORS.ink).font(i === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(10).text(entry[1], cardInnerX + 110, ry, { width: cardInnerW - 110 });
  });

  y += cardH + 8;

  // Instructions (admin-editable bilingual hint)
  const instructions = cfg.payment.instructionsEn || cfg.payment.instructionsId;
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9).text(instructions, margin, y, { width: pageWidth - 2 * margin, lineGap: 1 });
  y += 10 + doc.heightOfString(instructions, { width: pageWidth - 2 * margin, font: "Helvetica", size: 9 }) + 6;

  // ── QR code (right) + payment-status note (left) ───────────────────────
  doc.moveTo(margin, y).lineTo(pageWidth - margin, y).lineWidth(1).strokeColor(COLORS.border).stroke();
  y += 14;

  doc.fillColor(COLORS.muted).font("Helvetica-Bold").fontSize(9).text("SCAN AT CLINIC", margin, y, { width: pageWidth - 2 * margin });
  y += 14;

  const qrSize = 110;
  let qrBuffer: Buffer | null = null;
  try {
    const dataUrl = await QRCode.toDataURL(booking.refCode, { margin: 1, width: 240 });
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    qrBuffer = Buffer.from(base64, "base64");
  } catch {
    qrBuffer = null;
  }

  if (qrBuffer) {
    doc.image(qrBuffer, margin, y, { width: qrSize, height: qrSize });
  } else {
    doc.roundedRect(margin, y, qrSize, qrSize, 8).fill(COLORS.lightLavender);
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8).text("QR unavailable", margin, y + qrSize / 2 - 6, { width: qrSize, align: "center" });
  }

  // Right-side text block beside the QR
  const noteX = margin + qrSize + 18;
  const noteW = pageWidth - margin - noteX;
  doc.fillColor(COLORS.deep).font("Helvetica-Bold").fontSize(11).text(booking.refCode, noteX, y, { width: noteW });
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9).text(
    "Show this QR (or your reference code) at the front desk to check in.",
    noteX, y + 16, { width: noteW, lineGap: 1 }
  );

  // Confirmation note (depends on status)
  const noteY = y + 50;
  doc.roundedRect(noteX, noteY, noteW, 44, 8).fill(isConfirmed ? COLORS.greenBg : COLORS.amberBg);
  doc
    .fillColor(isConfirmed ? COLORS.green : COLORS.amber)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(
      isConfirmed ? "BOOKING CONFIRMED" : "AWAITING BANK TRANSFER",
      noteX + 10, noteY + 8, { width: noteW - 20 }
    );
  doc
    .fillColor(COLORS.ink)
    .font("Helvetica")
    .fontSize(8)
    .text(
      isConfirmed
        ? "Your deposit was received. See you at the clinic."
        : "Please transfer the deposit to the account above. Booking will be confirmed once we receive your transfer.",
      noteX + 10, noteY + 22, { width: noteW - 20, lineGap: 1 }
    );

  y += qrSize + 18;

  // ── Footer ─────────────────────────────────────────────────────────────
  // Footer follows naturally after the QR section (so we never overflow the
  // page bottom and trigger PDFKit's auto-pagination — that produced blank
  // extra pages). Reserve ~70pt for the footer; the natural y after the QR
  // section is ~720pt and A4 usable height is ~742pt, so there is room.
  const footerY = Math.min(y + 8, doc.page.height - 80);
  doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).lineWidth(1).strokeColor(COLORS.border).stroke();

  doc.fillColor(COLORS.deep).font("Helvetica-Bold").fontSize(8).text("PLEASE BRING THIS CONFIRMATION TO YOUR APPOINTMENT", margin, footerY + 6, { width: pageWidth - 2 * margin });
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8).text(cfg.contact.address, margin, footerY + 18, { width: pageWidth - 2 * margin });
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8).text(
    `${cfg.contact.hours.en} · ${cfg.contact.phone} · ${cfg.contact.email}`,
    margin, footerY + 30, { width: pageWidth - 2 * margin }
  );
  doc.fillColor(COLORS.muted).font("Helvetica-Oblique").fontSize(7).text(
    `Generated ${generatedAt.toLocaleString("id-ID", { timeZone: "Asia/Makassar" })} WITA · Reference ${booking.refCode}`,
    margin, footerY + 42, { width: pageWidth - 2 * margin }
  );

  doc.end();

  // Collect the PDF bytes into a Buffer
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve) => {
    doc.on("end", () => resolve());
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  });
  return Buffer.concat(chunks);
}

/**
 * GET /api/bookings/[id]/proof
 * Generates a printable PDF "Bukti Booking" (booking proof) for the patient.
 *
 * Access:
 *  • Admin (valid eswen_admin cookie) → may download ANY booking's proof.
 *  • Patient → must supply ?email=<patient email> that matches the booking's
 *    patientEmail. We compare case-insensitively.
 *
 * The PDF includes: brand header, big reference code, status pill, patient +
 * appointment details, deposit amount, bank transfer destination account,
 * payment instructions (from SiteConfig → payment.instructionsEn), a QR code
 * encoding the reference code, and a clinic footer (address / hours / phone).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Booking id is required." }, { status: 400 });
  }

  try {
    const booking = await db.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }

    // Authorization: admin OR matching patient email.
    const admin = isAdmin(req);
    if (!admin) {
      const email = (new URL(req.url).searchParams.get("email") ?? "").trim().toLowerCase();
      const patientEmail = (booking.patientEmail ?? "").trim().toLowerCase();
      if (!email || !patientEmail || email !== patientEmail) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized — email does not match this booking." },
          { status: 401 }
        );
      }
    }

    const cfg = await getLiveConfig();
    const summary = summarize({
      refCode: booking.refCode,
      serviceName: booking.serviceName,
      doctorName: booking.doctorName,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      patientName: booking.patientName,
      patientEmail: booking.patientEmail,
      patientPhone: booking.patientPhone,
      patientNotes: booking.patientNotes,
      depositAmount: booking.depositAmount,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      paymentGateway: booking.paymentGateway,
    });

    // PDFKit is imported as a CJS default; in Next.js 16 + TS the live binding
    // is a function — call it directly.
    const PDFKit = (await import("pdfkit")).default as unknown as typeof import("pdfkit").default;
    const doc = new PDFKit({ size: "A4", margin: 50 }) as unknown as PDFKit.PDFDocument;

    const pdfBuffer = await buildProofPdf(doc, summary, cfg, new Date());

    const filename = `booking-${summary.refCode}.pdf`;
    // Return as PDF download (inline so the new-tab preview works too).
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBuffer.byteLength),
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Failed to generate booking proof.", debug: msg },
      { status: 500 }
    );
  }
}
