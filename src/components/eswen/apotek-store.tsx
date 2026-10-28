"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  ChevronRight,
  Package,
  X,
  ChevronLeft,
  ShieldAlert,
  Pill,
  Beaker,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT, useContact } from "@/lib/eswen/site-config-context";
import { useMounted } from "@/hooks/use-mounted";

/* ------------------------------------------------------------------ */
/*  Types + hardcoded product data                                     */
/* ------------------------------------------------------------------ */

export type ApotekCategory = {
  /** Stable slug — used as filter key. */
  slug: string;
  /** Display name in Indonesian (primary, matches the screenshot). */
  id: string;
  /** Display name in English (used when lang = en). */
  en: string;
};

export type ApotekProduct = {
  id: string;
  name: string;
  categorySlug: string;
  /** Short card description (Indonesian). */
  descriptionId: string;
  /** Short card description (English). */
  descriptionEn: string;
  /** Full medical description (Indonesian, markdown OK). */
  fullDescriptionId: string;
  /** Full medical description (English, markdown OK). */
  fullDescriptionEn: string;
  /** Dosage info (Indonesian, markdown OK). */
  dosageId: string;
  /** Dosage info (English, markdown OK). */
  dosageEn: string;
  /** Usage instructions (Indonesian). */
  usageId: string;
  /** Usage instructions (English). */
  usageEn: string;
  /** Precautions/warnings (Indonesian, markdown OK). */
  precautionsId: string;
  /** Precautions/warnings (English, markdown OK). */
  precautionsEn: string;
  price: string;
  image: string;
};

/**
 * Full list of pharmacy categories shown in the sidebar — matches the
 * screenshot the user provided (Indonesian pharmacy categories).
 * Products are currently only seeded for 4 of these (Batuk Pilek,
 * Pencernaan, Vitamins & Suplemen, Alergi). The remaining categories
 * render an empty-state ("No products found") until products are added.
 */
export const APOTEK_CATEGORIES: ApotekCategory[] = [
  { slug: "darah", id: "Darah", en: "Blood" },
  { slug: "sembelit", id: "Sembelit", en: "Constipation" },
  { slug: "suplemen-anak", id: "Suplemen Anak-Anak", en: "Children's Supplements" },
  { slug: "alergi", id: "Alergi", en: "Allergy" },
  { slug: "dermatologi", id: "Dermatologi", en: "Dermatology" },
  { slug: "demam-anak", id: "Demam Anak", en: "Children's Fever" },
  { slug: "batuk-pilek", id: "Batuk Pilek", en: "Cough & Cold" },
  { slug: "mata", id: "Mata", en: "Eye Care" },
  { slug: "telinga", id: "Telinga", en: "Ear Care" },
  { slug: "pencernaan", id: "Pencernaan", en: "Digestive" },
  { slug: "mual-muntah", id: "Mual Muntah", en: "Nausea & Vomiting" },
  { slug: "kontrasepsi", id: "Kontrasepsi", en: "Contraception" },
  { slug: "vitamins-suplemen", id: "Vitamins & Suplemen", en: "Vitamins & Supplements" },
  { slug: "perawatan-kulit", id: "Perawatan Kulit", en: "Skin Care" },
];

const IMG = "/images/service-medical.png";

/**
 * 16 sample products across 4 categories (4 per category) — enough to
 * demonstrate pagination (8 per page → 2 pages when filtered to one
 * category, 2 pages for "All Products"). Each product carries full
 * medical content (description, dosage, usage, precautions) for the
 * in-overlay product detail view.
 */
