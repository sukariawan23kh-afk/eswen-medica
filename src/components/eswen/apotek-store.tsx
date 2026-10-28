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
import {
  APOTEK_CATEGORIES,
  APOTEK_PRODUCTS,
  type ApotekCategory,
  type ApotekProduct,
} from "@/lib/eswen/apotek-data";

// Re-export the catalog data + types so existing imports from
// `@/components/eswen/apotek-store` keep working after the data was
// extracted into the server-safe `@/lib/eswen/apotek-data` module.
export { APOTEK_CATEGORIES, APOTEK_PRODUCTS } from "@/lib/eswen/apotek-data";
export type { ApotekCategory, ApotekProduct } from "@/lib/eswen/apotek-data";

const PAGE_SIZE = 8;

/* ------------------------------------------------------------------ */
/*  API response types + mappers                                       */
/* ------------------------------------------------------------------ */

/** Shape returned by GET /api/apotek/categories — public-facing. */
type ApiCategory = {
  id: string;
  name: { en: string; id: string };
  order: number;
};

/** Shape returned by GET /api/apotek/products — public-facing. */
type ApiProduct = {
  id: string;
  categoryId: string;
  name: { en: string; id: string };
  shortDesc: { en: string; id: string };
  fullDesc: { en: string; id: string };
  dosage: { en: string; id: string };
  usage: { en: string; id: string };
  precautions: { en: string; id: string };
  price: string;
  image: string;
  stock: number;
  category: { en: string; id: string };
  order: number;
};

/** Convert an API category into the internal ApotekCategory shape. */
function toApotekCategory(c: ApiCategory): ApotekCategory {
  return {
    // Use the DB id as the slug key (so it matches product.categorySlug,
    // which is also the DB categoryId on API-loaded products).
    slug: c.id,
    id: c.name.id,
    en: c.name.en,
  };
}

