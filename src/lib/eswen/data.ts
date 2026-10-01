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
  Syringe,
  Brain,
  Activity,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { label: string; href: string };
export const navLinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Our Brands", href: "#brands" },
  { label: "Services", href: "#services" },
  { label: "Doctors", href: "#doctors" },
  { label: "About Us", href: "#about" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

/* ---------- Hero trust points ---------- */
export const heroTrustPoints = [
  { icon: Stethoscope, label: "Trusted Doctors & Specialists" },
  { icon: Microscope, label: "Modern Technology" },
  { icon: ShieldPlus, label: "International Standard" },
  { icon: Building2, label: "Located in Bali" },
];

/* ---------- Brands ---------- */
export const brands = [
  {
    name: "Eswen Medica",
    tagline: "Health • Wellness • Clinic",
    description:
      "Comprehensive healthcare services designed to support your health, wellness and medical needs.",
    cta: "Visit Eswen Medica",
    accent: "medical" as const,
    highlights: ["General Practice", "Preventive Care", "Wellness Programs", "Medical Tourism"],
    image: "/images/brand-medical.png",
  },
  {
    name: "Aesthetic Eswen",
    tagline: "Beauty • Skin • Aesthetic",
    description:
      "Advanced aesthetic and beauty treatments designed to enhance your natural confidence and wellbeing.",
    cta: "Explore Aesthetic Eswen",
    accent: "aesthetic" as const,
    highlights: ["Facial Treatments", "Skin Rejuvenation", "Injectables", "Acne Care"],
    image: "/images/brand-aesthetic.png",
  },
];

/* ---------- Services ---------- */
export type Service = {
  id: string;
  category: string;
  name: string;
  description: string;
  startingPrice: string;
  icon: LucideIcon;
  image: string;
  brand: "medical" | "aesthetic";
};

export const services: Service[] = [
  {
    id: "general-medical",
    category: "General Medical Services",
    name: "General Medical Consultation",
    description:
      "Comprehensive general practice consultations, health screenings, and primary medical care delivered by experienced international-standard physicians.",
    startingPrice: "IDR 350.000",
    icon: Stethoscope,
    image: "/images/service-medical.png",
    brand: "medical",
  },
  {
    id: "aesthetic-treatments",
    category: "Aesthetic Treatments",
    name: "Aesthetic & Injectable Treatments",
    description:
      "Facial rejuvenation, dermal fillers, anti-wrinkle treatments, and advanced aesthetic procedures performed by certified aesthetic doctors.",
    startingPrice: "IDR 1.500.000",
    icon: Sparkles,
    image: "/images/service-aesthetic.png",
    brand: "aesthetic",
  },
  {
    id: "skin-beauty",
    category: "Skin & Beauty Care",
    name: "Skin & Beauty Treatment",
    description:
      "Premium facials, acne treatment, skin rejuvenation, and personalized beauty care designed for healthy, glowing skin.",
    startingPrice: "IDR 450.000",
    icon: Flower2,
    image: "/images/service-skin.png",
    brand: "aesthetic",
  },
  {
    id: "wellness-program",
    category: "Wellness Program",
    name: "Wellness & Vitality Program",
    description:
      "Holistic wellness programs, IV therapy, vitamin boosters, and lifestyle consultation to enhance your overall wellbeing.",
    startingPrice: "IDR 750.000",
    icon: HeartPulse,
    image: "/images/service-medical.png",
    brand: "medical",
  },
  {
    id: "consultation",
    category: "Consultation",
    name: "Specialist Consultation",
    description:
      "Personalized consultations with our doctors and beauticians to design the right treatment plan for your needs and goals.",
    startingPrice: "IDR 250.000",
    icon: ClipboardList,
    image: "/images/service-aesthetic.png",
    brand: "medical",
  },
  {
    id: "preventive-care",
    category: "Preventive Care",
    name: "Preventive Care & Screening",
    description:
      "Health check-up packages, early detection screenings, and preventive care programs to keep you healthy and confident.",
    startingPrice: "IDR 950.000",
    icon: ShieldPlus,
    image: "/images/service-medical.png",
    brand: "medical",
  },
];

/* ---------- Smart booking steps ---------- */
export const bookingSteps = [
  { step: 1, title: "Choose Service", description: "Browse medical or aesthetic services tailored to your needs.", icon: ClipboardList },
  { step: 2, title: "Select Doctor / Beautician", description: "Pick the trusted professional that suits your concern.", icon: UserRound },
  { step: 3, title: "Choose Date & Time", description: "Real-time availability — no double bookings, ever.", icon: CalendarDays },
  { step: 4, title: "Enter Patient Information", description: "Secure and confidential patient data collection.", icon: ClipboardList },
  { step: 5, title: "Pay Deposit", description: "Confirm your slot with a secure deposit payment.", icon: CreditCard },
  { step: 6, title: "Receive Confirmation", description: "Get instant booking confirmation via email & WhatsApp.", icon: CheckCircle2 },
];

/* ---------- Patient journey ---------- */
export const patientJourney = [
  { title: "Discover", icon: Sparkles },
  { title: "AI Triage", icon: Brain },
  { title: "Choose Service", icon: ClipboardList },
  { title: "Select Doctor", icon: UserRound },
  { title: "Select Date & Time", icon: CalendarDays },
  { title: "Pay Deposit", icon: CreditCard },
  { title: "Booking Confirmed", icon: CheckCircle2 },
  { title: "Visit Clinic", icon: Building2 },
  { title: "Follow-up", icon: Activity },
];

/* ---------- Doctors ---------- */
export type Doctor = {
  id: string;
  name: string;
  role: string;
  category: "doctor" | "aesthetic" | "beauty" | "wellness";
  specialty: string;
  experience: string;
  languages: string[];
  image: string;
  initials: string;
};

export const doctors: Doctor[] = [
  {
    id: "dr-anastasia",
    name: "Dr. Anastasia Putri",
    role: "Doctor",
    category: "doctor",
    specialty: "General Practice & Preventive Medicine",
    experience: "12+ years",
    languages: ["EN", "ID", "Japanese"],
    image: "/images/doctor-1.png",
    initials: "AP",
  },
  {
    id: "dr-marcus",
    name: "Dr. Marcus Tan",
    role: "Aesthetic Doctor",
    category: "aesthetic",
    specialty: "Aesthetic Medicine & Injectables",
    experience: "15+ years",
    languages: ["EN", "Chinese", "ID"],
    image: "/images/doctor-2.png",
    initials: "MT",
  },
  {
    id: "lina-beautician",
    name: "Lina Saraswati",
    role: "Beautician",
    category: "beauty",
    specialty: "Facial & Skin Therapy",
    experience: "9+ years",
    languages: ["EN", "ID", "Korean"],
    image: "/images/doctor-3.png",
    initials: "LS",
  },
  {
    id: "nurse-amara",
    name: "Amara Wijaya, RN",
    role: "Nurse / Therapist",
    category: "wellness",
    specialty: "IV Therapy & Wellness",
    experience: "7+ years",
    languages: ["EN", "ID"],
    image: "/images/doctor-4.png",
    initials: "AW",
  },
];

export const doctorFilters = ["All", "Doctor", "Aesthetic", "Beauty", "Wellness"] as const;

/* ---------- Why choose us ---------- */
export const whyChooseUs = [
  {
    title: "Smart Booking",
    description: "Real-time appointment scheduling with availability sync — no double bookings, ever.",
    icon: CalendarCheck,
  },
  {
    title: "Secure Deposit",
    description: "Your booking is locked and protected through a verified deposit payment system.",
    icon: ShieldPlus,
  },
  {
    title: "AI Assistance",
    description: "Initial service guidance through our friendly AI triage assistant — 24/7.",
    icon: Brain,
  },
  {
    title: "Integrated Data",
    description: "Connected customer, doctor, beautician and administrative data for seamless care.",
    icon: Activity,
  },
];

/* ---------- About highlights ---------- */
export const aboutHighlights = [
  { title: "Professional Team", description: "Certified, experienced, international-standard practitioners.", icon: StethoscopeIcon },
  { title: "Modern Facilities", description: "State-of-the-art medical and aesthetic technology.", icon: Microscope },
  { title: "Personalized Care", description: "Treatment plans designed around your unique needs.", icon: Hand },
  { title: "International Guest Friendly", description: "Multilingual team, expat & tourist ready.", icon: Smile },
];

/* ---------- Payment methods ---------- */
export const paymentMethods = ["Credit Card", "Virtual Account", "E-Wallet", "QRIS", "Bank Transfer"];
export const paymentGateways = ["Midtrans", "Xendit", "Stripe"];

/* ---------- Blog posts ---------- */
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  language: "EN" | "ID";
};