export const APOTEK_PRODUCTS: ApotekProduct[] = [
  // ---- Batuk Pilek ----
  {
    id: "p-obh-combi",
    name: "OBH Combi 100ml",
    categorySlug: "batuk-pilek",
    descriptionId:
      "Sirup batuk IRP dengan ekstrak helikobakter untuk meredakan batuk berdahak dan pilek.",
    descriptionEn:
      "Cough syrup with herbal extract to relieve chesty cough and cold symptoms.",
    fullDescriptionId:
      "OBH Combi adalah sirup batuk kombinasi yang mengandung ekstrak herbal (termasuk *Helicteris isora* / helikobakter) dan bahan aktif antiglug yang bekerja dengan mengencerkan dahak (mukolitik) serta meredakan iritasi tenggorokan. Obat ini digunakan untuk meredakan batuk berdahak, pilek, dan gangguan saluran pernapasan ringan pada dewasa maupun anak-anak.",
    fullDescriptionEn:
      "OBH Combi is a combination cough syrup containing herbal extract (including *Helicteris isora*) plus anti-tussive actives that work by thinning mucus (mucolytic) and soothing throat irritation. Used to relieve chesty cough, common cold, and mild respiratory complaints in adults and children.",
    dosageId:
      "Ikuti petunjuk pada kemasan.\n\n**Dosis Dewasa:**\n- 3x sehari 1 sendok makan (15 ml)\n\n**Dosis Anak-anak (6-12 tahun):**\n- 3x sehari 1 sendok teh (5 ml)\n\n**Dosis Anak-anak (1-5 tahun):**\n- 3x sehari ½ sendok teh (2,5 ml)\n\nMaksimal penggunaan 7 hari.",
    dosageEn:
      "Follow package instructions.\n\n**Adults:** 1 tablespoon (15 ml) 3x daily.\n\n**Children 6-12 yrs:** 1 teaspoon (5 ml) 3x daily.\n\n**Children 1-5 yrs:** ½ teaspoon (2.5 ml) 3x daily.\n\nMax 7 days of use.",
    usageId:
      "Kocok sebelum digunakan. Konsumsi setelah makan. Gunakan sendok takar yang tersedia.",
    usageEn:
      "Shake before use. Take after meals. Use the provided measuring spoon.",
    precautionsId:
      "Tidak dianjurkan untuk anak di bawah 1 tahun. Konsultasikan dengan dokter jika gejala tidak membaik dalam 3 hari, batuk berdarah, demam tinggi, atau sesak napas. Berhati-hati pada pasien dengan riwayat alergi terhadap bahan aktif. **Kategori Kehamilan C** — ibu hamil dan menyusui konsultasi dokter terlebih dahulu.",
    precautionsEn:
      "Not recommended for children under 1 year. Consult a doctor if symptoms do not improve within 3 days, or if coughing up blood, high fever, or shortness of breath occurs. Use with caution in patients with known allergy to active ingredients. **Pregnancy Category C** — pregnant and breastfeeding women should consult a doctor first.",
    price: "IDR 28.500",
    image: IMG,
  },
  {
    id: "p-bisolvon",
    name: "Bisolvon 8mg Tablet",
    categorySlug: "batuk-pilek",
    descriptionId:
      "Tablet mukolitik untuk mengencerkan dahak dan meredakan batuk berdahak.",
    descriptionEn: "Mucolytic tablet that thins mucus and relieves chesty cough.",
    fullDescriptionId:
      "Bisolvon (Bromheksin HCl 8 mg) adalah obat mukolitik yang bekerja dengan memecah molekul mukopolisakarida dahak sehingga dahak menjadi lebih encer dan mudah dikeluarkan. Indikasi: gangguan saluran pernapasan akut dan kronis yang disertai dahak kental, seperti bronkitis, asma dengan dahak, PPOK, dan batuk berdahak.",
    fullDescriptionEn:
      "Bisolvon (Bromhexine HCl 8 mg) is a mucolytic that breaks down the mucopolysaccharide molecules in sputum, making it thinner and easier to clear. Indicated for acute and chronic respiratory conditions with viscous mucus, such as bronchitis, asthma with phlegm, COPD, and chesty cough.",
    dosageId:
      "**Dewasa:** 3x sehari 1 tablet (8 mg).\n\n**Anak-anak (6-12 tahun):** 3x sehari ½ tablet (4 mg).\n\n**Anak-anak (2-5 tahun):** 3x sehari ¼ tablet (2 mg).\n\nDikonsumsi setelah makan.",
    dosageEn:
      "**Adults:** 1 tablet (8 mg) 3x daily.\n\n**Children 6-12 yrs:** ½ tablet (4 mg) 3x daily.\n\n**Children 2-5 yrs:** ¼ tablet (2 mg) 3x daily.\n\nTake after meals.",
    usageId:
      "Dapat diminum sebelum atau sesudah makan. Tablet dapat dihancurkan untuk memudahkan pemberian pada anak.",
    usageEn:
      "May be taken before or after meals. Tablet may be crushed to ease administration to children.",
    precautionsId:
      "Hindari penggunaan pada pasien dengan tukak lambung aktif. Berhati-hati pada pasien dengan gangguan fungsi hati dan ginjal. **Kategori Kehamilan C** — tidak dianjurkan pada trimester pertama kehamilan. Konsultasikan jika gejala tidak membaik dalam 7 hari.",
    precautionsEn:
      "Avoid use in patients with active peptic ulcer. Use with caution in patients with hepatic or renal impairment. **Pregnancy Category C** — not recommended in the first trimester. Consult a doctor if no improvement within 7 days.",
    price: "IDR 32.000",
    image: IMG,
  },
  {
    id: "p-procold",
    name: "Procold Tablet",
    categorySlug: "batuk-pilek",
    descriptionId:
      "Tablet kombinasi untuk meredakan gejala flu, pilek, hidung tersumbat, dan sakit kepala.",
    descriptionEn:
      "Combination tablet that relieves flu symptoms, nasal congestion, and headache.",
    fullDescriptionId:
      "Procold adalah tablet kombinasi yang mengandung *Paracetamol 500 mg* (antipiretik/analgesik), *Phenylephrine HCl 5 mg* (dekongestan), dan *Chlorphenamine maleate 2 mg* (antihistamin). Indikasi: meredakan gejala flu dan selesma seperti demam, sakit kepala, hidung tersumbat, bersin-bersin, dan mata berair.",
    fullDescriptionEn:
      "Procold is a combination tablet containing *Paracetamol 500 mg* (antipyretic/analgesic), *Phenylephrine HCl 5 mg* (decongestant), and *Chlorphenamine maleate 2 mg* (antihistamine). Indicated for flu and common cold symptoms such as fever, headache, nasal congestion, sneezing, and watery eyes.",
    dosageId:
      "**Dewasa & anak di atas 12 tahun:** 3x sehari 1 tablet (maksimal 3 tablet/hari).\n\n**Anak 6-12 tahun:** 2x sehari ½ tablet sesuai anjuran dokter.\n\nDikonsumsi setelah makan.",
    dosageEn:
      "**Adults & children over 12 yrs:** 1 tablet 3x daily (max 3 tablets/day).\n\n**Children 6-12 yrs:** ½ tablet 2x daily as directed by a doctor.\n\nTake after meals.",
    usageId:
      "Dikonsumsi setelah makan dengan air putih. Jangan digunakan lebih dari 7 hari tanpa anjuran dokter.",
    usageEn:
      "Take after meals with water. Do not use for more than 7 days without a doctor's advice.",
    precautionsId:
      "Hindari konsumsi minuman beralkohol selama pengobatan. Dapat menyebabkan kantuk (mengandung antihistamin). Berhati-hati pada pasien dengan hipertensi, diabetes, hipertiroid, hipertrofi prostat, atau glaukoma. **Kategori Kehamilan C** — ibu hamil dan menyusui konsultasi dokter.",
    precautionsEn:
      "Avoid alcohol during treatment. May cause drowsiness (contains antihistamine). Use with caution in patients with hypertension, diabetes, hyperthyroidism, prostatic hypertrophy, or glaucoma. **Pregnancy Category C** — pregnant and breastfeeding women should consult a doctor.",
    price: "IDR 15.000",
    image: IMG,
  },
  {
    id: "p-woods-peppermint",
    name: "Woods Peppermint 100ml",
    categorySlug: "batuk-pilek",
    descriptionId:
      "Sirup batuk dengan ekstrak peppermint dan herbal untuk batuk kering dan iritasi tenggorokan.",
    descriptionEn:
      "Cough syrup with peppermint and herbal extracts for dry cough and sore throat.",
    fullDescriptionId:
      "Woods Peppermint adalah sirup batuk herbal yang mengandung ekstrak peppermint (*Mentha piperita*), *Marrubium vulgare* (horehound), dan bahan aktif antiglug alami yang bekerja dengan melembutkan tenggorokan dan meredakan batuk kering serta iritasi tenggorokan. Memberikan efek menyejukkan pada saluran pernapasan.",
    fullDescriptionEn:
      "Woods Peppermint is a herbal cough syrup containing peppermint extract (*Mentha piperita*), *Marrubium vulgare* (horehound), and natural anti-tussive actives that soothe the throat and relieve dry cough and throat irritation. Provides a cooling effect on the airways.",
    dosageId:
      "**Dewasa:** 3-4x sehari 1-2 sendok makan (15-30 ml).\n\n**Anak-anak (6-12 tahun):** 3x sehari 1 sendok teh (5 ml).\n\nDikonsumsi setelah makan.",
    dosageEn:
      "**Adults:** 1-2 tablespoons (15-30 ml) 3-4x daily.\n\n**Children 6-12 yrs:** 1 teaspoon (5 ml) 3x daily.\n\nTake after meals.",
    usageId:
      "Kocok sebelum digunakan. Gunakan sendok takar. Dapat dicampur dengan air hangat.",
    usageEn:
      "Shake before use. Use the measuring spoon. May be mixed with warm water.",
    precautionsId:
      "Tidak dianjurkan untuk anak di bawah 6 tahun. Hindari penggunaan pada pasien dengan riwayat alergi terhadap peppermint atau tanaman keluarga *Lamiaceae*. Konsultasikan dengan dokter jika gejala tidak membaik dalam 5 hari. **Kategori Kehamilan C**.",
    precautionsEn:
      "Not recommended for children under 6 years. Avoid in patients with known allergy to peppermint or plants of the *Lamiaceae* family. Consult a doctor if no improvement within 5 days. **Pregnancy Category C**.",
    price: "IDR 35.000",
    image: IMG,
  },

  // ---- Pencernaan ----
  {
    id: "p-entrostop",
    name: "Entrostop Kaplet",
    categorySlug: "pencernaan",
    descriptionId:
      "Kaplet untuk mengatasi diare, kembung, dan gangguan pencernaan ringan.",
    descriptionEn:
      "Caplet for treating diarrhea, bloating, and mild digestive discomfort.",
    fullDescriptionId:
      "Entrostop adalah kaplet herbal yang mengandung ekstrak *Curcuma xanthorrhiza* (kunyit) dan *Ageratum conyzoides* (jaguar) yang berfungsi sebagai antidiare dan antispasmodik alami. Bekerja dengan menghambat motilitas usus berlebih, mengurangi kembung, dan menyeimbangkan kembali flora usus. Indikasi: diare akut, kembung, mulas, dan gangguan pencernaan ringan.",
    fullDescriptionEn:
      "Entrostop is a herbal caplet containing extract of *Curcuma xanthorrhiza* (turmeric) and *Ageratum conyzoides* that acts as a natural antidiarrheal and antispasmodic. Works by reducing excessive bowel motility, easing bloating, and restoring gut flora balance. Indicated for acute diarrhea, bloating, colic, and mild digestive complaints.",
    dosageId:
      "**Dewasa:** 3x sehari 2 kaplet.\n\n**Anak-anak (6-12 tahun):** 3x sehari 1 kaplet.\n\nDikonsumsi setelah makan.",
    dosageEn:
      "**Adults:** 2 caplets 3x daily.\n\n**Children 6-12 yrs:** 1 caplet 3x daily.\n\nTake after meals.",
    usageId:
      "Dikonsumsi setelah makan dengan air putih. Tetap menjaga hidrasi dengan oralit jika diare berat.",
    usageEn:
      "Take after meals with water. Maintain hydration with ORS if diarrhea is severe.",
    precautionsId:
      "Konsultasikan dengan dokter jika diare berlangsung lebih dari 2 hari, terdapat darah pada tinja, demam tinggi, atau dehidrasi berat. Tidak dianjurkan untuk anak di bawah 6 tahun. **Kategori Kehamilan C** — hindari penggunaan jangka panjang tanpa pengawasan medis.",
    precautionsEn:
      "Consult a doctor if diarrhea lasts more than 2 days, there is blood in stool, high fever, or severe dehydration. Not recommended for children under 6 years. **Pregnancy Category C** — avoid long-term use without medical supervision.",
    price: "IDR 22.000",
    image: IMG,
  },
  {
    id: "p-neo-synpatic",
    name: "Neo Synpatic Syrup 100ml",
    categorySlug: "pencernaan",
    descriptionId:
      "Sirup untuk meredakan gangguan pencernaan, kembung, dan mulas pada anak dan dewasa.",
    descriptionEn:
      "Syrup for digestive discomfort, bloating, and stomach ache in adults and children.",
    fullDescriptionId:
      "Neo Synpatic adalah sirup antasida yang mengandung kombinasi *magnesium hidroksida*, *aluminium hidroksida*, dan *simetikon* untuk meredakan gangguan lambung seperti kembung, mulas, maag, dan rasa penuh setelah makan. Bekerja dengan menetralkan asam lambung berlebih dan mengurangi gas di saluran cerna.",
    fullDescriptionEn:
      "Neo Synpatic is an antacid syrup combining *magnesium hydroxide*, *aluminum hydroxide*, and *simethicone* to relieve gastric complaints such as bloating, colic, heartburn, and post-meal fullness. Works by neutralizing excess stomach acid and reducing gas in the digestive tract.",
    dosageId:
      "**Dewasa:** 3-4x sehari 1-2 sendok makan (15-30 ml).\n\n**Anak-anak (6-12 tahun):** 3x sehari 1 sendok teh (5 ml).\n\nDikonsumsi setelah makan dan sebelum tidur.",
    dosageEn:
      "**Adults:** 1-2 tablespoons (15-30 ml) 3-4x daily.\n\n**Children 6-12 yrs:** 1 teaspoon (5 ml) 3x daily.\n\nTake after meals and at bedtime.",
    usageId:
      "Kocok sebelum digunakan. Jangan diminum bersamaan dengan obat lain (beri jarak 1-2 jam).",
    usageEn:
      "Shake before use. Do not take at the same time as other medicines (allow 1-2 hours gap).",
    precautionsId:
      "Hindari penggunaan berlebihan karena dapat menyebabkan diare atau konstipasi. Berhati-hati pada pasien dengan gangguan ginjal (kandungan aluminium). Konsultasi dokter jika gejala ulu hati berlangsung lebih dari 2 minggu. **Kategori Kehamilan C** — ibu hamil konsultasi dokter.",
    precautionsEn:
      "Avoid excessive use as it may cause diarrhea or constipation. Use with caution in patients with renal impairment (aluminum content). Consult a doctor if heartburn lasts more than 2 weeks. **Pregnancy Category C** — pregnant women consult a doctor.",
    price: "IDR 26.000",
    image: IMG,
  },
  {
    id: "p-promag",
    name: "Promag Tablet",
    categorySlug: "pencernaan",
    descriptionId:
      "Tablet antasid untuk meredakan maag, kembung, dan rasa penuh di perut.",
    descriptionEn:
      "Antacid tablet that relieves heartburn, bloating, and fullness in the stomach.",
    fullDescriptionId:
      "Promag adalah tablet kunyah antasida yang mengandung *magnesium hidroksida*, *aluminium hidroksida*, dan *simetikon*. Bekerja dengan menetralkan asam lambung berlebih, melapisi dinding lambung, dan mengurangi gas-gas di saluran cerna. Indikasi: hipersekresi asam lambung, maag, kembung, dan rasa penuh setelah makan.",
    fullDescriptionEn:
      "Promag is a chewable antacid tablet containing *magnesium hydroxide*, *aluminum hydroxide*, and *simethicone*. Works by neutralizing excess stomach acid, coating the stomach lining, and reducing gas in the digestive tract. Indicated for acid hypersecretion, heartburn, bloating, and post-meal fullness.",
    dosageId:
      "**Dewasa:** 3-4x sehari 1-2 tablet. Dikunyah sampai hancur sebelum ditelan, boleh diikuti segelas air.\n\n**Anak-anak (6-12 tahun):** 1 tablet 3x sehari.",
    dosageEn:
      "**Adults:** 1-2 tablets 3-4x daily. Chew thoroughly before swallowing, may be followed with a glass of water.\n\n**Children 6-12 yrs:** 1 tablet 3x daily.",
    usageId:
      "Dikunyah sampai hancur sebelum ditelan. Boleh diikuti segelas air. Konsumsi setelah makan.",
    usageEn:
      "Chew thoroughly before swallowing. May be followed with a glass of water. Take after meals.",
    precautionsId:
      "Hindari penggunaan bersamaan dengan obat lain (beri jarak minimal 1-2 jam). Berhati-hati pada pasien dengan gangguan ginjal. Konsultasi dokter jika gejala tidak membaik dalam 2 minggu atau terdapat tanda-tanda pendarahan saluran cerna. **Kategori Kehamilan C**.",
    precautionsEn:
      "Do not take at the same time as other medicines (allow at least 1-2 hours gap). Use with caution in patients with renal impairment. Consult a doctor if symptoms do not improve within 2 weeks or if signs of gastrointestinal bleeding occur. **Pregnancy Category C**.",
    price: "IDR 12.500",
    image: IMG,
  },
  {
    id: "p-diapet",
    name: "Diapet Kaflam Sirup",
    categorySlug: "pencernaan",
    descriptionId:
      "Sirup herbal untuk mengatasi diare akut dan menjaga kesehatan saluran pencernaan.",
    descriptionEn:
      "Herbal syrup for acute diarrhea that supports digestive tract health.",
    fullDescriptionId:
      "Diapet adalah sirup herbal yang mengandung ekstrak daun jambu biji (*Psidium guajava*), kunyit, dan jaguar yang berfungsi sebagai antidiare alami. Bekerja dengan mengurangi motilitas usus, melapisi dinding usus, dan menyeimbangkan kembali flora usung. Indikasi: diare akut, gangguan buang air besar, dan menjaga kesehatan saluran cerna.",
    fullDescriptionEn:
      "Diapet is a herbal syrup containing extract of guava leaf (*Psidium guajava*), turmeric, and *Ageratum conyzoides* that acts as a natural antidiarrheal. Works by reducing bowel motility, coating the bowel lining, and restoring gut flora balance. Indicated for acute diarrhea, bowel irregularity, and maintaining digestive tract health.",
    dosageId:
      "**Dewasa:** 3x sehari 2 sendok makan (30 ml).\n\n**Anak-anak (6-12 tahun):** 3x sehari 1 sendok teh (5 ml).\n\nDikonsumsi setelah makan.",
    dosageEn:
      "**Adults:** 2 tablespoons (30 ml) 3x daily.\n\n**Children 6-12 yrs:** 1 teaspoon (5 ml) 3x daily.\n\nTake after meals.",
    usageId:
      "Kocok sebelum digunakan. Dikonsumsi setelah makan. Jaga hidrasi selama diare.",
    usageEn:
      "Shake before use. Take after meals. Maintain hydration during diarrhea.",
    precautionsId:
      "Konsultasikan dengan dokter jika diare berlangsung lebih dari 2 hari, terdapat darah pada tinja, atau demam tinggi. Tidak dianjurkan untuk anak di bawah 6 tahun. **Kategori Kehamilan C** — ibu hamil dan menyusui konsultasi dokter.",
    precautionsEn:
      "Consult a doctor if diarrhea lasts more than 2 days, there is blood in stool, or high fever. Not recommended for children under 6 years. **Pregnancy Category C** — pregnant and breastfeeding women should consult a doctor.",
    price: "IDR 24.000",
    image: IMG,
  },

  // ---- Vitamins & Suplemen ----
  {
    id: "p-vitc-1000",
    name: "Vitamin C 1000mg Tablet",
    categorySlug: "vitamins-suplemen",
    descriptionId:
      "Tablet hisap vitamin C 1000mg untuk meningkatkan daya tahan tubuh dan imunitas harian.",
    descriptionEn:
      "1000mg vitamin C effervescent tablet to boost daily immunity and resistance.",
    fullDescriptionId:
      "Vitamin C 1000 mg tablet mengandung asam askorbat murni yang berperan sebagai antioksidan dan kofaktor berbagai proses metabolisme. Indikasi: suplementasi vitamin C untuk meningkatkan daya tahan tubuh, mempercepat penyembuhan luka, mendukung sintesis kolagen, dan sebagai antioksidan. Cocok untuk menjaga imunitas harian terutama saat masa pemulihan, kelelahan, atau paparan polusi tinggi.",
    fullDescriptionEn:
      "Vitamin C 1000 mg tablet contains pure ascorbic acid, an antioxidant and cofactor in many metabolic processes. Indicated for vitamin C supplementation to boost immune function, accelerate wound healing, support collagen synthesis, and provide antioxidant protection. Ideal for daily immunity maintenance, especially during recovery, fatigue, or high pollution exposure.",
    dosageId:
      "**Dewasa:** 1 tablet sehari, dikunyah atau dilarutkan dalam segelas air.\n\n**Anak-anak di atas 6 tahun:** ½ tablet sehari atau sesuai anjuran.\n\nMaksimal 2000 mg/hari.",
    dosageEn:
      "**Adults:** 1 tablet daily, chewed or dissolved in a glass of water.\n\n**Children over 6 yrs:** ½ tablet daily or as directed.\n\nMax 2000 mg/day.",
    usageId:
      "Dapat dikunyah atau dilarutkan dalam segelas air (200 ml). Sebaiknya diminum setelah makan untuk mengurangi iritasi lambung.",
    usageEn:
      "May be chewed or dissolved in a glass of water (200 ml). Best taken after meals to reduce stomach irritation.",
    precautionsId:
      "Hindari dosis lebih dari 2000 mg/hari (dapat menyebabkan gangguan saluran cerna, batu ginjal, dan meningkatkan penyerapan besi). Berhati-hati pada pasien dengan riwayat batu ginjal, hemokromatosis, dan talasemia. **Kategori Kehamilan C** — ibu hamil maksimal 180 mg/hari sesuai anjuran dokter.",
    precautionsEn:
      "Avoid doses above 2000 mg/day (may cause gastrointestinal upset, kidney stones, and increased iron absorption). Use with caution in patients with history of kidney stones, hemochromatosis, or thalassemia. **Pregnancy Category C** — pregnant women max 180 mg/day as directed by a doctor.",
    price: "IDR 45.000",
    image: IMG,
  },
  {
    id: "p-vitb-complex",
    name: "Vitamin B Complex Tablet",
    categorySlug: "vitamins-suplemen",
    descriptionId:
      "Suplemen vitamin B kompleks untuk energi, saraf, dan menjaga kesehatan kulit.",
    descriptionEn:
      "B-complex vitamin supplement for energy, nerve health, and skin maintenance.",
    fullDescriptionId:
      "Vitamin B Complex tablet mengandung kombinasi vitamin B1 (tiamin), B2 (riboflavin), B3 (nikotinamida), B6 (piridoksin), dan B12 (sianokobalamin) yang berperan penting dalam metabolisme energi, fungsi sistem saraf, dan pemeliharaan kesehatan kulit, rambut, dan selaput lender. Indikasi: suplementasi vitamin B untuk mengatasi kelelahan, menjaga fungsi saraf, dan mendukung nafsu makan.",
    fullDescriptionEn:
      "Vitamin B Complex tablet combines B1 (thiamine), B2 (riboflavin), B3 (nicotinamide), B6 (pyridoxine), and B12 (cyanocobalamin) — essential for energy metabolism, nervous system function, and maintenance of skin, hair, and mucous membrane health. Indicated for B-vitamin supplementation, fatigue, nerve support, and appetite maintenance.",
    dosageId:
      "**Dewasa:** 1 tablet sehari setelah makan.\n\n**Anak-anak di atas 12 tahun:** 1 tablet sehari.\n\nDikonsumsi setelah makan.",
    dosageEn:
      "**Adults:** 1 tablet daily after meals.\n\n**Children over 12 yrs:** 1 tablet daily.\n\nTake after meals.",
    usageId:
      "Dikonsumsi setelah makan dengan air putih. Untuk hasil optimal, konsumsi secara teratur.",
    usageEn: "Take after meals with water. For best results, use regularly.",
    precautionsId:
      "Dapat menyebabkan warna kencing kuning lebih pekat (normal karena vitamin B2). Berhati-hati pada pasien dengan sensitivitas vitamin B. Konsultasi dokter jika terjadi reaksi alergi. **Kategori Kehamilan A** (aman pada dosis anjuran).",
    precautionsEn:
      "May cause darker yellow urine (normal due to vitamin B2). Use with caution in patients with B-vitamin sensitivity. Consult a doctor if an allergic reaction occurs. **Pregnancy Category A** (safe at recommended dose).",
    price: "IDR 18.000",
    image: IMG,
  },
  {
    id: "p-enervon-c",
    name: "Enervon-C Tablet Effervescent",
    categorySlug: "vitamins-suplemen",
    descriptionId:
      "Tablet effervescent vitamin C + B kompleks untuk menjaga stamina dan daya tahan tubuh.",
    descriptionEn:
      "Effervescent vitamin C + B-complex tablet to maintain stamina and immune function.",
    fullDescriptionId:
      "Enervon-C adalah tablet effervescent yang mengandung *vitamin C 1000 mg* dan *vitamin B kompleks* (B1, B2, B6, B12, nikotinamida, kalsium pantotenat). Bekerja sebagai antioksidan dan koenzim metabolisme energi. Indikasi: menjaga stamina dan daya tahan tubuh, mempercepat pemulihan dari kondisi lelah, mendukung penyembuhan luka, dan meningkatkan imunitas.",
    fullDescriptionEn:
      "Enervon-C is an effervescent tablet containing *vitamin C 1000 mg* and *B-complex vitamins* (B1, B2, B6, B12, nicotinamide, calcium pantothenate). Acts as an antioxidant and energy-metabolism coenzyme. Indicated for maintaining stamina and immunity, accelerating recovery from fatigue, supporting wound healing, and boosting immune function.",
    dosageId:
      "**Dewasa:** 1 tablet sehari dilarutkan dalam segelas air (200 ml). Maksimal 1 tablet per hari.",
    dosageEn:
      "**Adults:** 1 tablet daily dissolved in a glass of water (200 ml). Max 1 tablet per day.",
    usageId:
      "Larutkan satu tablet dalam segelas air (200 ml). Aduk rata dan segera diminum setelah larut. Sebaiknya diminum setelah makan.",
    usageEn:
      "Dissolve one tablet in a glass of water (200 ml). Stir and drink promptly after dissolved. Best taken after meals.",
    precautionsId:
      "Hindari dosis lebih dari 1000 mg vitamin C per hari dari semua sumber. Berhati-hati pada pasien dengan batu ginjal, hemokromatosis. Konsultasi dokter jika ada kondisi ginjal. **Kategori Kehamilan C** — ibu hamil konsultasi dokter terlebih dahulu.",
    precautionsEn:
      "Avoid doses above 1000 mg vitamin C per day from all sources. Use with caution in patients with kidney stones or hemochromatosis. Consult a doctor if there is a kidney condition. **Pregnancy Category C** — pregnant women should consult a doctor first.",
    price: "IDR 9.500",
    image: IMG,
  },
  {
    id: "p-sanfeng",
    name: "Sanfeng Suplemen Kapsul",
    categorySlug: "vitamins-suplemen",
    descriptionId:
      "Kapsul suplemen ginseng untuk menambah vitalitas, stamina, dan mengurangi kelelahan.",
    descriptionEn:
      "Ginseng supplement capsule to boost vitality, stamina, and reduce fatigue.",
    fullDescriptionId:
      "Sanfeng adalah suplemen kapsul yang mengandung ekstrak ginseng (*Panax ginseng*) serta bahan herbal lain yang berperan sebagai *adaptogen* — membantu tubuh beradaptasi terhadap stres fisik dan mental, meningkatkan vitalitas, stamina, dan mengurangi kelelahan. Indikasi: suplemen untuk menjaga stamina dan vitalitas, terutama pada saat kelelahan, kerja berat, atau masa pemulihan.",
    fullDescriptionEn:
      "Sanfeng is a supplement capsule containing ginseng extract (*Panax ginseng*) and other herbal actives that act as an *adaptogen* — helping the body adapt to physical and mental stress, enhancing vitality, stamina, and reducing fatigue. Indicated as a supplement for stamina and vitality, especially during fatigue, heavy work, or recovery.",
    dosageId: "**Dewasa:** 2x sehari 1 kapsul. Dikonsumsi setelah makan.",
    dosageEn: "**Adults:** 1 capsule 2x daily. Take after meals.",
    usageId:
      "Dikonsumsi setelah makan dengan air putih. Untuk hasil optimal, gunakan secara teratur selama 4-6 minggu.",
    usageEn:
      "Take after meals with water. For best results, use regularly for 4-6 weeks.",
    precautionsId:
      "Hindari penggunaan pada pasien dengan hipertensi tidak terkontrol, kecuali atas anjuran dokter. Tidak dianjurkan untuk wanita hamil, menyusui, dan anak di bawah 12 tahun. Konsultasi dokter jika sedang mengonsumsi obat antikoagulan, antidiabetik, atau antidepresan. Hentikan penggunaan jika muncul insomnia atau palpitasi.",
    precautionsEn:
      "Avoid use in patients with uncontrolled hypertension, unless directed by a doctor. Not recommended for pregnant or breastfeeding women, or children under 12 years. Consult a doctor if taking anticoagulants, antidiabetics, or antidepressants. Discontinue use if insomnia or palpitations occur.",
    price: "IDR 65.000",
    image: IMG,
  },

  // ---- Alergi ----
  {
    id: "p-ctm",
    name: "CTM (Chlorphenamine) 4mg Tablet",
    categorySlug: "alergi",
    descriptionId:
      "Tablet antihistamin generik untuk meredakan gejala alergi, gatal-gatal, dan rhinitis.",
    descriptionEn:
      "Generic antihistamine tablet for allergy symptoms, itching, and rhinitis.",
    fullDescriptionId:
      "CTM (*Chlorphenamine maleate 4 mg*) adalah antihistamin generasi pertama yang bekerja dengan menghambat reseptor H1 histamin. Indikasi: meredakan gejala rhinitis alergi, biduran (urtikaria), gatal-gatal akibat alergi makanan/obat, demam hay, dan reaksi alergi lain. Dapat menembus sawar darah otak sehingga menimbulkan efek kantuk.",
    fullDescriptionEn:
      "CTM (*Chlorphenamine maleate 4 mg*) is a first-generation antihistamine that blocks H1 histamine receptors. Indicated for allergic rhinitis, hives (urticaria), itching from food/drug allergy, hay fever, and other allergic reactions. Crosses the blood-brain barrier and may cause drowsiness.",
    dosageId:
      "**Dewasa & anak di atas 12 tahun:** 3-4x sehari 1 tablet (4 mg).\n\n**Anak-anak (6-12 tahun):** 2x sehari ½ tablet (2 mg).\n\nMaksimal 24 mg/hari dewasa.",
    dosageEn:
      "**Adults & children over 12 yrs:** 1 tablet (4 mg) 3-4x daily.\n\n**Children 6-12 yrs:** ½ tablet (2 mg) 2x daily.\n\nMax 24 mg/day for adults.",
    usageId: "Dikonsumsi setelah makan dengan air putih.",
    usageEn: "Take after meals with water.",
    precautionsId:
      "Dapat menyebabkan kantuk — hindari mengemudi atau mengoperasikan mesin. Hindari konsumsi alkohol. Berhati-hati pada pasien dengan glaukoma sudut sempit, hipertrofi prostat, hipertiroid, epilepsi. **Kategori Kehamilan B** — ibu hamil dan menyusui konsultasi dokter.",
    precautionsEn:
      "May cause drowsiness — avoid driving or operating machinery. Avoid alcohol. Use with caution in patients with narrow-angle glaucoma, prostatic hypertrophy, hyperthyroidism, or epilepsy. **Pregnancy Category B** — pregnant and breastfeeding women should consult a doctor.",
    price: "IDR 5.000",
    image: IMG,
  },
  {
    id: "p-cetirizine",
    name: "Cetirizine 10mg Tablet",
    categorySlug: "alergi",
    descriptionId:
      "Tablet antihistamin generik untuk alergi musiman dan gatal-gatal kulit, non-drowsy.",
    descriptionEn:
      "Generic antihistamine tablet for seasonal allergies and skin itching, non-drowsy.",
    fullDescriptionId:
      "Cetirizine 10 mg adalah antihistamin generasi kedua yang bekerja selektif pada reseptor H1 perifer tanpa menembus sawar darah otak secara signifikan, sehingga efek kantuk minimal (*non-drowsy*). Indikasi: rhinitis alergi musiman/perennial, biduran (urtikaria kronis), konjungtivitis alergi, dan gatal-gatal kulit.",
    fullDescriptionEn:
      "Cetirizine 10 mg is a second-generation antihistamine that selectively acts on peripheral H1 receptors without significantly crossing the blood-brain barrier, so drowsiness is minimal (*non-drowsy*). Indicated for seasonal/perennial allergic rhinitis, chronic urticaria (hives), allergic conjunctivitis, and skin itching.",
    dosageId:
      "**Dewasa & anak di atas 12 tahun:** 1 tablet (10 mg) sehari.\n\n**Anak-anak (6-12 tahun):** ½ tablet (5 mg) sehari atau 2x sehari ¼ tablet.\n\nMaksimal 10 mg/hari.",
    dosageEn:
      "**Adults & children over 12 yrs:** 1 tablet (10 mg) daily.\n\n**Children 6-12 yrs:** ½ tablet (5 mg) daily, or ¼ tablet 2x daily.\n\nMax 10 mg/day.",
    usageId:
      "Dikonsumsi setelah makan dengan air putih. Dapat diminum kapan saja namun sebaiknya pada jam yang sama setiap hari.",
    usageEn:
      "Take after meals with water. May be taken anytime, but ideally at the same time each day.",
    precautionsId:
      "Pada sebagian kecil pasien tetap dapat timbul rasa kantuk ringan — hindari mengemudi jika terpengaruh. Hindari konsumsi alkohol. Berhati-hati pada pasien dengan gangguan ginjal (perlu penyesuaian dosis). **Kategori Kehamilan B** — ibu hamil dan menyusui konsultasi dokter.",
    precautionsEn:
      "A small subset of patients may still experience mild drowsiness — avoid driving if affected. Avoid alcohol. Use with caution in patients with renal impairment (dose adjustment needed). **Pregnancy Category B** — pregnant and breastfeeding women should consult a doctor.",
    price: "IDR 7.500",
    image: IMG,
  },
  {
    id: "p-loratadine",
    name: "Loratadine 10mg Tablet",
    categorySlug: "alergi",
    descriptionId:
      "Tablet antihistamin untuk meredakan rhinitis alergi dan biduran, tanpa menyebabkan kantuk.",
    descriptionEn:
      "Antihistamine tablet for allergic rhinitis and hives, without causing drowsiness.",
    fullDescriptionId:
      "Loratadine 10 mg adalah antihistamin generasi kedua (*long-acting, trisiklik*) yang bekerja selektif pada reseptor H1 perifer. Tidak menembus sawar darah otak secara signifikan sehingga tidak menyebabkan kantuk pada dosis anjuran. Indikasi: rhinitis alergi (musiman dan perennial), biduran (urtikaria) kronis, dan reaksi alergi lain.",
    fullDescriptionEn:
      "Loratadine 10 mg is a second-generation antihistamine (long-acting, tricyclic) that selectively acts on peripheral H1 receptors. Does not significantly cross the blood-brain barrier, so it does not cause drowsiness at the recommended dose. Indicated for seasonal and perennial allergic rhinitis, chronic urticaria (hives), and other allergic reactions.",
    dosageId:
      "**Dewasa & anak di atas 12 tahun atau berat badan >30 kg:** 1 tablet (10 mg) sehari.\n\n**Anak-anak (6-12 tahun) dengan berat badan <30 kg:** ½ tablet (5 mg) sehari.",
    dosageEn:
      "**Adults & children over 12 yrs or weight >30 kg:** 1 tablet (10 mg) daily.\n\n**Children 6-12 yrs with weight <30 kg:** ½ tablet (5 mg) daily.",
    usageId:
      "Dikonsumsi setelah makan dengan air putih. Dapat diminum kapan saja.",
    usageEn: "Take after meals with water. May be taken anytime.",
    precautionsId:
      "Pada sebagian kecil pasien dapat timbul kantuk ringan. Hindari konsumsi alkohol. Berhati-hati pada pasien dengan gangguan hati berat (perlu penyesuaian dosis). **Kategori Kehamilan B** — ibu hamil dan menyusui konsultasi dokter.",
    precautionsEn:
      "A small subset of patients may experience mild drowsiness. Avoid alcohol. Use with caution in patients with severe hepatic impairment (dose adjustment needed). **Pregnancy Category B** — pregnant and breastfeeding women should consult a doctor.",
    price: "IDR 8.000",
    image: IMG,
  },
  {
    id: "p-aveliz",
    name: "Aveliz Tablet",
    categorySlug: "alergi",
    descriptionId:
      "Tablet untuk meredakan gejala alergi seperti bersin, hidung berair, dan mata berair.",
    descriptionEn:
      "Tablet that relieves allergy symptoms like sneezing, runny nose, and watery eyes.",
    fullDescriptionId:
      "Aveliz adalah tablet antihistamin generasi baru yang bekerja selektif pada reseptor H1 perifer. Indikasi: meredakan gejala rhinitis alergi (bersin, hidung berair, hidung tersumbat), konjungtivitis alergi, dan biduran. Diformulasi untuk memberikan efek cepat dan tahan lama dengan profil efek samping rendah.",
    fullDescriptionEn:
      "Aveliz is a newer-generation antihistamine tablet that selectively acts on peripheral H1 receptors. Indicated for relieving allergic rhinitis symptoms (sneezing, runny nose, nasal congestion), allergic conjunctivitis, and hives. Formulated for fast and long-lasting relief with a low side-effect profile.",
    dosageId:
      "**Dewasa & anak di atas 12 tahun:** 1 tablet sehari. Dikonsumsi setelah makan.",
    dosageEn:
      "**Adults & children over 12 yrs:** 1 tablet daily. Take after meals.",
    usageId:
      "Dikonsumsi setelah makan dengan air putih. Dapat diminum kapan saja, namun sebaiknya pada jam yang sama setiap hari.",
    usageEn:
      "Take after meals with water. May be taken anytime, but ideally at the same time each day.",
    precautionsId:
      "Pada sebagian kecil pasien dapat timbul kantuk ringan. Hindari konsumsi alkohol. Konsultasi dokter jika gejala tidak membaik dalam 7 hari, atau terjadi reaksi alergi berat (sesak, bengkak). **Kategori Kehamilan C** — ibu hamil dan menyusui konsultasi dokter.",
    precautionsEn:
      "A small subset of patients may experience mild drowsiness. Avoid alcohol. Consult a doctor if symptoms do not improve within 7 days, or if a severe allergic reaction (shortness of breath, swelling) occurs. **Pregnancy Category C** — pregnant and breastfeeding women should consult a doctor.",
    price: "IDR 14.000",
    image: IMG,
  },
];

