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
    nav_partners: "Partners",
    nav_apotek: "Apotek",
    nav_contact: "Contact",
    nav_book: "Book Appointment",
    nav_tagline: "Care Beyond Service",

    // Hero
    hero_badge: "Premium Clinic in Bali · International Standard",
    hero_h1_l1: "Care",
    hero_h1_l2: "Beyond Service",
    hero_h1_l3: "",
    hero_h1_l4: "",
    hero_sub:
      "Comprehensive medical and wellness care in Bali, delivered by trusted professionals with modern technology and international standards.",
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
    hero_pill: "Eswen Medica · Complete Care",

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

    // Promo
    nav_promo: "PROMO",
    promo_eyebrow: "Special Offers",
    promo_title_1: "Today's Best",
    promo_title_2: "Deals & Discounts",
    promo_desc:
      "Save on consultations, skin care, and wellness programs at Eswen Medica Bali. Limited-time offers, refreshed regularly — book early to lock in the best rate.",
    promo_no_offers:
      "No active offers right now. Please check back soon — we publish new deals every week.",
    promo_cta: "Claim This Offer",
    promo_daily: "Daily",
    promo_weekly: "Weekly",
    promo_monthly: "Monthly",
    promo_onetime: "One-time",

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
    about_title_1: "Healthcare,",
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

    // Partners (Insurance)
    partners_eyebrow: "Partnership",
    partners_title_1: "Insurance",
    partners_title_2: "Partners",
    partners_desc: "Connecting You with Reliable Insurance Providers",
    partners_body: "Our partnerships include BPJS, BNI Life, MHC, and Admedika. Our partnerships are designed to give you the best health protection and support, ensuring your wellbeing at every step.",
    partners_bpjs_tag: "National Health Insurance",
    partners_bnilife_tag: "Life Insurance",
    partners_mhc_tag: "Healthcare Management",
    partners_admedika_tag: "Healthcare Administration",

    // Apotek (Pharmacy)
    apotek_eyebrow: "Pharmacy",
    apotek_title_1: "Apotek",
    apotek_title_2: "Eswen",
    apotek_desc: "Your trusted pharmacy for prescription and OTC medications, health supplements, and medical supplies — located inside Eswen Medica clinic.",
    apotek_body: "Apotek Eswen provides a complete range of prescription medications, over-the-counter drugs, vitamins, supplements, and medical supplies. Our licensed pharmacists are available to answer your questions about dosage, interactions, and proper medication use. We work directly with the clinic's doctors to ensure seamless prescription processing — no need to visit a separate pharmacy.",
    apotek_rx_title: "Prescription Services",
    apotek_rx_desc: "Bring your doctor's prescription — we process it on-site while you wait.",
    apotek_otc_title: "OTC & Supplements",
    apotek_otc_desc: "Vitamins, supplements, first-aid kits, and over-the-counter medications.",
    apotek_care_title: "Pharmacist Consultation",
    apotek_care_desc: "Ask our licensed pharmacists about dosage, side effects, and drug interactions.",
    apotek_hours_title: "Operating Hours",
    apotek_hours_body: "Mon – Sun · 08:00 – 20:00 WITA (same as clinic)",
    apotek_cta: "Ask via WhatsApp",

    // Apotek Store (pharmacy e-commerce overlay)
    apotek_store_title: "Apotek Eswen",
    apotek_store_search: "Search products...",
    apotek_store_categories: "Product Categories",
    apotek_store_buy: "Buy Now",
    apotek_store_back: "Back",
    apotek_store_all: "All Products",
    apotek_store_no_results: "No products found",
    apotek_store_page: "Page",
    apotek_store_products_count: "products",
    apotek_store_view_all: "View All Products",
    apotek_store_brand_medical: "ESWEN MEDICA",
    apotek_store_brand_apotek: "APOTEK ESWEN",

    // Apotek Store — Product detail view
    apotek_detail_back: "Back",
    apotek_detail_description: "Description",
    apotek_detail_dosage: "Dosage",
    apotek_detail_usage: "Usage Instructions",
    apotek_detail_precautions: "Precautions",
    apotek_detail_price: "Price",
    apotek_detail_category: "Category",
    apotek_detail_buy_wa: "Buy Now via WhatsApp",

    // Apotek Store — Stock badges
    apotek_stock: "Stock",
    apotek_stock_empty: "Out of Stock",
    apotek_stock_low: "Low Stock",
    apotek_stock_available: "Available",

    // Apotek — Admin CMS tab
    apotek_admin_tab: "Pharmacy",
    apotek_admin_categories: "Product Categories",
    apotek_admin_products: "Products",
    apotek_admin_add_product: "Add Product",
    apotek_admin_add_category: "Add Category",
    apotek_admin_stock: "Stock Quantity",
    apotek_admin_price: "Price",
    apotek_admin_category: "Category",

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
      "Premium medical and wellness care in Bali — Eswen Medica delivers trusted, international-standard healthcare for expats, tourists, and locals.",
    footer_quick: "Quick Links",
    footer_brands: "Eswen Medica",
    footer_contact: "Contact",
    footer_medical: "Health • Wellness • Clinic",
    footer_aesthetic: "Dermatology • Skin Health",
    footer_two_brands: "Eswen Medica · Health & Wellness",
    footer_copyright: "© 2026 Eswen Medica. All Rights Reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms & Conditions",
    footer_back: "Back to top",

    // AI Assistant
    ai_welcome:
      "Halo! 👋 I'm the **Eswen AI Assistant**. I can help guide you to the right medical or wellness service at Eswen Medica in Bali.\n\nWhat concern can I help you with today?",
    ai_online: "Online · Triage & service guidance",
    ai_thinking: "Eswen AI is thinking...",
    ai_quick: "Quick questions",
    ai_placeholder: "Ask about your concern...",
    ai_book: "Book Consultation",
    ai_disclaimer:
      "This AI assistant provides general information only and does not replace professional medical diagnosis or consultation.",
    ai_error:
      "I'm having trouble connecting right now. Please try again, or reach us on WhatsApp for immediate help. 🙏",

    // Booking wizard
    bk_title: "Book an Appointment",
    bk_step: "Step",
    bk_of: "of",
    bk_step_service: "Service",
    bk_step_doctor: "Doctor",
    bk_step_datetime: "Date & Time",
    bk_step_info: "Your Info",
    bk_step_payment: "Deposit",
    bk_step_done: "Confirmed",
    bk_choose_service: "Choose a service",
    bk_choose_service_desc: "Pick the treatment or consultation you need.",
    bk_choose_doctor: "Select a professional",
    bk_choose_doctor_desc: "Our team of certified specialists will take care of you.",
    bk_choose_datetime: "Pick a date and time",
    bk_choose_datetime_desc: "Real-time availability — booked slots are disabled.",
    bk_your_info: "Enter your information",
    bk_your_info_desc: "Your data is stored securely and confidentially.",
    bk_label_name: "Full Name",
    bk_ph_name: "e.g. Jane Doe",
    bk_label_email: "Email",
    bk_ph_email: "you@example.com",
    bk_label_phone: "WhatsApp / Phone",
    bk_ph_phone: "+62 8xx-xxxx-xxxx",
    bk_label_notes: "Notes (optional)",
    bk_ph_notes: "Any concern or preference you'd like to share",
    bk_pay_deposit: "Pay deposit to confirm",
    bk_pay_desc:
      "Your appointment is secured after deposit payment. Choose your preferred method.",
    bk_deposit_amount: "Deposit amount",
    bk_pay_method: "Payment Method",
    bk_pay_gateway: "Payment Gateway",
    bk_pay_now: "Pay Deposit & Confirm",
    bk_processing: "Processing payment...",
    bk_back: "Back",
    bk_next: "Next",
    bk_select_date: "Select date",
    bk_select_time: "Select time",
    bk_no_slots: "All slots are booked for this date. Please pick another date.",
    bk_loading_slots: "Loading availability...",
    bk_slot_booked: "Booked",
    bk_confirm_title: "Booking Created!",
    bk_confirm_desc:
      "Transfer the deposit to our bank account below. Your booking will be CONFIRMED once we receive your transfer.",
    bk_ref_code: "Booking Reference",
    bk_status_label: "Status",
    bk_when: "When",
    bk_with: "With",
    bk_service: "Service",
    bk_close: "Close",
    bk_book_another: "Book Another",
    bk_pay_failed_title: "Payment Failed",
    bk_pay_failed_desc:
      "Your deposit payment didn't go through. Your slot is released — please try again.",
    bk_retry_payment: "Retry Payment",
    bk_err_required: "Please fill in all required fields.",
    bk_err_email: "Please enter a valid email.",
    bk_err_phone: "Please enter a valid phone number.",
    bk_err_slot_taken: "This slot was just booked. Please pick another time.",
    bk_err_generic: "Something went wrong. Please try again.",
    bk_created_status: "PENDING PAYMENT",
    bk_secure_note:
      "Booking is only CONFIRMED after our admin verifies your bank transfer arrived in the clinic's account.",
  },

  id: {
    // Navbar
    nav_home: "Beranda",
    nav_brands: "Brand Kami",
    nav_services: "Layanan",
    nav_doctors: "Dokter",
    nav_about: "Tentang Kami",
    nav_blog: "Blog",
    nav_partners: "Mitra",
    nav_apotek: "Apotek",
    nav_contact: "Kontak",
    nav_book: "Buat Janji",
    nav_tagline: "Care Beyond Service",

    // Hero
    hero_badge: "Klinik Premium di Bali · Standar Internasional",
    hero_h1_l1: "Perawatan",
    hero_h1_l2: "Melampaui Layanan",
    hero_h1_l3: "",
    hero_h1_l4: "",
    hero_sub:
      "Layanan medis dan kesejahteraan terpadu di Bali, diberikan oleh profesional tepercaya dengan teknologi modern dan standar internasional.",
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
    hero_pill: "Eswen Medica · Layanan Medis Lengkap",

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

    // Promo
    nav_promo: "PROMO",
    promo_eyebrow: "Penawaran Spesial",
    promo_title_1: "Penawaran & Diskon",
    promo_title_2: "Terbaik Hari Ini",
    promo_desc:
      "Hemat untuk konsultasi, perawatan kulit, dan program wellness di Eswen Medica Bali. Penawaran terbatas, diperbarui secara berkala — booking awal untuk dapatkan harga terbaik.",
    promo_no_offers:
      "Belum ada penawaran aktif saat ini. Silakan kembali lagi — kami merilis penawaran baru setiap minggu.",
    promo_cta: "Klaim Penawaran",
    promo_daily: "Harian",
    promo_weekly: "Mingguan",
    promo_monthly: "Bulanan",
    promo_onetime: "Sekali",

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
    about_title_1: "Kesehatan,",
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

    // Partners (Insurance)
    partners_eyebrow: "Kemitraan",
    partners_title_1: "Mitra",
    partners_title_2: "Asuransi",
    partners_desc: "Menghubungkan Anda dengan Penyedia Asuransi yang Andal",
    partners_body: "Kemitraan kami mencakup BPJS, BNI Life, MHC, dan Admedika. Kemitraan kami dirancang untuk memberi Anda perlindungan dan dukungan kesehatan terbaik, memastikan kesejahteraan Anda di setiap langkah.",
    partners_bpjs_tag: "Asuransi Kesehatan Nasional",
    partners_bnilife_tag: "Asuransi Jiwa",
    partners_mhc_tag: "Manajemen Kesehatan",
    partners_admedika_tag: "Administrasi Kesehatan",

    // Apotek (Pharmacy)
    apotek_eyebrow: "Apotek",
    apotek_title_1: "Apotek",
    apotek_title_2: "Eswen",
    apotek_desc: "Apotek tepercaya untuk obat resep, obat bebas, suplemen kesehatan, dan kebutuhan medis — berlokasi di dalam klinik Eswen Medica.",
    apotek_body: "Apotek Eswen menyediakan berbagai lengkap obat resep, obat bebas, vitamin, suplemen, dan kebutuhan medis. Apoteker berlisensi kami siap menjawab pertanyaan Anda tentang dosis, interaksi obat, dan penggunaan obat yang tepat. Kami bekerja langsung dengan dokter klinik untuk memastikan pemrosesan resep yang mulus — tidak perlu ke apotek terpisah.",
    apotek_rx_title: "Layanan Resep",
    apotek_rx_desc: "Bawa resep dokter Anda — kami proses di tempat sambil Anda menunggu.",
    apotek_otc_title: "Obat Bebas & Suplemen",
    apotek_otc_desc: "Vitamin, suplemen, kotak P3K, dan obat bebas.",
    apotek_care_title: "Konsultasi Apoteker",
    apotek_care_desc: "Tanya apoteker berlisensi kami tentang dosis, efek samping, dan interaksi obat.",
    apotek_hours_title: "Jam Operasional",
    apotek_hours_body: "Sen – Min · 08:00 – 20:00 WITA (sama dengan klinik)",
    apotek_cta: "Tanya via WhatsApp",

    // Apotek Store (pharmacy e-commerce overlay)
    apotek_store_title: "Apotek Eswen",
    apotek_store_search: "Cari produk...",
    apotek_store_categories: "Kategori Produk",
    apotek_store_buy: "Beli Sekarang",
    apotek_store_back: "Kembali",
    apotek_store_all: "Semua Produk",
    apotek_store_no_results: "Tidak ada produk ditemukan",
    apotek_store_page: "Halaman",
    apotek_store_products_count: "produk",
    apotek_store_view_all: "Lihat Semua Produk",
    apotek_store_brand_medical: "ESWEN MEDICA",
    apotek_store_brand_apotek: "APOTEK ESWEN",

    // Apotek Store — Product detail view
    apotek_detail_back: "Kembali",
    apotek_detail_description: "Deskripsi",
    apotek_detail_dosage: "Dosis",
    apotek_detail_usage: "Petunjuk Penggunaan",
    apotek_detail_precautions: "Perhatian",
    apotek_detail_price: "Harga",
    apotek_detail_category: "Kategori",
    apotek_detail_buy_wa: "Beli Sekarang via WhatsApp",

    // Apotek Store — Stock badges
    apotek_stock: "Stok",
    apotek_stock_empty: "Stok Habis",
    apotek_stock_low: "Stok Menipis",
    apotek_stock_available: "Tersedia",

    // Apotek — Admin CMS tab
    apotek_admin_tab: "Apotek",
    apotek_admin_categories: "Kategori Produk",
    apotek_admin_products: "Produk",
    apotek_admin_add_product: "Tambah Produk",
    apotek_admin_add_category: "Tambah Kategori",
    apotek_admin_stock: "Jumlah Stok",
    apotek_admin_price: "Harga",
    apotek_admin_category: "Kategori",

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
      "Layanan medis dan wellness premium di Bali — Eswen Medica memberikan layanan kesehatan berstandar internasional yang tepercaya untuk ekspat, turis, dan masyarakat lokal.",
    footer_quick: "Tautan Cepat",
    footer_brands: "Eswen Medica",
    footer_contact: "Kontak",
    footer_medical: "Kesehatan • Wellness • Klinik",
    footer_aesthetic: "Dermatologi • Kesehatan Kulit",
    footer_two_brands: "Eswen Medica · Kesehatan & Wellness",
    footer_copyright: "© 2026 Eswen Medica. Hak Cipta Dilindungi.",
    footer_privacy: "Kebijakan Privasi",
    footer_terms: "Syarat & Ketentuan",
    footer_back: "Kembali ke atas",

    // AI Assistant
    ai_welcome:
      "Halo! 👋 Saya **Eswen AI Assistant**. Saya dapat membantu memandu Anda ke layanan medis atau wellness yang tepat di Eswen Medica Bali.\n\nKeluhan apa yang bisa saya bantu hari ini?",
    ai_online: "Online · Triase & panduan layanan",
    ai_thinking: "Eswen AI sedang berpikir...",
    ai_quick: "Pertanyaan cepat",
    ai_placeholder: "Tanyakan keluhan Anda...",
    ai_book: "Buat Konsultasi",
    ai_disclaimer:
      "Asisten AI ini hanya memberikan informasi umum dan tidak menggantikan diagnosis atau konsultasi medis profesional.",
    ai_error:
      "Saya sedang kesulitan terhubung sekarang. Silakan coba lagi, atau hubungi kami via WhatsApp untuk bantuan segera. 🙏",

    // Booking wizard
    bk_title: "Buat Janji Temu",
    bk_step: "Langkah",
    bk_of: "dari",
    bk_step_service: "Layanan",
    bk_step_doctor: "Dokter",
    bk_step_datetime: "Tanggal & Waktu",
    bk_step_info: "Data Anda",
    bk_step_payment: "Deposit",
    bk_step_done: "Dikonfirmasi",
    bk_choose_service: "Pilih layanan",
    bk_choose_service_desc: "Pilih perawatan atau konsultasi yang Anda butuhkan.",
    bk_choose_doctor: "Pilih profesional",
    bk_choose_doctor_desc: "Tim spesialis bersertifikat kami akan melayani Anda.",
    bk_choose_datetime: "Pilih tanggal dan waktu",
    bk_choose_datetime_desc: "Ketersediaan real-time — slot yang sudah dipesan dinonaktifkan.",
    bk_your_info: "Masukkan data Anda",
    bk_your_info_desc: "Data Anda disimpan dengan aman dan rahasia.",
    bk_label_name: "Nama Lengkap",
    bk_ph_name: "mis. Budi Santoso",
    bk_label_email: "Email",
    bk_ph_email: "anda@example.com",
    bk_label_phone: "WhatsApp / Telepon",
    bk_ph_phone: "+62 8xx-xxxx-xxxx",
    bk_label_notes: "Catatan (opsional)",
    bk_ph_notes: "Keluhan atau preferensi yang ingin Anda sampaikan",
    bk_pay_deposit: "Bayar deposit untuk konfirmasi",
    bk_pay_desc:
      "Janji temu Anda teramankan setelah pembayaran deposit. Pilih metode yang Anda inginkan.",
    bk_deposit_amount: "Jumlah deposit",
    bk_pay_method: "Metode Pembayaran",
    bk_pay_gateway: "Payment Gateway",
    bk_pay_now: "Bayar Deposit & Konfirmasi",
    bk_processing: "Memproses pembayaran...",
    bk_back: "Kembali",
    bk_next: "Lanjut",
    bk_select_date: "Pilih tanggal",
    bk_select_time: "Pilih waktu",
    bk_no_slots: "Semua slot untuk tanggal ini sudah dipesan. Silakan pilih tanggal lain.",
    bk_loading_slots: "Memuat ketersediaan...",
    bk_slot_booked: "Dipesan",
    bk_confirm_title: "Booking Dibuat!",
    bk_confirm_desc:
      "Transfer deposit ke rekening bank kami di bawah ini. Booking Anda akan DIKONFIRMASI setelah transfer kami terima.",
    bk_ref_code: "Kode Referensi Booking",
    bk_status_label: "Status",
    bk_when: "Waktu",
    bk_with: "Dengan",
    bk_service: "Layanan",
    bk_close: "Tutup",
    bk_book_another: "Booking Lagi",
    bk_pay_failed_title: "Pembayaran Gagal",
    bk_pay_failed_desc:
      "Pembayaran deposit Anda tidak berhasil. Slot Anda dilepas — silakan coba lagi.",
    bk_retry_payment: "Coba Bayar Lagi",
    bk_err_required: "Mohon isi semua kolom yang wajib diisi.",
    bk_err_email: "Mohon masukkan email yang valid.",
    bk_err_phone: "Mohon masukkan nomor telepon yang valid.",
    bk_err_slot_taken: "Slot ini baru saja dipesan. Silakan pilih waktu lain.",
    bk_err_generic: "Terjadi kesalahan. Silakan coba lagi.",
    bk_created_status: "MENUNGGU PEMBAYARAN",
    bk_secure_note:
      "Booking hanya DIKONFIRMASI setelah admin kami memverifikasi transfer bank Anda diterima di rekening klinik.",
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
