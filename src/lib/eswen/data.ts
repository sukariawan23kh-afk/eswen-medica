import {
  Stethoscope,
  Sparkles,
  HeartPulse,
  ClipboardList,
  ShieldPlus,
  CalendarCheck,
  UserRound,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Building2,
  StethoscopeIcon,
  Microscope,
  Hand,
  Smile,
  Brain,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { Lang } from "./language-store";

/** A bilingual string value. */
type Bi = Record<Lang, string>;
const bi = (en: string, id: string): Bi => ({ en, id });

/** Nav links — labels are translation keys resolved by the navbar via `t()`. */
export type NavLink = { labelKey: string; href: string };
export const navLinks: NavLink[] = [
  { labelKey: "nav_home", href: "#home" },
  { labelKey: "nav_services", href: "#services" },
  { labelKey: "nav_promo", href: "#promo" },
  { labelKey: "nav_doctors", href: "#doctors" },
  { labelKey: "nav_about", href: "#about" },
  { labelKey: "nav_blog", href: "#blog" },
  { labelKey: "nav_partners", href: "#partners" },
  { labelKey: "nav_apotek", href: "#apotek" },
  { labelKey: "nav_contact", href: "#contact" },
];

/* ---------- Hero trust points ---------- */
export const heroTrustPoints: { icon: LucideIcon; labelKey: string }[] = [
  { icon: Stethoscope, labelKey: "hero_trust_1" },
  { icon: Microscope, labelKey: "hero_trust_2" },
  { icon: ShieldPlus, labelKey: "hero_trust_3" },
  { icon: Building2, labelKey: "hero_trust_4" },
];

/* (Brands section removed — the site now focuses on Eswen Medica only.) */

/* ---------- Services ---------- */
export type Service = {
  id: string;
  category: Bi;
  name: Bi;
  description: Bi;
  startingPrice: string;
  deposit: number; // deposit amount in IDR (required to confirm booking)
  icon: LucideIcon;
  image: string;
  brand: "medical"; // Eswen Medica is a single medical brand now
};

export const services: Service[] = [
  {
    id: "general-medical",
    category: bi("General Medical Services", "Layanan Medis Umum"),
    name: bi("General Medical Consultation", "Konsultasi Medis Umum"),
    description: bi(
      "Comprehensive general practice consultations, health screenings, and primary medical care delivered by experienced international-standard physicians.",
      "Konsultasi praktik umum terpadu, skrining kesehatan, dan layanan medis primer oleh dokter berpengalaman berstandar internasional."
    ),
    startingPrice: "IDR 350.000",
    deposit: 100000,
    icon: Stethoscope,
    image: "/images/service-medical.png",
    brand: "medical",
  },
  {
    id: "dermatology",
    category: bi("Dermatology", "Dermatologi"),
    name: bi("Dermatology & Skin Health", "Dermatologi & Kesehatan Kulit"),
    description: bi(
      "Medical-grade diagnosis and treatment of skin conditions — acne, eczema, pigmentation, and skin infections — by board-certified dermatologists.",
      "Diagnosis dan perawatan medis untuk masalah kulit — jerawat, eksem, pigmentasi, dan infeksi kulit — oleh dokter kulit bersertifikat."
    ),
    startingPrice: "IDR 500.000",
    deposit: 120000,
    icon: Microscope,
    image: "/images/service-medical.png",
    brand: "medical",
  },
  {
    id: "wellness-program",
    category: bi("Wellness Program", "Program Wellness"),
    name: bi("Wellness & Vitality Program", "Program Wellness & Vitalitas"),
    description: bi(
      "Holistic wellness programs, IV therapy, vitamin boosters, and lifestyle consultation to enhance your overall wellbeing.",
      "Program wellness holistik, terapi IV, booster vitamin, dan konsultasi gaya hidup untuk meningkatkan kesejahteraan menyeluruh."
    ),
    startingPrice: "IDR 750.000",
    deposit: 150000,
    icon: HeartPulse,
    image: "/images/service-medical.png",
    brand: "medical",
  },
  {
    id: "consultation",
    category: bi("Consultation", "Konsultasi"),
    name: bi("Specialist Consultation", "Konsultasi Spesialis"),
    description: bi(
      "Personalized consultations with our specialists to design the right medical treatment plan for your needs and health goals.",
      "Konsultasi personal dengan spesialis kami untuk merancang rencana perawatan medis yang tepat bagi kebutuhan dan tujuan kesehatan Anda."
    ),
    startingPrice: "IDR 250.000",
    deposit: 75000,
    icon: ClipboardList,
    image: "/images/service-medical.png",
    brand: "medical",
  },
  {
    id: "preventive-care",
    category: bi("Preventive Care", "Perawatan Preventif"),
    name: bi("Preventive Care & Screening", "Perawatan Preventif & Skrining"),
    description: bi(
      "Health check-up packages, early detection screenings, and preventive care programs to keep you healthy and confident.",
      "Paket medical check-up, skrining deteksi dini, dan program perawatan preventif untuk menjaga Anda tetap sehat dan percaya diri."
    ),
    startingPrice: "IDR 950.000",
    deposit: 200000,
    icon: ShieldPlus,
    image: "/images/service-medical.png",
    brand: "medical",
  },
  {
    id: "travel-medicine",
    category: bi("Travel Medicine", "Medis Perjalanan"),
    name: bi("Travel Medicine & Medical Check-up", "Medis Perjalanan & Medical Check-up"),
    description: bi(
      "Vaccinations, travel health advice, pre-travel check-ups, and medical clearances tailored for expats and international visitors in Bali.",
      "Vaksinasi, konsultasi kesehatan perjalanan, check-up sebelum bepergian, dan surat keterangan medis khusus untuk ekspat dan tamu internasional di Bali."
    ),
    startingPrice: "IDR 600.000",
    deposit: 120000,
    icon: Activity,
    image: "/images/service-medical.png",
    brand: "medical",
  },
];

/* ---------- Smart booking steps ---------- */
export const bookingSteps: {
  step: number;
  title: Bi;
  description: Bi;
  icon: LucideIcon;
}[] = [
  {
    step: 1,
    title: bi("Choose Service", "Pilih Layanan"),
    description: bi(
      "Browse medical or aesthetic services tailored to your needs.",
      "Jelajahi layanan medis atau estetika sesuai kebutuhan Anda."
    ),
    icon: ClipboardList,
  },
  {
    step: 2,
    title: bi("Select Doctor / Beautician", "Pilih Dokter / Beautician"),
    description: bi(
      "Pick the trusted professional that suits your concern.",
      "Pilih profesional tepercaya yang sesuai dengan keluhan Anda."
    ),
    icon: UserRound,
  },
  {
    step: 3,
    title: bi("Choose Date & Time", "Pilih Tanggal & Waktu"),
    description: bi(
      "Real-time availability — no double bookings, ever.",
      "Ketersediaan real-time — tanpa ganda booking, selalu."
    ),
    icon: CalendarDays,
  },
  {
    step: 4,
    title: bi("Enter Patient Information", "Masukkan Data Pasien"),
    description: bi(
      "Secure and confidential patient data collection.",
      "Pengumpulan data pasien yang aman dan rahasia."
    ),
    icon: ClipboardList,
  },
  {
    step: 5,
    title: bi("Pay Deposit", "Bayar Deposit"),
    description: bi(
      "Confirm your slot with a secure deposit payment.",
      "Konfirmasi slot Anda dengan pembayaran deposit yang aman."
    ),
    icon: CreditCard,
  },
  {
    step: 6,
    title: bi("Receive Confirmation", "Terima Konfirmasi"),
    description: bi(
      "Get instant booking confirmation via email & WhatsApp.",
      "Dapatkan konfirmasi booking instan via email & WhatsApp."
    ),
    icon: CheckCircle2,
  },
];

/* ---------- Patient journey ---------- */
export const patientJourney: { title: Bi; icon: LucideIcon }[] = [
  { title: bi("Discover", "Temukan"), icon: Sparkles },
  { title: bi("AI Triage", "Triase AI"), icon: Brain },
  { title: bi("Choose Service", "Pilih Layanan"), icon: ClipboardList },
  { title: bi("Select Doctor", "Pilih Dokter"), icon: UserRound },
  { title: bi("Select Date & Time", "Pilih Tanggal & Waktu"), icon: CalendarDays },
  { title: bi("Pay Deposit", "Bayar Deposit"), icon: CreditCard },
  { title: bi("Booking Confirmed", "Booking Dikonfirmasi"), icon: CheckCircle2 },
  { title: bi("Visit Clinic", "Kunjungi Klinik"), icon: Building2 },
  { title: bi("Follow-up", "Tindak Lanjut"), icon: Activity },
];

/* ---------- Doctors ---------- */
export type Doctor = {
  id: string;
  name: string;
  role: Bi;
  category: "doctor" | "wellness";
  specialty: Bi;
  experience: Bi;
  bio: Bi;
  education: Bi;
  certifications: Bi;
  languages: string[];
  image: string;
  initials: string;
};

export const doctors: Doctor[] = [
  {
    id: "dr-anastasia",
    name: "Dr. Anastasia Putri",
    role: bi("General Practitioner", "Dokter Umum"),
    category: "doctor",
    specialty: bi("General Practice & Preventive Medicine", "Praktik Umum & Kedokteran Preventif"),
    experience: bi("12+ years", "12+ tahun"),
    bio: bi(
      "Dr. Anastasia Putri is a seasoned general practitioner with 12+ years of practice in family and preventive medicine. She earned her medical degree from the Faculty of Medicine, Universitas Indonesia, and completed her residency in Internal Medicine at RSCM Jakarta. Dr. Anastasia is committed to delivering holistic, personalized healthcare to every patient — both local and international.",
      "Dr. Anastasia Putri adalah dokter umum berpengalaman dengan 12+ tahun praktik di bidang kedokteran keluarga dan preventif. Ia menyelesaikan pendidikan dokter di Fakultas Kedokteran Universitas Indonesia dan menyelesaikan residency di RSCM Jakarta. Dr. Anastasia berkomitmen memberikan layanan kesehatan holistik dengan pendekatan personal untuk setiap pasien, baik lokal maupun internasional."
    ),
    education: bi(
      "- MD, Faculty of Medicine, Universitas Indonesia (2010)\n- Residency in Internal Medicine, RSCM Jakarta (2014)\n- Fellowship in Preventive Medicine, Singapore (2017)",
      "- MD, Fakultas Kedokteran Universitas Indonesia (2010)\n- Residency di Internal Medicine, RSCM Jakarta (2014)\n- Fellowship in Preventive Medicine, Singapore (2017)"
    ),
    certifications: bi(
      "- Board Certified in Internal Medicine (Indonesian Medical Council)\n- ACLS (Advanced Cardiovascular Life Support) Certified\n- BLS (Basic Life Support) Instructor",
      "- Board Certified in Internal Medicine (Indonesian Medical Council)\n- ACLS (Advanced Cardiovascular Life Support) Certified\n- BLS (Basic Life Support) Instructor"
    ),
    languages: ["EN", "ID", "Japanese"],
    image: "/images/doctor-1.png",
    initials: "AP",
  },
  {
    id: "dr-marcus",
    name: "Dr. Marcus Tan",
    role: bi("Dermatologist", "Dokter Kulit"),
    category: "doctor",
    specialty: bi("Dermatology & Skin Health", "Dermatologi & Kesehatan Kulit"),
    experience: bi("15+ years", "15+ tahun"),
    bio: bi(
      "Dr. Marcus Tan is a board-certified dermatologist with 15+ years of experience diagnosing and treating skin conditions — acne, eczema, pigmentation, infections — and performing cosmetic dermatology procedures. He combines evidence-based medicine with a gentle, patient-first approach to help patients achieve healthy, confident skin in Bali's tropical climate.",
      "Dr. Marcus Tan adalah dokter kulit bersertifikat dengan 15+ tahun pengalaman dalam diagnosis dan perawatan masalah kulit — jerawat, eksem, pigmentasi, infeksi — serta prosedur dermatologi kosmetik. Ia menggabungkan pendekatan berbasis bukti dengan pelayanan yang lembut dan pasien-first untuk membantu pasien mencapai kulit sehat dan percaya diri di iklim tropis Bali."
    ),
    education: bi(
      "- MD, Faculty of Medicine, Universitas Gadjah Mada (2005)\n- Residency in Dermatology, Dr. Cipto Mangunkusumo Hospital (2010)\n- Aesthetic Dermatology Fellowship, Bangkok (2013)",
      "- MD, Fakultas Kedokteran Universitas Gadjah Mada (2005)\n- Residency di Dermatologi, RS Dr. Cipto Mangunkusumo (2010)\n- Aesthetic Dermatology Fellowship, Bangkok (2013)"
    ),
    certifications: bi(
      "- Board Certified in Dermatology (Indonesian Medical Council)\n- Member, Indonesian Society of Dermatology and Venereology (PDSCI)\n- Certified in Aesthetic Laser Procedures",
      "- Board Certified in Dermatology (Indonesian Medical Council)\n- Member, Indonesian Society of Dermatology and Venereology (PDSCI)\n- Certified in Aesthetic Laser Procedures"
    ),
    languages: ["EN", "Chinese", "ID"],
    image: "/images/doctor-2.png",
    initials: "MT",
  },
  {
    id: "lina-therapist",
    name: "Lina Saraswati, RN",
    role: bi("Skin Care Therapist", "Terapis Perawatan Kulit"),
    category: "wellness",
    specialty: bi("Medical Skin Therapy & Wellness", "Terapi Kulit Medis & Wellness"),
    experience: bi("9+ years", "9+ tahun"),
    bio: bi(
      "Lina Saraswati is a certified medical skin therapist with 9+ years of hands-on experience in medical-grade facials, chemical peels, microneedling, and personalized skin-rejuvenation programs. She works closely with our dermatologists to design therapy plans that combine clinical results with a relaxing, spa-like experience for every guest.",
      "Lina Saraswati adalah terapis kulit medis bersertifikat dengan 9+ tahun pengalaman langsung dalam facial medis, chemical peel, microneedling, dan program rejuvenasi kulit personal. Ia bekerja sama dengan dokter kulit kami untuk merancang paket terapi yang menggabungkan hasil klinis dengan pengalaman spa yang menenangkan untuk setiap tamu."
    ),
    education: bi(
      "- D3 Nursing, Poltekkes Jakarta (2013)\n- Diploma in Aesthetic Skin Therapy, Jakarta (2015)\n- Advanced Course in Medical Aesthetics, Singapore (2019)",
      "- D3 Keperawatan, Poltekkes Jakarta (2013)\n- Diploma Aesthetic Skin Therapy, Jakarta (2015)\n- Advanced Course in Medical Aesthetics, Singapore (2019)"
    ),
    certifications: bi(
      "- Licensed Aesthetic Therapist (Indonesian Ministry of Health)\n- Certified in Chemical Peels & Microneedling\n- Hydrafacial & Dermapen Authorized Practitioner",
      "- Licensed Aesthetic Therapist (Indonesian Ministry of Health)\n- Certified in Chemical Peels & Microneedling\n- Hydrafacial & Dermapen Authorized Practitioner"
    ),
    languages: ["EN", "ID", "Korean"],
    image: "/images/doctor-3.png",
    initials: "LS",
  },
  {
    id: "nurse-amara",
    name: "Amara Wijaya, RN",
    role: bi("Nurse / Therapist", "Perawat / Terapis"),
    category: "wellness",
    specialty: bi("IV Therapy & Wellness", "Terapi IV & Wellness"),
    experience: bi("7+ years", "7+ tahun"),
    bio: bi(
      "Amara Wijaya is a registered nurse and wellness therapist specializing in IV therapy, vitamin boosters, and lifestyle wellness consultations. With 7+ years of clinical experience, she helps guests feel their best through personalized infusion protocols, immunity drips, and recovery programs designed for Bali's active lifestyle.",
      "Amara Wijaya adalah perawat terdaftar dan terapis wellness yang berspesialisasi dalam terapi IV, booster vitamin, dan konsultasi wellness gaya hidup. Dengan 7+ tahun pengalaman klinis, ia membantu tamu merasa lebih sehat melalui protokol infus personal, immunity drip, dan program pemulihan yang dirancang untuk gaya hidup aktif di Bali."
    ),
    education: bi(
      "- S.Kep, Faculty of Nursing, Universitas Indonesia (2015)\n- IV Therapy Certification, Jakarta (2017)\n- Wellness Coaching Course, Bali (2020)",
      "- S.Kep, Fakultas Ilmu Keperawatan, Universitas Indonesia (2015)\n- IV Therapy Certification, Jakarta (2017)\n- Wellness Coaching Course, Bali (2020)"
    ),
    certifications: bi(
      "- Registered Nurse (Indonesian NPA)\n- Certified IV Therapy Practitioner\n- BLS (Basic Life Support) Certified",
      "- Registered Nurse (Indonesian NPA)\n- Certified IV Therapy Practitioner\n- BLS (Basic Life Support) Certified"
    ),
    languages: ["EN", "ID"],
    image: "/images/doctor-4.png",
    initials: "AW",
  },
];

export const doctorFilters: { key: string; label: Bi }[] = [
  { key: "all", label: bi("All", "Semua") },
  { key: "doctor", label: bi("Doctor", "Dokter") },
  { key: "wellness", label: bi("Wellness", "Wellness") },
];

/* ---------- Why choose us ---------- */
export const whyChooseUs: {
  title: Bi;
  description: Bi;
  icon: LucideIcon;
}[] = [
  {
    title: bi("Smart Booking", "Booking Pintar"),
    description: bi(
      "Real-time appointment scheduling with availability sync — no double bookings, ever.",
      "Penjadwalan janji temu real-time dengan sinkronisasi ketersediaan — tanpa ganda booking, selalu."
    ),
    icon: CalendarCheck,
  },
  {
    title: bi("Secure Deposit", "Deposit Aman"),
    description: bi(
      "Your booking is locked and protected through a verified deposit payment system.",
      "Booking Anda dikunci dan dilindungi melalui sistem pembayaran deposit terverifikasi."
    ),
    icon: ShieldPlus,
  },
  {
    title: bi("AI Assistance", "Bantuan AI"),
    description: bi(
      "Initial service guidance through our friendly AI triage assistant — 24/7.",
      "Panduan layanan awal melalui asisten triase AI yang ramah — 24/7."
    ),
    icon: Brain,
  },
  {
    title: bi("Integrated Data", "Data Terintegrasi"),
    description: bi(
      "Connected customer, doctor, beautician and administrative data for seamless care.",
      "Data pelanggan, dokter, beautician, dan administrasi yang terhubung untuk layanan yang mulus."
    ),
    icon: Activity,
  },
];

/* ---------- About highlights ---------- */
export const aboutHighlights: {
  title: Bi;
  description: Bi;
  icon: LucideIcon;
}[] = [
  {
    title: bi("Professional Team", "Tim Profesional"),
    description: bi(
      "Certified, experienced, international-standard practitioners.",
      "Praktisi bersertifikat, berpengalaman, berstandar internasional."
    ),
    icon: StethoscopeIcon,
  },
  {
    title: bi("Modern Facilities", "Fasilitas Modern"),
    description: bi(
      "State-of-the-art medical and aesthetic technology.",
      "Teknologi medis dan estetika mutakhir."
    ),
    icon: Microscope,
  },
  {
    title: bi("Personalized Care", "Perawatan Personal"),
    description: bi(
      "Treatment plans designed around your unique needs.",
      "Rencana perawatan dirancang sesuai kebutuhan unik Anda."
    ),
    icon: Hand,
  },
  {
    title: bi("International Guest Friendly", "Ramah Tamu Internasional"),
    description: bi("Multilingual team, expat & tourist ready.", "Tim multibahasa, siap untuk ekspat & turis."),
    icon: Smile,
  },
];

/* ---------- Payment methods ----------
 * Online payment methods (Credit Card / QRIS / E-Wallet / Virtual Account)
 * were removed — the clinic now ONLY accepts Bank Transfer to its company
 * bank account. The deposit is paid offline; an admin verifies receipt and
 * flips the booking WAITING_PAYMENT → CONFIRMED.
 */
export const paymentMethods = ["Bank Transfer"] as const;
export const paymentGateways: readonly string[] = [];

/* ---------- Blog posts ---------- */
export type BlogPost = {
  slug: string;
  title: Bi;
  excerpt: Bi;
  category: Bi;
  readTime: Bi;
  date: string;
  image: string;
  language: "EN" | "ID";
};

export const blogPosts: BlogPost[] = [
  {
    slug: "medical-clinic-bali-expats",
    title: bi(
      "Medical Clinic Bali: A 2026 Guide for Expats & Tourists",
      "Klinik Medis Bali: Panduan 2026 untuk Ekspat & Turis"
    ),
    excerpt: bi(
      "Looking for a trusted medical clinic in Bali? Here's what expats and international visitors should know — from general practice to travel medicine at Eswen Medica.",
      "Mencari klinik medis tepercaya di Bali? Inilah yang perlu diketahui ekspat dan tamu internasional — dari praktik umum hingga medis perjalanan di Eswen Medica."
    ),
    category: bi("Medical", "Medis"),
    readTime: bi("6 min read", "6 menit baca"),
    date: "12 Feb 2026",
    image: "/images/blog-1.png",
    language: "EN",
  },
  {
    slug: "skin-health-bali-dermatology",
    title: bi(
      "Skin Health in Bali: A Dermatologist's Guide to the Tropical Climate",
      "Kesehatan Kulit di Bali: Panduan Dermatologi untuk Iklim Tropis"
    ),
    excerpt: bi(
      "Acne, sun damage, and tropical-climate skin issues? Learn how our dermatologists at Eswen Medica diagnose and treat common skin conditions in Bali.",
      "Jerawat, kerusakan akibat matahari, dan masalah kulit iklim tropis? Pelajari bagaimana dokter kulit kami di Eswen Medica mendiagnosis dan merawat kondisi kulit umum di Bali."
    ),
    category: bi("Dermatology", "Dermatologi"),
    readTime: bi("5 min read", "5 menit baca"),
    date: "5 Feb 2026",
    image: "/images/service-medical.png",
    language: "EN",
  },
  {
    slug: "medical-tourism-bali",
    title: bi(
      "Medical Tourism in Bali: What International Guests Need to Know",
      "Turis Medis di Bali: Yang Perlu Diketahui Tamu Internasional"
    ),
    excerpt: bi(
      "Bali is fast becoming a medical tourism destination. Here's how Eswen Medica makes healthcare and preventive care seamless for international visitors.",
      "Bali cepat menjadi destinasi turis medis. Inilah cara Eswen Medica membuat layanan kesehatan dan perawatan preventif mudah bagi tamu internasional."
    ),
    category: bi("Medical Tourism", "Turis Medis"),
    readTime: bi("7 min read", "7 menit baca"),
    date: "28 Jan 2026",
    image: "/images/clinic-interior.png",
    language: "EN",
  },
];

/* ---------- Contact info ---------- */
export const contactInfo = {
  address: "Jl. Sunset Road No. 88, Kuta, Bali 80361, Indonesia",
  whatsapp: "+62 811-3900-8800",
  phone: "+62 361-XXX-XXXX",
  email: "hello@eswenmedica.id",
  hours: { en: "Mon – Sun · 08:00 – 20:00 WITA", id: "Sen – Min · 08:00 – 20:00 WITA" },
  mapEmbed: "https://www.google.com/maps?q=Kuta,+Bali,+Indonesia&output=embed",
  directions: "https://www.google.com/maps/dir/?api=1&destination=Kuta+Bali+Indonesia",
};

/* ---------- Booking statuses (admin concept) ---------- */
export const bookingStatuses = [
  { label: bi("NEW", "BARU"), color: "bg-eswen-lavender text-eswen-deep" },
  { label: bi("WAITING PAYMENT", "MENUNGGU BAYAR"), color: "bg-amber-100 text-amber-700" },
  { label: bi("CONFIRMED", "DIKONFIRMASI"), color: "bg-green-100 text-green-700" },
  { label: bi("CHECKED IN", "SUDAH CEK-IN"), color: "bg-sky-100 text-sky-700" },
  { label: bi("IN TREATMENT", "SEDANG DIRAWAT"), color: "bg-violet-100 text-violet-700" },
  { label: bi("COMPLETED", "SELESAI"), color: "bg-emerald-100 text-emerald-700" },
  { label: bi("CANCELLED", "DIBATALKAN"), color: "bg-rose-100 text-rose-700" },
  { label: bi("NO SHOW", "TIDAK HADIR"), color: "bg-stone-100 text-stone-600" },
];