const PAGE_SIZE = 8;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ApotekStore({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mounted = useMounted();
  const { lang } = useLanguage();
  const t = useT();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  // Mobile sidebar visibility toggle (categories collapse on small screens).
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  // Product selected for the in-overlay detail view. When non-null, the
  // grid is replaced by the <ProductDetail> panel.
  const [selectedProduct, setSelectedProduct] = useState<ApotekProduct | null>(null);

  // Wrapped close handler — also resets internal state so the next open
  // starts fresh (search cleared, category = All, page = 1, mobile sidebar
  // collapsed, no selected product). Defined as a stable callback so the
  // Esc-key effect below doesn't re-subscribe on every render.
  const handleClose = useCallback(() => {
    setQuery("");
    setActiveCategory("all");
    setPage(1);
    setMobileCatsOpen(false);
    setSelectedProduct(null);
    onClose();
  }, [onClose]);

  // Reset to page 1 whenever the category or search query changes.
  // Pattern recommended by the React docs: compare to the previous render's
  // values and adjust state during render (not in an effect) to avoid
  // cascading renders. See https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevFilter, setPrevFilter] = useState({ activeCategory, query });
  if (
    activeCategory !== prevFilter.activeCategory ||
    query !== prevFilter.query
  ) {
    setPrevFilter({ activeCategory, query });
    setPage(1);
  }

  // Lock body scroll while overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape — exits detail view first if open, otherwise closes overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedProduct) {
          setSelectedProduct(null);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose, selectedProduct]);

  // Filtered + paginated product list.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APOTEK_PRODUCTS.filter((p) => {
      const inCat = activeCategory === "all" || p.categorySlug === activeCategory;
      if (!inCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.descriptionId.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCategoryLabel =
    activeCategory === "all"
      ? t("apotek_store_all")
      : (() => {
          const c = APOTEK_CATEGORIES.find((x) => x.slug === activeCategory);
          return c ? (lang === "id" ? c.id : c.en) : t("apotek_store_all");
        })();

  // The overlay itself is gated behind `mounted` so Radix / framer-motion
  // IDs don't trigger a hydration mismatch (same pattern as the navbar).
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-white overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={t("apotek_store_title")}
        >
          {/* ----------- Top bar (sticky) ----------- */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Back button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white rounded-full px-3 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm font-semibold"
                  aria-label={t("apotek_store_back")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("apotek_store_back")}</span>
                </Button>

                {/* Brand */}
                <div className="flex items-center gap-2 sm:gap-3 mr-auto min-w-0">
                  <div className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div className="leading-tight min-w-0">
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-wider truncate">
                      {t("apotek_store_title")}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/80 truncate">
                      {t("apotek_store_brand_medical")} · {t("apotek_store_brand_apotek")}
                    </div>
                  </div>
                </div>

                {/* Search (hidden on very small screens — replaced by a row below top bar) */}
                <div
                  className={cn(
                    "relative w-44 sm:w-64 md:w-72 shrink-0 transition-opacity",
                    selectedProduct && "pointer-events-none opacity-0 sm:opacity-100 sm:pointer-events-auto"
                  )}
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-eswen-deep/60 pointer-events-none" />
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("apotek_store_search")}
                    className="pl-9 pr-3 h-9 sm:h-10 text-xs sm:text-sm bg-white text-eswen-deep placeholder:text-eswen-deep/40 border-white/40 rounded-full focus-visible:ring-white/60"
                    aria-label={t("apotek_store_search")}
                  />
                </div>
              </div>

              {/* Mobile search (visible only on very small screens) */}
              <div
                className={cn(
                  "mt-2 sm:hidden relative transition-all",
                  selectedProduct && "hidden"
                )}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-eswen-deep/60 pointer-events-none" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("apotek_store_search")}
                  className="pl-9 pr-3 h-10 text-sm bg-white text-eswen-deep placeholder:text-eswen-deep/40 border-white/40 rounded-full"
                  aria-label={t("apotek_store_search")}
                />
              </div>
            </div>
          </div>

          {/* ----------- Body ----------- */}
          {selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              lang={lang}
              t={t}
              onBack={() => setSelectedProduct(null)}
              categoryLabel={
                (() => {
                  const c = APOTEK_CATEGORIES.find(
                    (x) => x.slug === selectedProduct.categorySlug
                  );
                  return c ? (lang === "id" ? c.id : c.en) : selectedProduct.categorySlug;
                })()
              }
              brandMedical={t("apotek_store_brand_medical")}
              brandApotek={t("apotek_store_brand_apotek")}
            />
          ) : (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* -------- Sidebar -------- */}
                <aside className="lg:w-64 lg:shrink-0">
                  {/* Desktop sidebar */}
                  <div className="hidden lg:block sticky top-24">
                    <div className="rounded-2xl border border-eswen-lavender bg-gradient-to-br from-eswen-light-lavender/60 to-white p-4 shadow-eswen-soft">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-eswen-lavender/60">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white">
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-bold text-eswen-deep">
                          {t("apotek_store_categories")}
                        </h2>
                      </div>
                      <nav className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-eswen">
                        <CategoryItem
                          label={t("apotek_store_all")}
                          active={activeCategory === "all"}
                          onClick={() => setActiveCategory("all")}
                        />
                        {APOTEK_CATEGORIES.map((c) => (
                          <CategoryItem
                            key={c.slug}
                            label={lang === "id" ? c.id : c.en}
                            active={activeCategory === c.slug}
                            onClick={() => setActiveCategory(c.slug)}
                          />
                        ))}
                      </nav>
                    </div>
                  </div>

                  {/* Mobile sidebar — collapsible */}
                  <div className="lg:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileCatsOpen((v) => !v)}
                      className="w-full flex items-center justify-between rounded-2xl border border-eswen-lavender bg-gradient-to-br from-eswen-light-lavender/60 to-white px-4 py-3 shadow-eswen-soft"
                      aria-expanded={mobileCatsOpen}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold text-eswen-deep">
                        <ShoppingCart className="h-4 w-4" />
                        {t("apotek_store_categories")}: {activeCategoryLabel}
                      </span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-eswen-deep transition-transform",
                          mobileCatsOpen && "rotate-90"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileCatsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <nav className="mt-2 flex flex-col gap-0.5 rounded-2xl border border-eswen-lavender bg-white p-2 max-h-72 overflow-y-auto">
                            <CategoryItem
                              label={t("apotek_store_all")}
                              active={activeCategory === "all"}
                              onClick={() => {
                                setActiveCategory("all");
                                setMobileCatsOpen(false);
                              }}
                            />
                            {APOTEK_CATEGORIES.map((c) => (
                              <CategoryItem
                                key={c.slug}
                                label={lang === "id" ? c.id : c.en}
                                active={activeCategory === c.slug}
                                onClick={() => {
                                  setActiveCategory(c.slug);
                                  setMobileCatsOpen(false);
                                }}
                              />
                            ))}
                          </nav>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </aside>

                {/* -------- Main content (grid) -------- */}
                <section className="flex-1 min-w-0">
                  {/* Section title */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4 sm:mb-6">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-eswen-soft-purple">
                        {t("apotek_store_brand_apotek")}
                      </div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-eswen-deep tracking-tight">
                        {activeCategoryLabel}
                      </h1>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {filtered.length} {t("apotek_store_products_count")}
                    </div>
                  </div>

                  {/* Product grid */}
                  {pageItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-eswen-lavender bg-eswen-light-lavender/30">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-eswen-soft mb-4">
                        <Package className="h-6 w-6 text-eswen-soft-purple" />
                      </div>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {t("apotek_store_no_results")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                      {pageItems.map((p, idx) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          lang={lang}
                          buyLabel={t("apotek_store_buy")}
                          brandMedical={t("apotek_store_brand_medical")}
                          brandApotek={t("apotek_store_brand_apotek")}
                          index={idx}
                          onSelect={() => setSelectedProduct(p)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded-full border-eswen-lavender text-eswen-deep hover:bg-eswen-light-lavender h-9 px-3 text-xs"
                        aria-label="Previous page"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </Button>
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const n = i + 1;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPage(n)}
                            className={cn(
                              "min-w-9 h-9 px-3 rounded-full text-xs font-semibold transition-all",
                              page === n
                                ? "bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft"
                                : "bg-white border border-eswen-lavender text-eswen-deep hover:bg-eswen-light-lavender"
                            )}
                            aria-current={page === n}
                            aria-label={`${t("apotek_store_page")} ${n}`}
                          >
                            {n}
                          </button>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-full border-eswen-lavender text-eswen-deep hover:bg-eswen-light-lavender h-9 px-3 text-xs"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* Floating close button (mobile-friendly) */}
          <button
            type="button"
            onClick={handleClose}
            className="fixed top-3 right-3 sm:top-4 sm:right-4 z-20 inline-flex h-9 w-9 sm:hidden items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CategoryItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-2 w-full rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-medium transition-all",
        active
          ? "bg-eswen-light-lavender text-eswen-deep shadow-sm"
          : "text-foreground/75 hover:bg-eswen-light-lavender/60 hover:text-eswen-deep"
      )}
      aria-current={active}
    >
      <span className="truncate">{label}</span>
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-transform",
          active
            ? "text-eswen-deep translate-x-0.5"
            : "text-muted-foreground/60 group-hover:translate-x-0.5 group-hover:text-eswen-soft-purple"
        )}
      />
    </button>
  );
}

