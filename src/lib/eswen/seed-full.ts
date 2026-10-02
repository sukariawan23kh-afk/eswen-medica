import { db } from "@/lib/db";
import { translations } from "@/lib/eswen/i18n";
import { contactInfo } from "@/lib/eswen/data";
import { ensureArticlesSeeded } from "@/lib/eswen/seed";

/**
 * The full default site config — seeds the DB on first run so the public site
 * renders identically, and the admin can edit everything from there.
 *
 * `translations` is copied verbatim from i18n.ts (all EN + ID strings), so
 * EVERY translatable piece of copy on the site is editable from the admin.
 */
export const DEFAULT_CONFIG = {
  logo: {
    url: "", // empty = use the default Sparkles mark
    alt: "Eswen Medica",
  },
  brand: {
    name: "ESWEN MEDICA",
    tagline: { en: "Health • Wellness • Confidence", id: "Kesehatan • Wellness • Kepercayaan" },
  },
  contact: {
    address: contactInfo.address,
    whatsapp: contactInfo.whatsapp,
    phone: contactInfo.phone,
    email: contactInfo.email,
    hours: contactInfo.hours,
    mapEmbed: contactInfo.mapEmbed,
    directions: contactInfo.directions,
  },
  social: {
    instagram: "#",
    facebook: "#",
    tiktok: "#",
  },
  // Clinic bank account where deposit payments are received. Shown to clients
  // who pick "Bank Transfer" and referenced by the admin when confirming.
  payment: {
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "1234567890",
    accountHolder: "PT Eswen Medica Sehat",
    instructionsEn:
      "Transfer the deposit amount to the bank account below. Once we receive your transfer (usually confirmed within a few hours during 08:00–20:00 WITA), our admin will confirm your booking.",
    instructionsId:
      "Transfer jumlah deposit ke rekening bank di bawah ini. Setelah transfer kami terima (biasanya dikonfirmasi dalam beberapa jam pada 08:00–20:00 WITA), admin kami akan mengkonfirmasi booking Anda.",
  },
  theme: {
    primary: "#5B3A91",
    softPurple: "#8B5CC7",
    lavender: "#E9DDFF",
    lightLavender: "#F4EEFF",
  },
  translations: {
    en: (translations as { en: Record<string, string> }).en,
    id: (translations as { id: Record<string, string> }).id,
  },
};

type ServiceSeed = {
  id: string;
  categoryEn: string; categoryId: string;
  nameEn: string; nameId: string;
  descriptionEn: string; descriptionId: string;
  startingPrice: string; deposit: number;
  icon: string; image: string; brand: string;
  order: number;
};

