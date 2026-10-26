import { db } from "@/lib/db";
import { translations } from "@/lib/eswen/i18n";
import { contactInfo } from "@/lib/eswen/data";
import { ensureArticlesSeeded } from "@/lib/eswen/seed";
import { SEED_SERVICES } from "@/lib/eswen/seed-full-data";

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
  // URL of the image shown in the About section. Empty = use the default
  // /images/clinic-interior.png. Editable from the admin Site Settings tab.
  about_image: "",
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

type DoctorSeed = {
  id: string;
  name: string; roleEn: string; roleId: string; category: string;
  specialtyEn: string; specialtyId: string;
  experienceEn: string; experienceId: string;
  bioEn: string; bioId: string;
  educationEn: string; educationId: string;
  certificationsEn: string; certificationsId: string;
  languages: string; image: string; initials: string; order: number;
};

const SEED_DOCTORS: DoctorSeed[] = [
  {
    id: "dr-anastasia",
    name: "Dr. Anastasia Putri", roleEn: "General Practitioner", roleId: "Dokter Umum", category: "doctor",
    specialtyEn: "General Practice & Preventive Medicine", specialtyId: "Praktik Umum & Kedokteran Preventif",
    experienceEn: "12+ years", experienceId: "12+ tahun",
    bioEn:
      "Dr. Anastasia Putri is a seasoned general practitioner with 12+ years of practice in family and preventive medicine. She earned her medical degree from the Faculty of Medicine, Universitas Indonesia, and completed her residency in Internal Medicine at RSCM Jakarta. Dr. Anastasia is committed to delivering holistic, personalized healthcare to every patient — both local and international.",
    bioId:
      "Dr. Anastasia Putri adalah dokter umum berpengalaman dengan 12+ tahun praktik di bidang kedokteran keluarga dan preventif. Ia menyelesaikan pendidikan dokter di Fakultas Kedokteran Universitas Indonesia dan menyelesaikan residency di RSCM Jakarta. Dr. Anastasia berkomitmen memberikan layanan kesehatan holistik dengan pendekatan personal untuk setiap pasien, baik lokal maupun internasional.",
    educationEn:
      "- MD, Faculty of Medicine, Universitas Indonesia (2010)\n- Residency in Internal Medicine, RSCM Jakarta (2014)\n- Fellowship in Preventive Medicine, Singapore (2017)",
    educationId:
      "- MD, Fakultas Kedokteran Universitas Indonesia (2010)\n- Residency di Internal Medicine, RSCM Jakarta (2014)\n- Fellowship in Preventive Medicine, Singapore (2017)",
    certificationsEn:
      "- Board Certified in Internal Medicine (Indonesian Medical Council)\n- ACLS (Advanced Cardiovascular Life Support) Certified\n- BLS (Basic Life Support) Instructor",
    certificationsId:
      "- Board Certified in Internal Medicine (Indonesian Medical Council)\n- ACLS (Advanced Cardiovascular Life Support) Certified\n- BLS (Basic Life Support) Instructor",
    languages: "EN, ID, Japanese", image: "/images/doctor-1.png", initials: "AP", order: 1,
  },
  {
    id: "dr-marcus",
    name: "Dr. Marcus Tan", roleEn: "Dermatologist", roleId: "Dokter Kulit", category: "doctor",
    specialtyEn: "Dermatology & Skin Health", specialtyId: "Dermatologi & Kesehatan Kulit",
    experienceEn: "15+ years", experienceId: "15+ tahun",
    bioEn:
      "Dr. Marcus Tan is a board-certified dermatologist with 15+ years of experience diagnosing and treating skin conditions — acne, eczema, pigmentation, infections — and performing cosmetic dermatology procedures. He combines evidence-based medicine with a gentle, patient-first approach to help patients achieve healthy, confident skin in Bali's tropical climate.",
    bioId:
      "Dr. Marcus Tan adalah dokter kulit bersertifikat dengan 15+ tahun pengalaman dalam diagnosis dan perawatan masalah kulit — jerawat, eksem, pigmentasi, infeksi — serta prosedur dermatologi kosmetik. Ia menggabungkan pendekatan berbasis bukti dengan pelayanan yang lembut dan pasien-first untuk membantu pasien mencapai kulit sehat dan percaya diri di iklim tropis Bali.",
    educationEn:
      "- MD, Faculty of Medicine, Universitas Gadjah Mada (2005)\n- Residency in Dermatology, Dr. Cipto Mangunkusumo Hospital (2010)\n- Aesthetic Dermatology Fellowship, Bangkok (2013)",
    educationId:
      "- MD, Fakultas Kedokteran Universitas Gadjah Mada (2005)\n- Residency di Dermatologi, RS Dr. Cipto Mangunkusumo (2010)\n- Aesthetic Dermatology Fellowship, Bangkok (2013)",
    certificationsEn:
      "- Board Certified in Dermatology (Indonesian Medical Council)\n- Member, Indonesian Society of Dermatology and Venereology (PDSCI)\n- Certified in Aesthetic Laser Procedures",
    certificationsId:
      "- Board Certified in Dermatology (Indonesian Medical Council)\n- Member, Indonesian Society of Dermatology and Venereology (PDSCI)\n- Certified in Aesthetic Laser Procedures",
    languages: "EN, Chinese, ID", image: "/images/doctor-2.png", initials: "MT", order: 2,
  },
  {
    id: "lina-therapist",
    name: "Lina Saraswati, RN", roleEn: "Skin Care Therapist", roleId: "Terapis Perawatan Kulit", category: "wellness",
    specialtyEn: "Medical Skin Therapy & Wellness", specialtyId: "Terapi Kulit Medis & Wellness",
    experienceEn: "9+ years", experienceId: "9+ tahun",
    bioEn:
      "Lina Saraswati is a certified medical skin therapist with 9+ years of hands-on experience in medical-grade facials, chemical peels, microneedling, and personalized skin-rejuvenation programs. She works closely with our dermatologists to design therapy plans that combine clinical results with a relaxing, spa-like experience for every guest.",
    bioId:
      "Lina Saraswati adalah terapis kulit medis bersertifikat dengan 9+ tahun pengalaman langsung dalam facial medis, chemical peel, microneedling, dan program rejuvenasi kulit personal. Ia bekerja sama dengan dokter kulit kami untuk merancang paket terapi yang menggabungkan hasil klinis dengan pengalaman spa yang menenangkan untuk setiap tamu.",
    educationEn:
      "- D3 Nursing, Poltekkes Jakarta (2013)\n- Diploma in Aesthetic Skin Therapy, Jakarta (2015)\n- Advanced Course in Medical Aesthetics, Singapore (2019)",
    educationId:
      "- D3 Keperawatan, Poltekkes Jakarta (2013)\n- Diploma Aesthetic Skin Therapy, Jakarta (2015)\n- Advanced Course in Medical Aesthetics, Singapore (2019)",
    certificationsEn:
      "- Licensed Aesthetic Therapist (Indonesian Ministry of Health)\n- Certified in Chemical Peels & Microneedling\n- Hydrafacial & Dermapen Authorized Practitioner",
    certificationsId:
      "- Licensed Aesthetic Therapist (Indonesian Ministry of Health)\n- Certified in Chemical Peels & Microneedling\n- Hydrafacial & Dermapen Authorized Practitioner",
    languages: "EN, ID, Korean", image: "/images/doctor-3.png", initials: "LS", order: 3,
  },
  {
    id: "nurse-amara",
    name: "Amara Wijaya, RN", roleEn: "Nurse / Therapist", roleId: "Perawat / Terapis", category: "wellness",
    specialtyEn: "IV Therapy & Wellness", specialtyId: "Terapi IV & Wellness",
    experienceEn: "7+ years", experienceId: "7+ tahun",
    bioEn:
      "Amara Wijaya is a registered nurse and wellness therapist specializing in IV therapy, vitamin boosters, and lifestyle wellness consultations. With 7+ years of clinical experience, she helps guests feel their best through personalized infusion protocols, immunity drips, and recovery programs designed for Bali's active lifestyle.",
    bioId:
      "Amara Wijaya adalah perawat terdaftar dan terapis wellness yang berspesialisasi dalam terapi IV, booster vitamin, dan konsultasi wellness gaya hidup. Dengan 7+ tahun pengalaman klinis, ia membantu tamu merasa lebih sehat melalui protokol infus personal, immunity drip, dan program pemulihan yang dirancang untuk gaya hidup aktif di Bali.",
    educationEn:
      "- S.Kep, Faculty of Nursing, Universitas Indonesia (2015)\n- IV Therapy Certification, Jakarta (2017)\n- Wellness Coaching Course, Bali (2020)",
    educationId:
      "- S.Kep, Fakultas Ilmu Keperawatan, Universitas Indonesia (2015)\n- IV Therapy Certification, Jakarta (2017)\n- Wellness Coaching Course, Bali (2020)",
    certificationsEn:
      "- Registered Nurse (Indonesian NPA)\n- Certified IV Therapy Practitioner\n- BLS (Basic Life Support) Certified",
    certificationsId:
      "- Registered Nurse (Indonesian NPA)\n- Certified IV Therapy Practitioner\n- BLS (Basic Life Support) Certified",
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