function ProductCard({
  product,
  lang,
  buyLabel,
  brandMedical,
  brandApotek,
  index,
  onSelect,
}: {
  product: ApotekProduct;
  lang: "en" | "id";
  buyLabel: string;
  brandMedical: string;
  brandApotek: string;
  index: number;
  onSelect: () => void;
}) {
  const description = lang === "id" ? product.descriptionId : product.descriptionEn;
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group flex flex-col rounded-2xl border border-eswen-lavender bg-white overflow-hidden shadow-eswen-soft hover:shadow-eswen-card hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <button
        type="button"
        onClick={onSelect}
        className="relative aspect-[4/3] overflow-hidden bg-eswen-light-lavender/50 text-left"
        aria-label={product.name}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/85 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold tracking-wider text-eswen-deep shadow-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-eswen-soft-purple" />
          {brandMedical}
        </div>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-bold text-eswen-deep line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
          {description}
        </p>
        <div className="flex items-end justify-between mb-3">
          <div className="text-sm font-bold text-eswen-soft-purple">{product.price}</div>
          <div className="text-[9px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
            {brandApotek}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onSelect}
          className="w-full rounded-full border border-eswen-soft-purple bg-white text-eswen-deep hover:bg-gradient-to-r hover:from-eswen-deep hover:to-eswen-soft-purple hover:text-white hover:border-transparent transition-all h-9 text-xs font-semibold"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {buyLabel}
        </Button>
      </div>
    </motion.article>
  );
}