export const blogPosts: BlogPost[] = [
  {
    slug: "best-aesthetic-treatment-bali",
    title: "The Best Aesthetic Treatments in Bali: A 2026 Guide for Expats & Tourists",
    excerpt:
      "From advanced facials to aesthetic injectables, discover Bali's most trusted aesthetic treatments — and why Eswen Medica is the clinic international guests choose.",
    category: "Aesthetic",
    readTime: "6 min read",
    date: "Feb 12, 2026",
    image: "/images/blog-1.png",
    language: "EN",
  },
  {
    slug: "acne-treatment-bali",
    title: "Acne Treatment in Bali: A Dermatologist-Approved Skincare Path",
    excerpt:
      "Struggling with acne in Bali's tropical climate? Learn how our aesthetic doctors design personalized acne treatment plans that work.",
    category: "Skin Care",
    readTime: "5 min read",
    date: "Feb 5, 2026",
    image: "/images/service-skin.png",
    language: "EN",
  },
  {
    slug: "medical-tourism-bali",
    title: "Medical Tourism in Bali: What International Guests Need to Know",
    excerpt:
      "Bali is fast becoming a medical tourism destination. Here's how Eswen Medica makes healthcare and aesthetic care seamless for visitors.",
    category: "Medical Tourism",
    readTime: "7 min read",
    date: "Jan 28, 2026",
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
  hours: "Mon – Sun · 08:00 – 20:00 WITA",
  mapEmbed:
    "https://www.google.com/maps?q=Kuta,+Bali,+Indonesia&output=embed",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=Kuta+Bali+Indonesia",
};

/* ---------- Booking statuses (admin concept) ---------- */
export const bookingStatuses = [
  { label: "NEW", color: "bg-eswen-lavender text-eswen-deep" },
  { label: "WAITING PAYMENT", color: "bg-amber-100 text-amber-700" },
  { label: "CONFIRMED", color: "bg-green-100 text-green-700" },
  { label: "CHECKED IN", color: "bg-sky-100 text-sky-700" },
  { label: "IN TREATMENT", color: "bg-violet-100 text-violet-700" },
  { label: "COMPLETED", color: "bg-emerald-100 text-emerald-700" },
  { label: "CANCELLED", color: "bg-rose-100 text-rose-700" },
  { label: "NO SHOW", color: "bg-stone-100 text-stone-600" },
];
