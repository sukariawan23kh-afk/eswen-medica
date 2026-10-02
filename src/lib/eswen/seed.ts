import { db } from "@/lib/db";

type SeedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  language: "en" | "id";
  readTime: string;
};

// Default articles — used to seed the DB on first run, so the blog isn't empty.
// Admins can edit/delete these from the panel afterwards.
const SEED_ARTICLES: SeedArticle[] = [
  {
    title: "Medical Clinic Bali: A 2026 Guide for Expats & Tourists",
    slug: "medical-clinic-bali-expats",
    excerpt:
      "Looking for a trusted medical clinic in Bali? Here's what expats and international visitors should know — from general practice to travel medicine at Eswen Medica.",
    content:
      "# Medical Clinic Bali: A 2026 Guide for Expats & Tourists\n\nBali is home to a growing international community, and finding a trusted medical clinic is a top priority for expats and tourists. Eswen Medica offers comprehensive medical care...\n\n## Services\n- General practice\n- Dermatology\n- Travel medicine\n- Preventive screening",
    category: "Medical",
    imageUrl: "/images/blog-1.png",
    language: "en",
    readTime: "6 min read",
  },
  {
    title: "Skin Health in Bali: A Dermatologist's Guide to the Tropical Climate",
    slug: "skin-health-bali-dermatology",
    excerpt:
      "Acne, sun damage, and tropical-climate skin issues? Learn how our dermatologists at Eswen Medica diagnose and treat common skin conditions in Bali.",
    content:
      "# Skin Health in Bali\n\nThe tropical climate can affect your skin. Our dermatologists help with acne, sun damage, and more.",
    category: "Dermatology",
    imageUrl: "/images/service-medical.png",
    language: "en",
    readTime: "5 min read",
  },
  {
    title: "Medical Tourism in Bali: What International Guests Need to Know",
    slug: "medical-tourism-bali",
    excerpt:
      "Bali is fast becoming a medical tourism destination. Here's how Eswen Medica makes healthcare and preventive care seamless for international visitors.",
    content:
      "# Medical Tourism in Bali\n\nBali is a growing destination for medical tourism. Eswen Medica provides seamless care for international visitors.",
    category: "Medical Tourism",
    imageUrl: "/images/clinic-interior.png",
    language: "en",
    readTime: "7 min read",
  },
];

/** Seed the Article table with defaults if it's empty. Idempotent. */
export async function ensureArticlesSeeded() {
  const count = await db.article.count();
  if (count > 0) return;
  await db.article.createMany({ data: SEED_ARTICLES });
}