/**
 * In-overlay product detail view. Replaces the product grid when a product
 * is selected. Shows the product image, key facts (name, price, category,
 * short description), then full markdown-rendered sections: Deskripsi,
 * Dosis, Petunjuk Penggunaan, Perhatian. A sticky WhatsApp "Buy Now"
 * button anchors the bottom for easy checkout.
 */
function ProductDetail({
  product,
  lang,
  t,
  onBack,
  categoryLabel,
  brandMedical,
  brandApotek,
}: {
  product: ApotekProduct;
  lang: "en" | "id";
  t: (key: string) => string;
  onBack: () => void;
  categoryLabel: string;
  brandMedical: string;
  brandApotek: string;
}) {
  const contact = useContact();

  const description = lang === "id" ? product.descriptionId : product.descriptionEn;
  const fullDescription = lang === "id" ? product.fullDescriptionId : product.fullDescriptionEn;
  const dosage = lang === "id" ? product.dosageId : product.dosageEn;
  const usage = lang === "id" ? product.usageId : product.usageEn;
  const precautions = lang === "id" ? product.precautionsId : product.precautionsEn;

  // Build the pre-filled WhatsApp message — includes product name + price.
  const waNumber = contact.whatsapp.replace(/[^0-9]/g, "");
  const waMessage =
    lang === "id"
      ? `Halo Apotek Eswen, saya ingin membeli:\n${product.name} - ${product.price}\n\nMohon info ketersediaan dan cara pembeliannya.`
      : `Hello Apotek Eswen, I would like to buy:\n${product.name} - ${product.price}\n\nPlease advise on availability and how to purchase.`;
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
    >
      {/* ----------- Back button ----------- */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onBack}
        className="mb-5 rounded-full border-eswen-lavender bg-white text-eswen-deep hover:bg-eswen-light-lavender hover:text-eswen-deep hover:border-eswen-soft-purple transition-all h-9 px-4 text-xs sm:text-sm font-semibold"
        aria-label={t("apotek_detail_back")}
      >
        <ChevronLeft className="h-4 w-4" />
        {t("apotek_detail_back")}
      </Button>

      {/* ----------- Hero (image + key facts) ----------- */}
      <div className="rounded-3xl border border-eswen-lavender bg-gradient-to-br from-eswen-light-lavender/40 via-white to-white p-4 sm:p-6 shadow-eswen-soft">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
          {/* Image */}
          <div className="sm:w-56 lg:w-64 shrink-0">
            <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-2xl bg-eswen-light-lavender/60 shadow-eswen-soft">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/85 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold tracking-wider text-eswen-deep shadow-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-eswen-soft-purple" />
                {brandMedical}
              </div>
              <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-eswen-deep/90 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold tracking-wider text-white shadow-sm">
                {brandApotek}
              </div>
            </div>
          </div>

          {/* Key facts */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="text-xs font-semibold uppercase tracking-wider text-eswen-soft-purple mb-1">
              {categoryLabel}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-eswen-deep leading-tight mb-3">
              {product.name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <DetailFact
                label={t("apotek_detail_price")}
                value={product.price}
                accent
              />
              <DetailFact
                label={t("apotek_detail_category")}
                value={categoryLabel}
              />
            </div>

            <p className="text-sm text-foreground/75 leading-relaxed rounded-2xl bg-white/70 border border-eswen-lavender/60 p-3">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* ----------- Detail sections ----------- */}
      <div className="mt-6 grid gap-5 sm:gap-6">
        {/* Deskripsi */}
        <DetailSection
          icon={BookOpen}
          title={t("apotek_detail_description")}
        >
          <MarkdownContent content={fullDescription} />
        </DetailSection>

        {/* Dosis */}
        <DetailSection
          icon={Beaker}
          title={t("apotek_detail_dosage")}
        >
          <MarkdownContent content={dosage} />
        </DetailSection>

        {/* Petunjuk Penggunaan */}
        <DetailSection
          icon={Pill}
          title={t("apotek_detail_usage")}
        >
          <MarkdownContent content={usage} />
        </DetailSection>

        {/* Perhatian */}
        <DetailSection
          icon={ShieldAlert}
          title={t("apotek_detail_precautions")}
          accent="warning"
        >
          <MarkdownContent content={precautions} />
        </DetailSection>
      </div>

      {/* ----------- Sticky WhatsApp buy bar ----------- */}
      <div className="sticky bottom-0 z-10 mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/90 backdrop-blur-md border-t border-eswen-lavender/60 shadow-[0_-8px_24px_-12px_rgba(76,29,90,0.25)]">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-eswen-soft-purple">
              {product.name}
            </div>
            <div className="text-base font-bold text-eswen-deep">{product.price}</div>
          </div>
          <Button
            type="button"
            asChild
            className="shrink-0 rounded-full bg-[#25D366] hover:bg-[#1fb855] text-white shadow-eswen-soft hover:shadow-eswen-card hover:-translate-y-0.5 transition-all h-12 px-6 text-sm font-bold"
          >
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("apotek_detail_buy_wa")}
            >
              <MessageCircle className="h-4 w-4" />
              {t("apotek_detail_buy_wa")}
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/** Small label/value card used in the detail hero (price, category, etc). */
function DetailFact({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-3",
        accent
          ? "border-eswen-soft-purple/40 bg-gradient-to-br from-eswen-light-lavender/70 to-white"
          : "border-eswen-lavender/60 bg-white"
      )}
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-eswen-soft-purple mb-1">
        {label}
      </div>
      <div className="text-sm font-bold text-eswen-deep leading-tight">{value}</div>
    </div>
  );
}

