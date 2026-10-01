import { useLanguage, type Lang } from "./language-store";

// All UI strings, organized by section. Data-driven content (services, doctors,
// booking steps, patient journey, blog, about highlights, why-choose-us) is
// bilingual in data.ts and accessed via `[lang]`.
export const translations = {
  en: {
    // Navbar
    nav_home: "Home",
    nav_brands: "Our Brands",
    nav_services: "Services",
    nav_doctors: "Doctors",
    nav_about: "About Us",
    nav_blog: "Blog",
    nav_contact: "Contact",
    nav_book: "Book Appointment",
    nav_tagline: "Health • Beauty • Confidence",

    // Hero
    hero_badge: "Premium Clinic in Bali · International Standard",
    hero_h1_l1: "Your Health,",
    hero_h1_l2: "Our Priority.",
    hero_h1_l3: "Your Beauty,",
    hero_h1_l4: "Our Expertise.",
    hero_sub:
      "Comprehensive medical and aesthetic care in Bali, delivered by trusted professionals with modern technology and international standards.",
    hero_cta_book: "Book Appointment",
    hero_cta_explore: "Explore Our Services",
    hero_trust_1: "Trusted Doctors & Specialists",
    hero_trust_2: "Modern Technology",
    hero_trust_3: "International Standard",
    hero_trust_4: "Located in Bali",
    hero_card_deposit: "Secure Deposit",
    hero_card_deposit_sub: "Booking guaranteed",
    hero_card_trusted: "Trusted by 5,000+ guests",
    hero_card_trusted_sub: "Expats & tourists in Bali",
    hero_pill: "Two Brands · One Care",

    // Brands
    brands_eyebrow: "Our Brands",
    brands_title_1: "Two Brands.",
    brands_title_2: "One Care.",
    brands_desc:
      "Eswen Medica and Aesthetic Eswen operate as one connected ecosystem — sharing booking, payments, and your patient records — while keeping their distinct focus on health and beauty.",
    brands_medical_tag: "Medical",
    brands_aesthetic_tag: "Aesthetic",
    brand_medical_tagline: "Health • Wellness • Clinic",
    brand_medical_desc:
      "Comprehensive healthcare services designed to support your health, wellness and medical needs.",
    brand_medical_cta: "Visit Eswen Medica",
    brand_aesthetic_tagline: "Beauty • Skin • Aesthetic",
    brand_aesthetic_desc:
      "Advanced aesthetic and beauty treatments designed to enhance your natural confidence and wellbeing.",
    brand_aesthetic_cta: "Explore Aesthetic Eswen",

    // Services
    services_eyebrow: "Our Services",
    services_title_1: "Care Designed Around",
    services_title_2: "Your Needs",
    services_desc:
      "From general medical consultations to advanced aesthetic treatments — explore a complete catalog of healthcare and beauty services.",
    services_starting: "Starting from",
    services_view: "View Details",
    services_book: "Book an Appointment",

    // Smart booking
    booking_eyebrow: "Smart Booking",
    booking_title_1: "Smart Booking.",
    booking_title_2: "Simple Experience.",
    booking_desc:
      "A guided, real-time appointment flow designed for international guests — secure your slot in minutes with no double bookings.",
    booking_deposit_badge: "Secure Deposit Payment",
    booking_deposit_title:
      "Your appointment is secured after deposit payment.",
    booking_deposit_desc:
      "A required deposit reduces no-shows, prevents fake bookings, locks your schedule, and protects clinic resources — so every slot is honored.",
    booking_reduce_noshow: "Reduce no-show",
    booking_avoid_fake: "Avoid fake bookings",
    booking_lock: "Lock your schedule",
    booking_protect: "Protect clinic revenue",
    booking_methods: "Accepted Payment Methods",
    booking_gateways: "Payment Gateway Integrations",
    booking_cta: "Book & Pay Deposit",
    booking_status_title: "Booking Status Flow",
    booking_status_desc: "Transparent status tracking from booking to completion.",
    booking_pending: "PENDING PAYMENT",
    booking_pending_desc: "Booking created, awaiting deposit.",
    booking_confirmed: "CONFIRMED",
    booking_confirmed_desc: "Deposit verified — appointment locked.",
    booking_failed: "PAYMENT FAILED",
    booking_failed_desc: "Deposit unsuccessful — slot released.",
    booking_all_statuses: "All Booking Statuses",
    booking_secure_note:
      "Booking is never set to CONFIRMED until payment is verified via gateway callback.",

    // Patient journey
    journey_eyebrow: "Patient Journey",
    journey_title_1: "From Discovery to",
    journey_title_2: "Follow-up",
    journey_desc:
      "A smooth, guided experience — from your first symptom check with our AI assistant to post-treatment follow-up.",

    // Doctors
    doctors_eyebrow: "Our Professionals",
    doctors_title_1: "Meet Our",
    doctors_title_2: "Professionals",
    doctors_desc:
      "A trusted, multilingual team of doctors, aesthetic doctors, beauticians, and nurses — certified and experienced in international-standard care.",
    doctors_view_profile: "View Profile",
    doctors_join_note: "Want to join our team of trusted professionals?",
    doctors_contact: "Contact us",

    // About
    about_eyebrow: "About Eswen",
    about_title_1: "Healthcare & Beauty,",
    about_title_2: "Designed Around You.",
    about_desc:
      "Eswen Medica is committed to delivering a professional, comfortable, modern, and accessible care experience — purpose-built for Bali's international community.",
    about_patients: "Happy patients from 40+ countries",
    about_rating: "★ 4.9 / 5.0 rating",

    // Why choose us
    why_eyebrow: "Why Choose Us",
    why_title_1: "Built for a",
    why_title_2: "Premium Experience",
    why_desc:
      "Everything you need — from smart booking to secure payments and AI-guided triage — connected in one seamless ecosystem.",

    // Blog
    blog_eyebrow: "Blog & Insights",
    blog_title_1: "Guides for",
    blog_title_2: "Beauty, Skin & Wellness in Bali",
    blog_desc:
      "Helpful, trusted content for expats, tourists, and locals — in English and Indonesian.",
    blog_read: "Read Article",
    blog_view_all: "View All Articles",

    // Location
    location_eyebrow: "Visit Us",
    location_title_1: "Visit",
    location_title_2: "Eswen Medica",
    location_desc:
      "Centrally located in Kuta, Bali — easy to reach from Seminyak, Canggu, and the airport.",
    location_contact_title: "Contact Information",
    location_address: "Address",
    location_hours: "Opening Hours",
    location_whatsapp: "WhatsApp",
    location_phone: "Phone",
    location_email: "Email",
    location_directions: "Get Directions",
    location_wa: "WhatsApp Us",
    location_walkins_title: "Walk-ins Welcome",
    location_walkins_desc:
      "Prefer to visit without an appointment? Our front desk team will help you find the next available slot.",
    location_walkins_note:
      "Avg. wait time: under 15 minutes during off-peak hours.",

    // Footer
    footer_desc:
      "Premium medical and aesthetic care in Bali — two brands, one connected ecosystem of health, beauty, and confidence.",
    footer_quick: "Quick Links",
    footer_brands: "Our Brands",
    footer_contact: "Contact",
    footer_medical: "Health • Wellness • Clinic",
    footer_aesthetic: "Beauty • Skin • Aesthetic",
    footer_two_brands: "Two Brands · One Care",
    footer_copyright: "© 2026 Eswen Medica. All Rights Reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms & Conditions",
    footer_back: "Back to top",

    // AI Assistant
    ai_welcome:
      "Halo! 👋 I'm the **Eswen AI Assistant**. I can help guide you to the right medical or aesthetic service in Bali.\n\nWhat concern can I help you with today?",
    ai_online: "Online · Triage & service guidance",
    ai_thinking: "Eswen AI is thinking...",
    ai_quick: "Quick questions",
    ai_placeholder: "Ask about your concern...",
    ai_book: "Book Consultation",
    ai_disclaimer:
      "This AI assistant provides general information only and does not replace professional medical diagnosis or consultation.",
    ai_error:
      "I'm having trouble connecting right now. Please try again, or reach us on WhatsApp for immediate help. 🙏",
  },

  id: {
    // Navbar
    nav_home: "Beranda",
    nav_brands: "Brand Kami",
    nav_services: "Layanan",
    nav_doctors: "Dokter",
    nav_about: "Tentang Kami",
    nav_blog: "Blog",
    nav_contact: "Kontak",
    nav_book: "Buat Janji",
    nav_tagline: "Kesehatan • Kecantikan • Kepercayaan",

    // Hero
    hero_badge: "Klinik Premium di Bali · Standar Internasional",
    hero_h1_l1: "Kesehatan Anda,",
    hero_h1_l2: "Prioritas Kami.",
    hero_h1_l3: "Kecantikan Anda,",
    hero_h1_l4: "Keahlian Kami.",
    hero_sub:
      "Layanan medis dan estetika terpadu di Bali, diberikan oleh profesional tepercaya dengan teknologi modern dan standar internasional.",
    hero_cta_book: "Buat Janji",
    hero_cta_explore: "Jelajahi Layanan Kami",
    hero_trust_1: "Dokter & Spesialis Terpercaya",
    hero_trust_2: "Teknologi Modern",
    hero_trust_3: "Standar Internasional",
    hero_trust_4: "Berlokasi di Bali",
    hero_card_deposit: "Deposit Aman",
    hero_card_deposit_sub: "Janji terjamin",
    hero_card_trusted: "Dipercaya 5.000+ tamu",
    hero_card_trusted_sub: "Ekspat & turis di Bali",
    hero_pill: "Dua Brand · Satu Layanan",

    // Brands
    brands_eyebrow: "Brand Kami",
    brands_title_1: "Dua Brand.",
    brands_title_2: "Satu Layanan.",
    brands_desc:
      "Eswen Medica dan Aesthetic Eswen beroperasi sebagai satu ekosistem terhubung — berbagi sistem booking, pembayaran, dan rekam medis Anda — sambil menjaga fokus berbeda pada kesehatan dan kecantikan.",
    brands_medical_tag: "Medis",
    brands_aesthetic_tag: "Estetika",
    brand_medical_tagline: "Kesehatan • Wellness • Klinik",
    brand_medical_desc:
      "Layanan kesehatan terpadu yang dirancang untuk mendukung kebutuhan kesehatan, wellness, dan medis Anda.",
    brand_medical_cta: "Kunjungi Eswen Medica",
    brand_aesthetic_tagline: "Kecantikan • Kulit • Estetika",
    brand_aesthetic_desc:
      "Perawatan estetika dan kecantikan tingkat lanjut yang dirancang untuk meningkatkan kepercayaan diri dan kesejahteraan alami Anda.",
    brand_aesthetic_cta: "Jelajahi Aesthetic Eswen",

    // Services
    services_eyebrow: "Layanan Kami",
    services_title_1: "Perawatan Dirancang untuk",
    services_title_2: "Kebutuhan Anda",
    services_desc:
      "Dari konsultasi medis umum hingga perawatan estetika lanjutan — jelajahi katalog lengkap layanan kesehatan dan kecantikan.",
    services_starting: "Mulai dari",
    services_view: "Lihat Detail",
    services_book: "Buat Janji Temu",

    // Smart booking
    booking_eyebrow: "Booking Pintar",
    booking_title_1: "Booking Pintar.",
    booking_title_2: "Pengalaman Mudah.",
    booking_desc:
      "Alur janji temu real-time terpandu untuk tamu internasional — amankan slot Anda dalam hitungan menit tanpa ganda booking.",
    booking_deposit_badge: "Pembayaran Deposit Aman",
    booking_deposit_title:
      "Janji temu Anda teramankan setelah pembayaran deposit.",
    booking_deposit_desc:
      "Deposit wajib mengurangi no-show, mencegah booking palsu, mengunci jadwal Anda, dan melindungi pendapatan klinik — sehingga setiap slot dihormati.",
    booking_reduce_noshow: "Kurangi no-show",
    booking_avoid_fake: "Hindari booking palsu",
    booking_lock: "Kunci jadwal Anda",
    booking_protect: "Lindungi pendapatan klinik",
    booking_methods: "Metode Pembayaran yang Diterima",
    booking_gateways: "Integrasi Payment Gateway",
    booking_cta: "Booking & Bayar Deposit",
    booking_status_title: "Alur Status Booking",
    booking_status_desc:
      "Pelacakan status transparan dari booking hingga selesai.",
    booking_pending: "MENUNGGU PEMBAYARAN",
    booking_pending_desc: "Booking dibuat, menunggu deposit.",
    booking_confirmed: "DIKONFIRMASI",
    booking_confirmed_desc: "Deposit terverifikasi — janji dikunci.",
    booking_failed: "PEMBAYARAN GAGAL",
    booking_failed_desc: "Deposit gagal — slot dilepas.",
    booking_all_statuses: "Semua Status Booking",
    booking_secure_note:
      "Booking tidak pernah diubah menjadi DIKONFIRMASI sebelum pembayaran diverifikasi via callback gateway.",

    // Patient journey
    journey_eyebrow: "Perjalanan Pasien",
    journey_title_1: "Dari Penemuan hingga",
    journey_title_2: "Tindak Lanjut",
    journey_desc:
      "Pengalaman terpandu yang mulus — dari pemeriksaan gejala pertama dengan asisten AI kami hingga tindak lanjut pasca-perawatan.",

    // Doctors
    doctors_eyebrow: "Profesional Kami",
    doctors_title_1: "Kenali",
    doctors_title_2: "Profesional Kami",
    doctors_desc:
      "Tim multibahasa tepercaya dari dokter, dokter estetika, beautician, dan perawat — bersertifikat dan berpengalaman dalam layanan standar internasional.",
    doctors_view_profile: "Lihat Profil",
    doctors_join_note: "Ingin bergabung dengan tim profesional tepercaya kami?",
    doctors_contact: "Hubungi kami",

    // About
    about_eyebrow: "Tentang Eswen",
    about_title_1: "Kesehatan & Kecantikan,",
    about_title_2: "Dirancang untuk Anda.",
    about_desc:
      "Eswen Medica berkomitmen memberikan pengalaman layanan yang profesional, nyaman, modern, dan mudah diakses — khusus untuk komunitas internasional di Bali.",
    about_patients: "Pasien puas dari 40+ negara",
    about_rating: "★ 4.9 / 5.0 rating",

    // Why choose us
    why_eyebrow: "Mengapa Memilih Kami",
    why_title_1: "Dibangun untuk",
    why_title_2: "Pengalaman Premium",
    why_desc:
      "Semua yang Anda butuhkan — dari booking pintar hingga pembayaran aman dan triase berbantuan AI — terhubung dalam satu ekosistem yang mulus.",

    // Blog
    blog_eyebrow: "Blog & Wawasan",
    blog_title_1: "Panduan",
    blog_title_2: "Kecantikan, Kulit & Wellness di Bali",
    blog_desc:
      "Konten tepercaya dan bermanfaat untuk ekspat, turis, dan masyarakat lokal — dalam bahasa Inggris dan Indonesia.",
    blog_read: "Baca Artikel",
    blog_view_all: "Lihat Semua Artikel",

    // Location
    location_eyebrow: "Kunjungi Kami",
    location_title_1: "Kunjungi",
    location_title_2: "Eswen Medica",
    location_desc:
      "Berlokasi strategis di Kuta, Bali — mudah dijangkau dari Seminyak, Canggu, dan bandara.",
    location_contact_title: "Informasi Kontak",
    location_address: "Alamat",
    location_hours: "Jam Buka",
    location_whatsapp: "WhatsApp",
    location_phone: "Telepon",
    location_email: "Email",
    location_directions: "Petunjuk Arah",
    location_wa: "Chat WhatsApp",
    location_walkins_title: "Datang Langsung Disambut",
    location_walkins_desc:
      "Ingin berkunjung tanpa janji temu? Tim front desk kami akan membantu menemukan slot tersedia berikutnya.",
    location_walkins_note:
      "Rata-rata waktu tunggu: di bawah 15 menit di jam sepi.",

    // Footer
    footer_desc:
      "Layanan medis dan estetika premium di Bali — dua brand, satu ekosistem terhubung untuk kesehatan, kecantikan, dan kepercayaan.",
    footer_quick: "Tautan Cepat",
    footer_brands: "Brand Kami",
    footer_contact: "Kontak",
    footer_medical: "Kesehatan • Wellness • Klinik",
    footer_aesthetic: "Kecantikan • Kulit • Estetika",
    footer_two_brands: "Dua Brand · Satu Layanan",
    footer_copyright: "© 2026 Eswen Medica. Hak Cipta Dilindungi.",
    footer_privacy: "Kebijakan Privasi",
    footer_terms: "Syarat & Ketentuan",
    footer_back: "Kembali ke atas",

    // AI Assistant
    ai_welcome:
      "Halo! 👋 Saya **Eswen AI Assistant**. Saya dapat membantu memandu Anda ke layanan medis atau estetika yang tepat di Bali.\n\nKeluhan apa yang bisa saya bantu hari ini?",
    ai_online: "Online · Triase & panduan layanan",
    ai_thinking: "Eswen AI sedang berpikir...",
    ai_quick: "Pertanyaan cepat",
    ai_placeholder: "Tanyakan keluhan Anda...",
    ai_book: "Buat Konsultasi",
    ai_disclaimer:
      "Asisten AI ini hanya memberikan informasi umum dan tidak menggantikan diagnosis atau konsultasi medis profesional.",
    ai_error:
      "Saya sedang kesulitan terhubung sekarang. Silakan coba lagi, atau hubungi kami via WhatsApp untuk bantuan segera. 🙏",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/**
 * Translation hook. Returns a `t` function bound to the current language.
 * Usage: `const t = useT(); t('nav_book')`
 */
export function useT() {
  const lang = useLanguage((s) => s.lang);
  return (key: TranslationKey): string => {
    return (translations[lang] as Record<string, string>)[key] ?? key;
  };
}

/** Non-hook helper to get a single translation for a specific language. */
export function tr(lang: Lang, key: TranslationKey): string {
  return (translations[lang] as Record<string, string>)[key] ?? key;
}