const SEED_SERVICES: ServiceSeed[] = [
  {
    id: "general-medical",
    categoryEn: "General Medical Services", categoryId: "Layanan Medis Umum",
    nameEn: "General Medical Consultation", nameId: "Konsultasi Medis Umum",
    descriptionEn: "Comprehensive general practice consultations, health screenings, and primary medical care delivered by experienced international-standard physicians.",
    descriptionId: "Konsultasi praktik umum terpadu, skrining kesehatan, dan layanan medis primer oleh dokter berpengalaman berstandar internasional.",
    startingPrice: "IDR 350.000", deposit: 100000,
    icon: "Stethoscope", image: "/images/service-medical.png", brand: "medical", order: 1,
  },
  {
    id: "dermatology",
    categoryEn: "Dermatology", categoryId: "Dermatologi",
    nameEn: "Dermatology & Skin Health", nameId: "Dermatologi & Kesehatan Kulit",
    descriptionEn: "Medical-grade diagnosis and treatment of skin conditions — acne, eczema, pigmentation, and skin infections — by board-certified dermatologists.",
    descriptionId: "Diagnosis dan perawatan medis untuk masalah kulit — jerawat, eksem, pigmentasi, dan infeksi kulit — oleh dokter kulit bersertifikat.",
    startingPrice: "IDR 500.000", deposit: 120000,
    icon: "Microscope", image: "/images/service-medical.png", brand: "medical", order: 2,
  },
  {
    id: "wellness-program",
    categoryEn: "Wellness Program", categoryId: "Program Wellness",
    nameEn: "Wellness & Vitality Program", nameId: "Program Wellness & Vitalitas",
    descriptionEn: "Holistic wellness programs, IV therapy, vitamin boosters, and lifestyle consultation to enhance your overall wellbeing.",
    descriptionId: "Program wellness holistik, terapi IV, booster vitamin, dan konsultasi gaya hidup untuk meningkatkan kesejahteraan menyeluruh.",
    startingPrice: "IDR 750.000", deposit: 150000,
    icon: "HeartPulse", image: "/images/service-medical.png", brand: "medical", order: 3,
  },
  {
    id: "consultation",
    categoryEn: "Consultation", categoryId: "Konsultasi",
    nameEn: "Specialist Consultation", nameId: "Konsultasi Spesialis",
    descriptionEn: "Personalized consultations with our specialists to design the right medical treatment plan for your needs and health goals.",
    descriptionId: "Konsultasi personal dengan spesialis kami untuk merancang rencana perawatan medis yang tepat bagi kebutuhan dan tujuan kesehatan Anda.",
    startingPrice: "IDR 250.000", deposit: 75000,
    icon: "ClipboardList", image: "/images/service-medical.png", brand: "medical", order: 4,
  },
  {
    id: "preventive-care",
    categoryEn: "Preventive Care", categoryId: "Perawatan Preventif",
    nameEn: "Preventive Care & Screening", nameId: "Perawatan Preventif & Skrining",
    descriptionEn: "Health check-up packages, early detection screenings, and preventive care programs to keep you healthy and confident.",
    descriptionId: "Paket medical check-up, skrining deteksi dini, dan program perawatan preventif untuk menjaga Anda tetap sehat dan percaya diri.",
    startingPrice: "IDR 950.000", deposit: 200000,
    icon: "ShieldPlus", image: "/images/service-medical.png", brand: "medical", order: 5,
  },
  {
    id: "travel-medicine",
    categoryEn: "Travel Medicine", categoryId: "Medis Perjalanan",
    nameEn: "Travel Medicine & Medical Check-up", nameId: "Medis Perjalanan & Medical Check-up",
    descriptionEn: "Vaccinations, travel health advice, pre-travel check-ups, and medical clearances tailored for expats and international visitors in Bali.",
    descriptionId: "Vaksinasi, konsultasi kesehatan perjalanan, check-up sebelum bepergian, dan surat keterangan medis khusus untuk ekspat dan tamu internasional di Bali.",
    startingPrice: "IDR 600.000", deposit: 120000,
    icon: "Activity", image: "/images/service-medical.png", brand: "medical", order: 6,
  },
];

type DoctorSeed = {
  id: string;
  name: string; roleEn: string; roleId: string; category: string;
  specialtyEn: string; specialtyId: string;
  experienceEn: string; experienceId: string;
  languages: string; image: string; initials: string; order: number;
};

const SEED_DOCTORS: DoctorSeed[] = [
  {
    id: "dr-anastasia",
    name: "Dr. Anastasia Putri", roleEn: "General Practitioner", roleId: "Dokter Umum", category: "doctor",
    specialtyEn: "General Practice & Preventive Medicine", specialtyId: "Praktik Umum & Kedokteran Preventif",
    experienceEn: "12+ years", experienceId: "12+ tahun",
    languages: "EN, ID, Japanese", image: "/images/doctor-1.png", initials: "AP", order: 1,
  },
  {
    id: "dr-marcus",
    name: "Dr. Marcus Tan", roleEn: "Dermatologist", roleId: "Dokter Kulit", category: "doctor",
    specialtyEn: "Dermatology & Skin Health", specialtyId: "Dermatologi & Kesehatan Kulit",
    experienceEn: "15+ years", experienceId: "15+ tahun",
    languages: "EN, Chinese, ID", image: "/images/doctor-2.png", initials: "MT", order: 2,
  },
  {
    id: "lina-therapist",
    name: "Lina Saraswati, RN", roleEn: "Skin Care Therapist", roleId: "Terapis Perawatan Kulit", category: "wellness",
    specialtyEn: "Medical Skin Therapy & Wellness", specialtyId: "Terapi Kulit Medis & Wellness",
    experienceEn: "9+ years", experienceId: "9+ tahun",
    languages: "EN, ID, Korean", image: "/images/doctor-3.png", initials: "LS", order: 3,
  },
  {
    id: "nurse-amara",
    name: "Amara Wijaya, RN", roleEn: "Nurse / Therapist", roleId: "Perawat / Terapis", category: "wellness",
    specialtyEn: "IV Therapy & Wellness", specialtyId: "Terapi IV & Wellness",
    experienceEn: "7+ years", experienceId: "7+ tahun",
    languages: "EN, ID", image: "/images/doctor-4.png", initials: "AW", order: 4,
  },
];