/**
 * Section wrapper for the detail view — icon chip + heading on top,
 * content area below. The `accent` prop switches the icon chip color
 * (e.g. amber/red for the Precautions section).
 */
function DetailSection({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  accent?: "warning" | "default";
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-eswen-lavender bg-white p-4 sm:p-5 shadow-eswen-soft">
      <header className="flex items-center gap-3 mb-3 pb-3 border-b border-eswen-lavender/60">
        <div
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm",
            accent === "warning"
              ? "bg-gradient-to-br from-amber-500 to-red-500"
              : "bg-gradient-to-br from-eswen-deep to-eswen-soft-purple"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-eswen-deep tracking-tight">
          {title}
        </h3>
      </header>
      <div className="text-sm text-foreground/80 leading-relaxed">{children}</div>
    </section>
  );
}

/**
 * Render markdown content (description, dosage, precautions) with the same
 * medical-aesthetic typography used elsewhere on the site. Uses
 * remark-gfm (tables, strikethrough, task lists) + remark-breaks
 * (single newlines → <br>).
 */
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-eswen text-sm text-foreground/80 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-1 mb-2 last:mb-0 marker:text-eswen-soft-purple">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-1 mb-2 last:mb-0 marker:text-eswen-soft-purple">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-bold text-eswen-deep">{children}</strong>
          ),
          em: ({ children }) => <em className="text-eswen-deep/90">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-eswen-soft-purple underline underline-offset-2 hover:text-eswen-deep"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
