import {
  Stethoscope,
  Sparkles,
  HeartPulse,
  Flower2,
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
  { labelKey: "nav_brands", href: "#brands" },
  { labelKey: "nav_services", href: "#services" },
  { labelKey: "nav_doctors", href: "#doctors" },
  { labelKey: "nav_about", href: "#about" },
  { labelKey: "nav_blog", href: "#blog" },
  { labelKey: "nav_contact", href: "#contact" },
];

/* ---------- Hero trust points ---------- */
export const heroTrustPoints: { icon: LucideIcon; labelKey: string }[] = [
  { icon: Stethoscope, labelKey: "hero_trust_1" },
  { icon: Microscope, labelKey: "hero_trust_2" },
  { icon: ShieldPlus, labelKey: "hero_trust_3" },
  { icon: Building2, labelKey: "hero_trust_4" },
];

/* ---------- Brands ---------- */
export const brands = [
  {
    name: "Eswen Medica",
    taglineKey: "brand_medical_tagline",
    descriptionKey: "brand_medical_desc",
    ctaKey: "brand_medical_cta",
    accent: "medical" as const,
    highlights: [
      bi("General Practice", "Praktik Umum"),
      bi("Preventive Care", "Perawatan Preventif"),
      bi("Wellness Programs", "Program Wellness"),
      bi("Medical Tourism", "Turis Medis"),
    ],
    image: "/images/brand-medical.png",
  },
  {
    name: "Aesthetic Eswen",
    taglineKey: "brand_aesthetic_tagline",
    descriptionKey: "brand_aesthetic_desc",
    ctaKey: "brand_aesthetic_cta",
    accent: "aesthetic" as const,
    highlights: [
      bi("Facial Treatments", "Perawatan Wajah"),
      bi("Skin Rejuvenation", "Rejuvenasi Kulit"),
      bi("Injectables", "Injectables"),
      bi("Acne Care", "Perawatan Jerawat"),
    ],
    image: "/images/brand-aesthetic.png",
  },
];

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
  brand: "medical" | "aesthetic";
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
    id: "aesthetic-treatments",
    category: bi("Aesthetic Treatments", "Perawatan Estetika"),
    name: bi("Aesthetic & Injectable Treatments", "Perawatan Estetika & Injectable"),
    description: bi(
      "Facial rejuvenation, dermal fillers, anti-wrinkle treatments, and advanced aesthetic procedures performed by certified aesthetic doctors.",
      "Rejuvenasi wajah, dermal fillers, perawatan anti-kerut, dan prosedur estetika lanjutan oleh dokter estetika bersertifikat."
    ),
    startingPrice: "IDR 1.500.000",
    deposit: 250000,
    icon: Sparkles,
    image: "/images/service-aesthetic.png",
    brand: "aesthetic",
  },
  {
    id: "skin-beauty",
    category: bi("Skin & Beauty Care", "Perawatan Kulit & Kecantikan"),
    name: bi("Skin & Beauty Treatment", "Perawatan Kulit & Kecantikan"),
    description: bi(
      "Premium facials, acne treatment, skin rejuvenation, and personalized beauty care designed for healthy, glowing skin.",
      "Facial premium, perawatan jerawat, rejuvenasi kulit, dan perawatan kecantikan personal untuk kulit sehat dan berseri."
    ),
    startingPrice: "IDR 450.000",
    deposit: 100000,
    icon: Flower2,
    image: "/images/service-skin.png",
    brand: "aesthetic",
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
      "Personalized consultations with our doctors and beauticians to design the right treatment plan for your needs and goals.",
      "Konsultasi personal dengan dokter dan beautician kami untuk merancang rencana perawatan yang tepat bagi kebutuhan dan tujuan Anda."
    ),
    startingPrice: "IDR 250.000",
    deposit: 75000,
    icon: ClipboardList,
    image: "/images/service-aesthetic.png",
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
  category: "doctor" | "aesthetic" | "beauty" | "wellness";
  specialty: Bi;
  experience: Bi;
  languages: string[];
  image: string;
  initials: string;
};

