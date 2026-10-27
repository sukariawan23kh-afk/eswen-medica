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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";
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
  descriptionId: string;
  descriptionEn: string;
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
 * category, 2 pages for "All Products").
 */
export const APOTEK_PRODUCTS: ApotekProduct[] = [
  // ---- Batuk Pilek ----
  {
    id: "p-obh-combi",
    name: "OBH Combi 100ml",
    categorySlug: "batuk-pilek",
    descriptionId: "Sirup batuk IRP dengan ekstrak helikobakter untuk meredakan batuk berdahak dan pilek.",
    descriptionEn: "Cough syrup with herbal extract to relieve chesty cough and cold symptoms.",
    price: "IDR 28.500",
    image: IMG,
  },
  {
    id: "p-bisolvon",
    name: "Bisolvon 8mg Tablet",
    categorySlug: "batuk-pilek",
    descriptionId: "Tablet mukolitik untuk mengencerkan dahak dan meredakan batuk berdahak.",
    descriptionEn: "Mucolytic tablet that thins mucus and relieves chesty cough.",
    price: "IDR 32.000",
    image: IMG,
  },
  {
    id: "p-procold",
    name: "Procold Tablet",
    categorySlug: "batuk-pilek",
    descriptionId: "Tablet kombinasi untuk meredakan gejala flu, pilek, hidung tersumbat, dan sakit kepala.",
    descriptionEn: "Combination tablet that relieves flu symptoms, nasal congestion, and headache.",
    price: "IDR 15.000",
    image: IMG,
  },
  {
    id: "p-woods-peppermint",
    name: "Woods Peppermint 100ml",
    categorySlug: "batuk-pilek",
    descriptionId: "Sirup batuk dengan ekstrak peppermint dan herbal untuk batuk kering dan iritasi tenggorokan.",
    descriptionEn: "Cough syrup with peppermint and herbal extracts for dry cough and sore throat.",
    price: "IDR 35.000",
    image: IMG,
  },

  // ---- Pencernaan ----
  {
    id: "p-entrostop",
    name: "Entrostop Kaplet",
    categorySlug: "pencernaan",
    descriptionId: "Kaplet untuk mengatasi diare, kembung, dan gangguan pencernaan ringan.",
    descriptionEn: "Caplet for treating diarrhea, bloating, and mild digestive discomfort.",
    price: "IDR 22.000",
    image: IMG,
  },
  {
    id: "p-neo-synpatic",
    name: "Neo Synpatic Syrup 100ml",
    categorySlug: "pencernaan",
    descriptionId: "Sirup untuk meredakan gangguan pencernaan, kembung, dan mulas pada anak dan dewasa.",
    descriptionEn: "Syrup for digestive discomfort, bloating, and stomach ache in adults and children.",
    price: "IDR 26.000",
    image: IMG,
  },
  {
    id: "p-promag",
    name: "Promag Tablet",
    categorySlug: "pencernaan",
    descriptionId: "Tablet antasid untuk meredakan maag, kembung, dan rasa penuh di perut.",
    descriptionEn: "Antacid tablet that relieves heartburn, bloating, and fullness in the stomach.",
    price: "IDR 12.500",
    image: IMG,
  },
  {
    id: "p-diapet",
    name: "Diapet Kaflam Sirup",
    categorySlug: "pencernaan",
    descriptionId: "Sirup herbal untuk mengatasi diare akut dan menjaga kesehatan saluran pencernaan.",
    descriptionEn: "Herbal syrup for acute diarrhea that supports digestive tract health.",
    price: "IDR 24.000",
    image: IMG,
  },

  // ---- Vitamins & Suplemen ----
  {
    id: "p-vitc-1000",
    name: "Vitamin C 1000mg Tablet",
    categorySlug: "vitamins-suplemen",
    descriptionId: "Tablet hisap vitamin C 1000mg untuk meningkatkan daya tahan tubuh dan imunitas harian.",
    descriptionEn: "1000mg vitamin C effervescent tablet to boost daily immunity and resistance.",
    price: "IDR 45.000",
    image: IMG,
  },
  {
    id: "p-vitb-complex",
    name: "Vitamin B Complex Tablet",
    categorySlug: "vitamins-suplemen",
    descriptionId: "Suplemen vitamin B kompleks untuk energi, saraf, dan menjaga kesehatan kulit.",
    descriptionEn: "B-complex vitamin supplement for energy, nerve health, and skin maintenance.",
    price: "IDR 18.000",
    image: IMG,
  },
  {
    id: "p-enervon-c",
    name: "Enervon-C Tablet Effervescent",
    categorySlug: "vitamins-suplemen",
    descriptionId: "Tablet effervescent vitamin C + B kompleks untuk menjaga stamina dan daya tahan tubuh.",
    descriptionEn: "Effervescent vitamin C + B-complex tablet to maintain stamina and immune function.",
    price: "IDR 9.500",
    image: IMG,
  },
  {
    id: "p-sanfeng",
    name: "Sanfeng Suplemen Kapsul",
    categorySlug: "vitamins-suplemen",
    descriptionId: "Kapsul suplemen ginseng untuk menambah vitalitas, stamina, dan mengurangi kelelahan.",
    descriptionEn: "Ginseng supplement capsule to boost vitality, stamina, and reduce fatigue.",
    price: "IDR 65.000",
    image: IMG,
  },

  // ---- Alergi ----
  {
    id: "p-ctm",
    name: "CTM (Chlorphenamine) 4mg Tablet",
    categorySlug: "alergi",
    descriptionId: "Tablet antihistamin generik untuk meredakan gejala alergi, gatal-gatal, dan rhinitis.",
    descriptionEn: "Generic antihistamine tablet for allergy symptoms, itching, and rhinitis.",
    price: "IDR 5.000",
    image: IMG,
  },
  {
    id: "p-cetirizine",
    name: "Cetirizine 10mg Tablet",
    categorySlug: "alergi",
    descriptionId: "Tablet antihistamin generik untuk alergi musiman dan gatal-gatal kulit, non-drowsy.",
    descriptionEn: "Generic antihistamine tablet for seasonal allergies and skin itching, non-drowsy.",
    price: "IDR 7.500",
    image: IMG,
  },
  {
    id: "p-loratadine",
    name: "Loratadine 10mg Tablet",
    categorySlug: "alergi",
    descriptionId: "Tablet antihistamin untuk meredakan rhinitis alergi dan biduran, tanpa menyebabkan kantuk.",
    descriptionEn: "Antihistamine tablet for allergic rhinitis and hives, without causing drowsiness.",
    price: "IDR 8.000",
    image: IMG,
  },
  {
    id: "p-aveliz",
    name: "Aveliz Tablet",
    categorySlug: "alergi",
    descriptionId: "Tablet untuk meredakan gejala alergi seperti bersin, hidung berair, dan mata berair.",
    descriptionEn: "Tablet that relieves allergy symptoms like sneezing, runny nose, and watery eyes.",
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

  // Wrapped close handler — also resets internal state so the next open
  // starts fresh (search cleared, category = All, page = 1, mobile sidebar
  // collapsed). Defined as a stable callback so the Esc-key effect below
  // doesn't re-subscribe on every render.
  const handleClose = useCallback(() => {
    setQuery("");
    setActiveCategory("all");
    setPage(1);
    setMobileCatsOpen(false);
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

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

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
                <div className="relative w-44 sm:w-64 md:w-72 shrink-0">
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
              <div className="mt-2 sm:hidden relative">
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

          {/* ----------- Body (sidebar + grid) ----------- */}
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
}: {
  product: ApotekProduct;
  lang: "en" | "id";
  buyLabel: string;
  brandMedical: string;
  brandApotek: string;
  index: number;
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
      <div className="relative aspect-[4/3] overflow-hidden bg-eswen-light-lavender/50">
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
      </div>

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
          className="w-full rounded-full border border-eswen-soft-purple bg-white text-eswen-deep hover:bg-gradient-to-r hover:from-eswen-deep hover:to-eswen-soft-purple hover:text-white hover:border-transparent transition-all h-9 text-xs font-semibold"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {buyLabel}
        </Button>
      </div>
    </motion.article>
  );
}
