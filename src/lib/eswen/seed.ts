import { db } from "@/lib/db";

type SeedArticle = {
  titleEn: string;
  titleId: string;
  slug: string;
  excerptEn: string;
  excerptId: string;
  contentEn: string;
  contentId: string;
  categoryEn: string;
  categoryId: string;
  imageUrl: string;
  readTime: string;
};

// Default articles — used to seed the DB on first run, so the blog isn't empty.
// Admins can edit/delete these from the panel afterwards.
//
// BILINGUAL: each article ships with both hand-written EN + ID content. The
// admin only ever edits the Indonesian version — the EN is auto-translated on
// save via MyMemory (translateIdToEn). For brand-new admin-created articles
// the EN will come from the API; for these 3 SEED defaults the EN is curated
// so the blog renders correctly on first run with no API calls needed.
const SEED_ARTICLES: SeedArticle[] = [
  {
    titleEn: "Medical Clinic Bali: A 2026 Guide for Expats & Tourists",
    titleId: "Klinik Medis Bali: Panduan 2026 untuk Ekspatriwa & Turis",
    slug: "medical-clinic-bali-expats",
    excerptEn:
      "Looking for a trusted medical clinic in Bali? Here's what expats and international visitors should know — from general practice to travel medicine at Eswen Medica.",
    excerptId:
      "Mencari klinik medis terpercaya di Bali? Inilah yang perlu diketahui ekspatriwa dan pengunjung internasional — mulai dari praktik umum hingga obat perjalanan di Eswen Medica.",
    contentEn:
      "# Medical Clinic Bali: A 2026 Guide for Expats & Tourists\n\nBali is home to a growing international community, and finding a trusted medical clinic is a top priority for expats and tourists. Eswen Medica offers comprehensive medical care...\n\n## Services\n- General practice\n- Dermatology\n- Travel medicine\n- Preventive screening",
    contentId:
      "# Klinik Medis Bali: Panduan 2026 untuk Ekspatriwa & Turis\n\nBali adalah rumah bagi komunitas internasional yang berkembang, dan menemukan klinik medis terpercaya adalah prioritas utama bagi ekspatriwa dan turis. Eswen Medica menyediakan layanan medis komprehensif...\n\n## Layanan\n- Praktik umum\n- Dermatologi\n- Obat perjalanan\n- Skrining preventif",
    categoryEn: "Medical",
    categoryId: "Medis",
    imageUrl: "/images/blog-1.png",
    readTime: "6 min read",
  },
  {
    titleEn: "Skin Health in Bali: A Dermatologist's Guide to the Tropical Climate",
    titleId: "Kesehatan Kulit di Bali: Panduan Dermatolog untuk Iklim Tropis",
    slug: "skin-health-bali-dermatology",
    excerptEn:
      "Acne, sun damage, and tropical-climate skin issues? Learn how our dermatologists at Eswen Medica diagnose and treat common skin conditions in Bali.",
    excerptId:
      "Jerawat, kerusakan akibat sinar matahari, dan masalah kulit iklim tropis? Pelajari bagaimana dermatolog kami di Eswen Medica mendiagnosis dan menangani kondisi kulit umum di Bali.",
    contentEn:
      "# Skin Health in Bali\n\nThe tropical climate can affect your skin. Our dermatologists help with acne, sun damage, and more.",
    contentId:
      "# Kesehatan Kulit di Bali\n\nIklim tropis dapat memengaruhi kulit Anda. Dermatolog kami membantu mengatasi jerawat, kerusakan akibat sinar matahari, dan lainnya.",
    categoryEn: "Dermatology",
    categoryId: "Dermatologi",
    imageUrl: "/images/service-medical.png",
    readTime: "5 min read",
  },
  {
    titleEn: "Medical Tourism in Bali: What International Guests Need to Know",
    titleId: "Pariwisata Medis di Bali: Yang Perlu Diketahui Tamu Internasional",
    slug: "medical-tourism-bali",
    excerptEn:
      "Bali is fast becoming a medical tourism destination. Here's how Eswen Medica makes healthcare and preventive care seamless for international visitors.",
    excerptId:
      "Bali dengan cepat menjadi tujuan pariwisata medis. Inilah cara Eswen Medica membuat layanan kesehatan dan perawatan preventif menjadi mulus untuk pengunjung internasional.",
    contentEn:
      "# Medical Tourism in Bali\n\nBali is a growing destination for medical tourism. Eswen Medica provides seamless care for international visitors.",
    contentId:
      "# Pariwisata Medis di Bali\n\nBali adalah tujuan pariwisata medis yang berkembang. Eswen Medica menyediakan perawatan yang mulus untuk pengunjung internasional.",
    categoryEn: "Medical Tourism",
    categoryId: "Pariwisata Medis",
    imageUrl: "/images/clinic-interior.png",
    readTime: "7 min read",
  },
];

/** Seed the Article table with defaults if it's empty. Idempotent. */
export async function ensureArticlesSeeded() {
  const count = await db.article.count();
  if (count > 0) return;
  await db.article.createMany({ data: SEED_ARTICLES });
}