type OfferSeed = {
  titleEn: string; titleId: string;
  descEn: string; descId: string;
  offerType: string;
  badge: string;
  imageUrl: string;
  ctaTextEn: string; ctaTextId: string;
  ctaLink: string;
  active: boolean;
  priority: number;
};

const SEED_OFFERS: OfferSeed[] = [
  {
    titleEn: "20% Off All Dermatology Consultations",
    titleId: "Diskon 20% Semua Konsultasi Dermatologi",
    descEn: "Save 20% on every dermatology consultation this week — board-certified skin specialists, modern diagnostics, and personalized treatment plans at Eswen Medica Bali.",
    descId: "Hemat 20% untuk setiap konsultasi dermatologi minggu ini — dokter kulit bersertifikat, diagnosis modern, dan rencana perawatan personal di Eswen Medica Bali.",
    offerType: "weekly",
    badge: "20% OFF",
    imageUrl: "/images/service-medical.png",
    ctaTextEn: "Book Now",
    ctaTextId: "Booking Sekarang",
    ctaLink: "#booking",
    active: true,
    priority: 30,
  },
  {
    titleEn: "Free Skin Check-Up Every Monday",
    titleId: "Gratis Pemeriksaan Kulit Setiap Senin",
    descEn: "Walk in any Monday for a complimentary skin check-up with our dermatology team — early detection and friendly advice for healthy, radiant skin in the Bali climate.",
    descId: "Datang setiap Senin untuk pemeriksaan kulit gratis dengan tim dermatologi kami — deteksi dini dan saran ramah untuk kulit sehat dan berseri di iklim Bali.",
    offerType: "daily",
    badge: "FREE",
    imageUrl: "/images/blog-1.png",
    ctaTextEn: "Learn More",
    ctaTextId: "Selengkapnya",
    ctaLink: "#services",
    active: true,
    priority: 20,
  },
  {
    titleEn: "Monthly Wellness Package — Save 30%",
    titleId: "Paket Wellness Bulanan — Hemat 30%",
    descEn: "Subscribe to our monthly wellness package and save 30% — IV therapy, vitamin boosters, lifestyle consultation, and priority booking bundled into one complete care plan.",
    descId: "Berlangganan paket wellness bulanan dan hemat 30% — terapi IV, booster vitamin, konsultasi gaya hidup, dan booking prioritas dalam satu paket perawatan lengkap.",
    offerType: "monthly",
    badge: "30% OFF",
    imageUrl: "/images/clinic-interior.png",
    ctaTextEn: "View Package",
    ctaTextId: "Lihat Paket",
    ctaLink: "#services",
    active: true,
    priority: 10,
  },
];

/** Seed the full site (config + services + doctors + articles + offers) if empty. Idempotent. */
export async function ensureSiteSeeded() {
  await ensureArticlesSeeded();

  // SiteConfig singleton
  const cfg = await db.siteConfig.findUnique({ where: { id: "singleton" } });
  if (!cfg) {
    await db.siteConfig.create({
      data: { id: "singleton", config: JSON.stringify(DEFAULT_CONFIG) },
    });
  }

  // Services
  const serviceCount = await db.service.count();
  if (serviceCount === 0) {
    await db.service.createMany({
      data: SEED_SERVICES.map(({ ...s }) => s),
    });
  }

  // Doctors
  const doctorCount = await db.doctor.count();
  if (doctorCount === 0) {
    await db.doctor.createMany({
      data: SEED_DOCTORS.map(({ ...d }) => d),
    });
  }

  // Special offers (promo section + popup)
  const offerCount = await db.specialOffer.count();
  if (offerCount === 0) {
    await db.specialOffer.createMany({ data: SEED_OFFERS });
  }
}
