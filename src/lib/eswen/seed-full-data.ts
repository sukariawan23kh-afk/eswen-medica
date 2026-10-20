export type ServiceSeed = {
  id: string;
  categoryEn: string;
  categoryId: string;
  nameEn: string;
  nameId: string;
  descriptionEn: string;
  descriptionId: string;
  startingPrice: string;
  deposit: number;
  icon: string;
  image: string;
  brand: string;
  order: number;
};

export const SEED_SERVICES: ServiceSeed[] = [
  {
    id: "general-medical",
    categoryEn: "General Medical Services",
    categoryId: "Layanan Medis Umum",
    nameEn: "General Medical Consultation",
    nameId: "Konsultasi Medis Umum",
    descriptionEn:
      "Comprehensive general practice consultations, health screenings, and primary medical care delivered by experienced international-standard physicians.",
    descriptionId:
      "Konsultasi praktik umum terpadu, skrining kesehatan, dan layanan medis primer oleh dokter berpengalaman berstandar internasional.",
    startingPrice: "IDR 350.000",
    deposit: 100000,
    icon: "Stethoscope",
    image: "/images/service-medical.png",
    brand: "medical",
    order: 1,
  },
  {
    id: "dermatology",
    categoryEn: "Dermatology",
    categoryId: "Dermatologi",
    nameEn: "Dermatology & Skin Health",
    nameId: "Dermatologi & Kesehatan Kulit",
    descriptionEn:
      "Medical-grade diagnosis and treatment of skin conditions — acne, eczema, pigmentation, and skin infections — by board-certified dermatologists.",
    descriptionId:
      "Diagnosis dan perawatan medis untuk masalah kulit — jerawat, eksem, pigmentasi, dan infeksi kulit — oleh dokter kulit bersertifikat.",
    startingPrice: "IDR 500.000",
    deposit: 120000,
    icon: "Microscope",
    image: "/images/service-medical.png",
    brand: "medical",
    order: 2,
  },
  {
    id: "wellness-program",
    categoryEn: "Wellness Program",
    categoryId: "Program Wellness",
    nameEn: "Wellness & Vitality Program",
    nameId: "Program Wellness & Vitalitas",
    descriptionEn:
      "Holistic wellness programs, IV therapy, vitamin boosters, and lifestyle consultation to enhance your overall wellbeing.",
    descriptionId:
      "Program wellness holistik, terapi IV, booster vitamin, dan konsultasi gaya hidup untuk meningkatkan kesejahteraan menyeluruh.",
    startingPrice: "IDR 750.000",
    deposit: 150000,
    icon: "HeartPulse",
    image: "/images/service-medical.png",
    brand: "medical",
    order: 3,
  },
  {
    id: "consultation",
    categoryEn: "Consultation",
    categoryId: "Konsultasi",
    nameEn: "Specialist Consultation",
    nameId: "Konsultasi Spesialis",
    descriptionEn:
      "Personalized consultations with our specialists to design the right medical treatment plan for your needs and health goals.",
    descriptionId:
      "Konsultasi personal dengan spesialis kami untuk merancang rencana perawatan medis yang tepat bagi kebutuhan dan tujuan kesehatan Anda.",
    startingPrice: "IDR 250.000",
    deposit: 75000,
    icon: "ClipboardList",
    image: "/images/service-medical.png",
    brand: "medical",
    order: 4,
  },
  {
    id: "preventive-care",
    categoryEn: "Preventive Care",
    categoryId: "Perawatan Preventif",
    nameEn: "Preventive Care & Screening",
    nameId: "Perawatan Preventif & Skrining",
    descriptionEn:
      "Health check-up packages, early detection screenings, and preventive care programs to keep you healthy and confident.",
    descriptionId:
      "Paket medical check-up, skrining deteksi dini, dan program perawatan preventif untuk menjaga Anda tetap sehat dan percaya diri.",
    startingPrice: "IDR 950.000",
    deposit: 200000,
    icon: "ShieldPlus",
    image: "/images/service-medical.png",
    brand: "medical",
    order: 5,
  },
  {
    id: "travel-medicine",
    categoryEn: "Travel Medicine",
    categoryId: "Medis Perjalanan",
    nameEn: "Travel Medicine & Medical Check-up",
    nameId: "Medis Perjalanan & Medical Check-up",
    descriptionEn:
      "Vaccinations, travel health advice, pre-travel check-ups, and medical clearances tailored for expats and international visitors in Bali.",
    descriptionId:
      "Vaksinasi, konsultasi kesehatan perjalanan, check-up sebelum bepergian, dan surat keterangan medis khusus untuk ekspat dan tamu internasional di Bali.",
    startingPrice: "IDR 600.000",
    deposit: 120000,
    icon: "Activity",
    image: "/images/service-medical.png",
    brand: "medical",
    order: 6,
  },
];