export const doctors: Doctor[] = [
  {
    id: "dr-anastasia",
    name: "Dr. Anastasia Putri",
    role: bi("Doctor", "Dokter"),
    category: "doctor",
    specialty: bi("General Practice & Preventive Medicine", "Praktik Umum & Kedokteran Preventif"),
    experience: bi("12+ years", "12+ tahun"),
    languages: ["EN", "ID", "Japanese"],
    image: "/images/doctor-1.png",
    initials: "AP",
  },
  {
    id: "dr-marcus",
    name: "Dr. Marcus Tan",
    role: bi("Aesthetic Doctor", "Dokter Estetika"),
    category: "aesthetic",
    specialty: bi("Aesthetic Medicine & Injectables", "Kedokteran Estetika & Injectable"),
    experience: bi("15+ years", "15+ tahun"),
    languages: ["EN", "Chinese", "ID"],
    image: "/images/doctor-2.png",
    initials: "MT",
  },
  {
    id: "lina-beautician",
    name: "Lina Saraswati",
    role: bi("Beautician", "Beautician"),
    category: "beauty",
    specialty: bi("Facial & Skin Therapy", "Terapi Wajah & Kulit"),
    experience: bi("9+ years", "9+ tahun"),
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
    languages: ["EN", "ID"],
    image: "/images/doctor-4.png",
    initials: "AW",
  },
];

export const doctorFilters: { key: string; label: Bi }[] = [
  { key: "all", label: bi("All", "Semua") },
  { key: "doctor", label: bi("Doctor", "Dokter") },
  { key: "aesthetic", label: bi("Aesthetic", "Estetika") },
  { key: "beauty", label: bi("Beauty", "Kecantikan") },
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

/* ---------- Payment methods ---------- */
export const paymentMethods = ["Credit Card", "Virtual Account", "E-Wallet", "QRIS", "Bank Transfer"];
export const paymentGateways = ["Midtrans", "Xendit", "Stripe"];

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
    slug: "best-aesthetic-treatment-bali",
    title: bi(
      "The Best Aesthetic Treatments in Bali: A 2026 Guide for Expats & Tourists",
      "Perawatan Estetika Terbaik di Bali: Panduan 2026 untuk Ekspat & Turis"
    ),
    excerpt: bi(
      "From advanced facials to aesthetic injectables, discover Bali's most trusted aesthetic treatments — and why Eswen Medica is the clinic international guests choose.",
      "Dari facial lanjutan hingga injectable estetika, temukan perawatan estetika tepercaya di Bali — dan mengapa Eswen Medica adalah pilihan klinik tamu internasional."
    ),
    category: bi("Aesthetic", "Estetika"),
    readTime: bi("6 min read", "6 menit baca"),
    date: "12 Feb 2026",
    image: "/images/blog-1.png",
    language: "EN",
  },
  {
    slug: "acne-treatment-bali",
    title: bi(
      "Acne Treatment in Bali: A Dermatologist-Approved Skincare Path",
      "Perawatan Jerawat di Bali: Panduan Skincare Disetujui Dokter Kulit"
    ),
    excerpt: bi(
      "Struggling with acne in Bali's tropical climate? Learn how our aesthetic doctors design personalized acne treatment plans that work.",
      "Kesulitan jerawat di iklim tropis Bali? Pelajari bagaimana dokter estetika kami merancang rencana perawatan jerawat personal yang efektif."
    ),
    category: bi("Skin Care", "Perawatan Kulit"),
    readTime: bi("5 min read", "5 menit baca"),
    date: "5 Feb 2026",
    image: "/images/service-skin.png",
    language: "EN",
  },
  {
    slug: "medical-tourism-bali",
    title: bi(
      "Medical Tourism in Bali: What International Guests Need to Know",
      "Turis Medis di Bali: Yang Perlu Diketahui Tamu Internasional"
    ),
    excerpt: bi(
      "Bali is fast becoming a medical tourism destination. Here's how Eswen Medica makes healthcare and aesthetic care seamless for visitors.",
      "Bali cepat menjadi destinasi turis medis. Inilah cara Eswen Medica membuat layanan kesehatan dan estetika mudah bagi pengunjung."
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