/** Convert an API product into the internal ApotekProduct shape. */
function toApotekProduct(p: ApiProduct): ApotekProduct {
  return {
    id: p.id,
    // Storefront uses a single `name` string — use the Indonesian version
    // (primary) since the storefront's lang toggle re-pulls from the
    // bilingual variants for the detail view.
    name: p.name.id,
    // Use categoryId as the slug key — it matches the category's `slug`
    // (= DB id) so the existing filter logic works unchanged.
    categorySlug: p.categoryId,
    descriptionId: p.shortDesc.id,
    descriptionEn: p.shortDesc.en,
    fullDescriptionId: p.fullDesc.id,
    fullDescriptionEn: p.fullDesc.en,
    dosageId: p.dosage.id,
    dosageEn: p.dosage.en,
    usageId: p.usage.id,
    usageEn: p.usage.en,
    precautionsId: p.precautions.id,
    precautionsEn: p.precautions.en,
    price: p.price,
    image: p.image,
    stock: p.stock,
    categoryNameId: p.category.id,
    categoryNameEn: p.category.en,
  };
}

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

  // API-loaded catalog (DB-backed). Null = not yet loaded; falls back to
  // the hardcoded APOTEK_CATEGORIES + APOTEK_PRODUCTS constants below.
  const [apiCats, setApiCats] = useState<ApotekCategory[] | null>(null);
  const [apiProds, setApiProds] = useState<ApotekProduct[] | null>(null);

  // Fetch categories + ALL products (across pages) from the public API
  // when the overlay opens. The API paginates 8/page server-side, so we
  // fetch the first page to learn `totalPages`, then fan out parallel
  // fetches for the rest. Once loaded, we do client-side filtering +
  // pagination locally (same UX as before, now driven by DB data).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const [catRes, page1] = await Promise.all([
          fetch("/api/apotek/categories", { cache: "no-store" }),
          fetch("/api/apotek/products?page=1", { cache: "no-store" }),
        ]);
        const catData = await catRes.json();
        const page1Data = await page1.json();
        if (cancelled) return;

        if (catData?.ok && Array.isArray(catData.categories)) {
          setApiCats(catData.categories.map(toApotekCategory));
        }

        if (page1Data?.ok && Array.isArray(page1Data.products)) {
          const firstBatch = page1Data.products.map(toApotekProduct);
          // If the API paginated more pages, fetch them in parallel.
          const totalPages: number = Number(page1Data.totalPages) || 1;
          if (totalPages > 1) {
            const rest = await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, i) =>
                fetch(`/api/apotek/products?page=${i + 2}`, { cache: "no-store" })
                  .then((r) => r.json())
                  .catch(() => ({ ok: false, products: [] }))
              )
            );
            if (cancelled) return;
            const more = rest
              .filter((d): d is { ok: true; products: ApiProduct[] } => d?.ok && Array.isArray(d.products))
              .flatMap((d) => d.products.map(toApotekProduct));
            setApiProds([...firstBatch, ...more]);
          } else {
            setApiProds(firstBatch);
          }
        }
      } catch {
        // Network/JSON errors — silently fall back to hardcoded constants.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Effective catalog = API data if loaded, else hardcoded constants.
  const categories: ApotekCategory[] = apiCats ?? APOTEK_CATEGORIES;
  const allProducts: ApotekProduct[] = apiProds ?? APOTEK_PRODUCTS;

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
    return allProducts.filter((p) => {
      const inCat = activeCategory === "all" || p.categorySlug === activeCategory;
      if (!inCat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.descriptionId.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q)
      );
    });
  }, [allProducts, activeCategory, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCategoryLabel =
    activeCategory === "all"
      ? t("apotek_store_all")
      : (() => {
          const c = categories.find((x) => x.slug === activeCategory);
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
                  // Prefer the API-loaded category name attached to the
                  // product (more accurate — handles the case where the
                  // category was renamed in the DB after the product was
                  // cached client-side).
                  if (lang === "id" && selectedProduct.categoryNameId) {
                    return selectedProduct.categoryNameId;
                  }
                  if (lang === "en" && selectedProduct.categoryNameEn) {
                    return selectedProduct.categoryNameEn || selectedProduct.categoryNameId || "";
                  }
                  // Fallback to looking up by slug in the effective
                  // categories list (works for hardcoded fallback products).
                  const c = categories.find(
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
                        {categories.map((c) => (
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
                            {categories.map((c) => (
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
                          stockEmptyLabel={t("apotek_stock_empty")}
                          stockLowLabel={t("apotek_stock_low")}
                          stockAvailableLabel={t("apotek_stock_available")}
                          stockLabel={t("apotek_stock")}
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
  stockEmptyLabel,
  stockLowLabel,
  stockAvailableLabel,
  stockLabel,
}: {
  product: ApotekProduct;
  lang: "en" | "id";
  buyLabel: string;
  brandMedical: string;
  brandApotek: string;
  index: number;
  onSelect: () => void;
  stockEmptyLabel: string;
  stockLowLabel: string;
  stockAvailableLabel: string;
  stockLabel: string;
}) {
  const description = lang === "id" ? product.descriptionId : product.descriptionEn;
  // API-loaded products carry `stock`. Hardcoded fallback products don't —
  // treat them as in-stock (we have no inventory data for them).
  const stock = typeof product.stock === "number" ? product.stock : null;
  const outOfStock = stock !== null && stock <= 0;
  const lowStock = stock !== null && stock > 0 && stock < 5;
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
        {/* Stock badge (top-right) — only when API loaded product with stock info */}
        {stock !== null && (
          <div
            className={cn(
              "absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider shadow-sm",
              outOfStock
                ? "bg-rose-100 text-rose-700"
                : lowStock
                ? "bg-amber-100 text-amber-700"
                : "bg-white/85 backdrop-blur-sm text-eswen-deep"
            )}
          >
            {outOfStock
              ? stockEmptyLabel
              : lowStock
              ? stockLowLabel
              : `${stockLabel}: ${stock}`}
          </div>
        )}
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
          {/* Inline availability text — small, muted, complements the badge */}
          {stock !== null && (
            <div
              className={cn(
                "text-[10px] font-bold tracking-wider uppercase",
                outOfStock
                  ? "text-rose-600"
                  : lowStock
                  ? "text-amber-600"
                  : "text-green-600"
              )}
            >
              {outOfStock ? stockEmptyLabel : lowStock ? stockLowLabel : stockAvailableLabel}
            </div>
          )}
          {stock === null && (
            <div className="text-[9px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {brandApotek}
            </div>
          )}
        </div>
        {outOfStock ? (
          // Out of stock — disabled, gray, "Stok Habis" label.
          <Button
            type="button"
            size="sm"
            disabled
            className="w-full rounded-full border border-stone-200 bg-stone-100 text-stone-400 h-9 text-xs font-semibold cursor-not-allowed"
          >
            <Package className="h-3.5 w-3.5" />
            {stockEmptyLabel}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={onSelect}
            className="w-full rounded-full border border-eswen-soft-purple bg-white text-eswen-deep hover:bg-gradient-to-r hover:from-eswen-deep hover:to-eswen-soft-purple hover:text-white hover:border-transparent transition-all h-9 text-xs font-semibold"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {buyLabel}
          </Button>
        )}
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

  // Stock status — only present for API-loaded products. Hardcoded
  // fallback products skip the stock UI entirely (treated as in-stock).
  const stock = typeof product.stock === "number" ? product.stock : null;
  const outOfStock = stock !== null && stock <= 0;
  const lowStock = stock !== null && stock > 0 && stock < 5;

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
              {/* Stock fact — only for API-loaded products (with stock info). */}
              {stock !== null && (
                <div
                  className={cn(
                    "rounded-2xl border p-3 sm:col-span-2",
                    outOfStock
                      ? "border-rose-300 bg-rose-50"
                      : lowStock
                      ? "border-amber-300 bg-amber-50"
                      : "border-green-300/60 bg-green-50/60"
                  )}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    {t("apotek_stock")}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-eswen-deep leading-tight">
                      {outOfStock
                        ? t("apotek_stock_empty")
                        : `${t("apotek_stock")}: ${stock}`}
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold",
                        outOfStock
                          ? "bg-rose-100 text-rose-700"
                          : lowStock
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      )}
                    >
                      {outOfStock
                        ? t("apotek_stock_empty")
                        : lowStock
                        ? t("apotek_stock_low")
                        : t("apotek_stock_available")}
                    </span>
                  </div>
                </div>
              )}
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
          {outOfStock ? (
            // Out of stock — disabled gray "Stok Habis" button (no WhatsApp link).
            <Button
              type="button"
              disabled
              className="shrink-0 rounded-full bg-stone-200 text-stone-500 h-12 px-6 text-sm font-bold cursor-not-allowed"
              aria-label={t("apotek_stock_empty")}
            >
              <Package className="h-4 w-4" />
              {t("apotek_stock_empty")}
            </Button>
          ) : (
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
          )}
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
