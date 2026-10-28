"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2, Plus, Pencil, Trash2, X, Check, Minus,
  AlertTriangle, Package, ShoppingCart, Boxes, FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/eswen/admin/image-upload";
import { MarkdownEditor } from "@/components/eswen/admin/markdown-editor";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Cat = {
  id: string;
  nameId: string;
  nameEn: string;
  order: number;
  active: boolean;
  productsCount: number;
};

type Prod = {
  id: string;
  categoryId: string;
  category: { id: string; nameId: string; nameEn: string };
  nameId: string;
  nameEn: string;
  shortDescId: string;
  shortDescEn: string;
  fullDescId: string;
  fullDescEn: string;
  dosageId: string;
  dosageEn: string;
  usageId: string;
  usageEn: string;
  precautionsId: string;
  precautionsEn: string;
  price: string;
  image: string;
  stock: number;
  active: boolean;
  order: number;
};

const EMPTY_CAT: Cat = {
  id: "",
  nameId: "",
  nameEn: "",
  order: 0,
  active: true,
  productsCount: 0,
};

const EMPTY_PROD: Prod = {
  id: "",
  categoryId: "",
  category: { id: "", nameId: "", nameEn: "" },
  nameId: "",
  nameEn: "",
  shortDescId: "",
  shortDescEn: "",
  fullDescId: "",
  fullDescEn: "",
  dosageId: "",
  dosageEn: "",
  usageId: "",
  usageEn: "",
  precautionsId: "",
  precautionsEn: "",
  price: "IDR 0",
  image: "/images/service-medical.png",
  stock: 0,
  active: true,
  order: 0,
};

/* ------------------------------------------------------------------ */
/*  Stock badge helper (also used by apotek-store.tsx pattern)        */
/* ------------------------------------------------------------------ */

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[9px] font-bold">
        <AlertTriangle className="h-3 w-3" /> Stok Habis
      </span>
    );
  }
  if (stock < 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[9px] font-bold">
        <AlertTriangle className="h-3 w-3" /> Stok Menipis
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[9px] font-bold">
      <Check className="h-3 w-3" /> Tersedia
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main tab                                                            */
/* ------------------------------------------------------------------ */

export function ApotekTab({ showToast }: { showToast: (msg: string) => void }) {
  // Two sub-sections (the spec calls them "Categories" + "Products").
  const [sub, setSub] = useState<"products" | "categories">("products");

  // Categories state.
  const [cats, setCats] = useState<Cat[] | null>(null);
  const [editingCat, setEditingCat] = useState<Cat | "new" | null>(null);

  // Products state.
  const [prods, setProds] = useState<Prod[] | null>(null);
  const [editingProd, setEditingProd] = useState<Prod | "new" | null>(null);
  // Optimistic stock deltas keyed by product id (so the +/- buttons feel
  // instant even before the PUT resolves). Cleared after server confirms.
  const [stockTicks, setStockTicks] = useState<Record<string, number>>({});

  const loadCats = useCallback(async () => {
    const r = await fetch("/api/admin/product-categories", { cache: "no-store" });
    const d = await r.json();
    if (d?.ok) setCats(d.categories);
  }, []);

  const loadProds = useCallback(async () => {
    const r = await fetch("/api/admin/products", { cache: "no-store" });
    const d = await r.json();
    if (d?.ok) setProds(d.products);
  }, []);

  useEffect(() => {
    loadCats();
    loadProds();
  }, [loadCats, loadProds]);

  // ---- Category save / delete ----
  const saveCat = async (data: Cat) => {
    const isNew = editingCat === "new";
    const body = { nameId: data.nameId, order: Number(data.order) || 0, active: data.active };
    const r = await fetch(
      isNew
        ? "/api/admin/product-categories"
        : `/api/admin/product-categories/${(editingCat as Cat)?.id}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const d = await r.json();
    if (r.ok && d?.ok) {
      setEditingCat(null);
      await Promise.all([loadCats(), loadProds()]);
      showToast("Category saved");
    } else {
      showToast(d?.error || "Error");
    }
  };

  const delCat = async (id: string) => {
    if (!confirm("Delete this category? Products in it must be reassigned first.")) return;
    const r = await fetch(`/api/admin/product-categories/${id}`, { method: "DELETE" });
    const d = await r.json();
    if (r.ok && d?.ok) {
      await loadCats();
      showToast("Category deleted");
    } else {
      showToast(d?.error || "Error");
    }
  };

  // ---- Product save / delete ----
  const saveProd = async (data: Prod) => {
    const isNew = editingProd === "new";
    if (!data.categoryId) {
      showToast("Pick a category first");
      return;
    }
    const body = {
      categoryId: data.categoryId,
      nameId: data.nameId,
      shortDescId: data.shortDescId,
      fullDescId: data.fullDescId,
      dosageId: data.dosageId,
      usageId: data.usageId,
      precautionsId: data.precautionsId,
      price: data.price,
      image: data.image,
      stock: Number(data.stock) || 0,
      order: Number(data.order) || 0,
      active: data.active,
    };
    const r = await fetch(
      isNew ? "/api/admin/products" : `/api/admin/products/${(editingProd as Prod)?.id}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const d = await r.json();
    if (r.ok && d?.ok) {
      setEditingProd(null);
      await loadProds();
      showToast("Product saved");
    } else {
      showToast(d?.error || "Error");
    }
  };

  const delProd = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const r = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (r.ok) {
      await loadProds();
      showToast("Product deleted");
    }
  };

  // ---- Quick stock +/- (single PUT with just `stock`) ----
  // Sends a partial PUT — the API only re-translates EN when ID text
  // changes, so a stock-only update is cheap (no MyMemory calls).
  const quickStock = async (id: string, currentStock: number, delta: number) => {
    const next = Math.max(0, currentStock + delta);
    // Optimistic tick — show the new value immediately.
    setStockTicks((m) => ({ ...m, [id]: delta }));
    try {
      const r = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: next }),
      });
      if (r.ok) {
        await loadProds();
        showToast("Stock updated");
      } else {
        showToast("Failed to update stock");
      }
    } finally {
      setStockTicks((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
  };

  const loading = !prods || !cats;

  return (
    <div>
      {/* Header + sub-section switch */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-extrabold text-eswen-deep">Apotek (Pharmacy)</h3>
        <div className="inline-flex rounded-full bg-eswen-light-lavender p-1 gap-1">
          <SubTabBtn active={sub === "products"} onClick={() => setSub("products")} icon={<Boxes className="h-4 w-4" />}>
            Products
          </SubTabBtn>
          <SubTabBtn active={sub === "categories"} onClick={() => setSub("categories")} icon={<FolderTree className="h-4 w-4" />}>
            Categories
          </SubTabBtn>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : sub === "categories" ? (
        <div>
          <div className="flex items-center justify-end mb-3">
            <Button
              onClick={() => setEditingCat("new")}
              className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-4 text-sm"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>
          {cats && cats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No categories yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cats?.map((c) => (
                <div key={c.id} className="rounded-2xl border border-eswen-lavender bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-eswen-deep leading-tight">{c.nameId}</h4>
                      <p className="text-[11px] text-muted-foreground truncate">{c.nameEn || "—"}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold",
                        c.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                      )}
                    >
                      {c.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{c.productsCount} product(s)</span>
                    <span>·</span>
                    <span>order {c.order}</span>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <button
                      onClick={() => setEditingCat(c)}
                      className="inline-flex items-center gap-1 rounded-full bg-eswen-light-lavender text-eswen-deep px-2.5 py-1 text-[11px] font-semibold"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => delCat(c.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-500 px-2.5 py-1 text-[11px] font-semibold"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {editingCat && (
            <CatEditor
              cat={editingCat === "new" ? EMPTY_CAT : editingCat}
              onClose={() => setEditingCat(null)}
              onSave={saveCat}
            />
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-end mb-3">
            <Button
              onClick={() => setEditingProd("new")}
              className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-4 text-sm"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>
          {prods && prods.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No products yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {prods?.map((p) => {
                const tick = stockTicks[p.id] || 0;
                const stock = p.stock + tick;
                return (
                  <div key={p.id} className="rounded-2xl border border-eswen-lavender bg-white p-3 flex flex-col">
                    <div className="flex items-start gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-lavender-soft to-eswen-soft-purple text-white shrink-0 overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.nameId} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-eswen-deep leading-tight truncate">{p.nameId}</h4>
                        <p className="text-[11px] text-eswen-soft-purple font-semibold truncate">
                          {p.category.nameId}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="font-bold text-eswen-deep">{p.price}</span>
                          <span>·</span>
                          <span>order {p.order}</span>
                          <span
                            className={cn(
                              "ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold",
                              p.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                            )}
                          >
                            {p.active ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock row — prominent, with quick +/- buttons */}
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-eswen-light-lavender/60 border border-eswen-lavender/60 px-2.5 py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stok</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() => quickStock(p.id, p.stock, -1)}
                          disabled={tick !== 0}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-white border border-eswen-lavender text-eswen-deep hover:bg-eswen-light-lavender disabled:opacity-50"
                          aria-label="Decrease stock"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-extrabold text-eswen-deep">
                          {tick !== 0 ? "…" : stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => quickStock(p.id, p.stock, +1)}
                          disabled={tick !== 0}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-white border border-eswen-lavender text-eswen-deep hover:bg-eswen-light-lavender disabled:opacity-50"
                          aria-label="Increase stock"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <StockBadge stock={stock} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 mt-3">
                      <button
                        onClick={() => setEditingProd(p)}
                        className="inline-flex items-center gap-1 rounded-full bg-eswen-light-lavender text-eswen-deep px-2.5 py-1 text-[11px] font-semibold"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => delProd(p.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-500 px-2.5 py-1 text-[11px] font-semibold"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {editingProd && (
            <ProdEditor
              prod={editingProd === "new" ? EMPTY_PROD : editingProd}
              categories={cats || []}
              onClose={() => setEditingProd(null)}
              onSave={saveProd}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-tab pill button                                                */
/* ------------------------------------------------------------------ */

function SubTabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
        active
          ? "bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft"
          : "text-eswen-deep hover:bg-white/60"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Category editor modal                                              */
/* ------------------------------------------------------------------ */

function CatEditor({
  cat,
  onClose,
  onSave,
}: {
  cat: Cat;
  onClose: () => void;
  onSave: (c: Cat) => void;
}) {
  const [f, setF] = useState<Cat>(cat);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Cat, v: any) => setF((c) => ({ ...c, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(f);
    setSaving(false);
  };
  return (
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center bg-eswen-deep/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e: any) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated overflow-hidden"
      >
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            {cat.id ? "Edit Category" : "New Category"}
          </h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen p-5 space-y-3.5">
          <div className="rounded-xl bg-eswen-light-lavender/60 p-2.5 text-[11px] text-eswen-soft-purple font-semibold flex items-center gap-1.5">
            💡 Cukup input Bahasa Indonesia. English otomatis diterjemahkan saat Save.
          </div>
          <F label="Nama Kategori (ID)">
            <input
              value={f.nameId}
              onChange={(e) => set("nameId", e.target.value)}
              className="ainput"
              placeholder="mis. Batuk Pilek"
              required
            />
          </F>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Order">
              <input
                type="number"
                value={f.order}
                onChange={(e) => set("order", e.target.value)}
                className="ainput"
              />
            </F>
            <F label="Active (show in store)">
              <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-eswen-lavender bg-white px-3 py-2.5 h-[34px]">
                <input
                  type="checkbox"
                  checked={f.active}
                  onChange={(e) => set("active", e.target.checked)}
                  className="h-4 w-4 accent-[#5B3A91]"
                />
                <span className="text-xs font-medium text-eswen-deep">{f.active ? "Active" : "Hidden"}</span>
              </label>
            </F>
          </div>
          <style>{`.ainput{width:100%;border-radius:0.625rem;border:1px solid #E9DDFF;background:#fff;padding:0.45rem 0.65rem;font-size:0.8125rem;color:#5B3A91;outline:none;transition:border-color .15s}.ainput:focus{border-color:#8B5CC7}`}</style>
        </form>
        <div className="shrink-0 border-t border-eswen-lavender bg-white px-5 py-3 flex items-center justify-end gap-2">
          <Button type="button" onClick={onClose} variant="ghost" className="rounded-full h-9 text-eswen-deep">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-5"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{" "}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product editor modal                                              */
/* ------------------------------------------------------------------ */

function ProdEditor({
  prod,
  categories,
  onClose,
  onSave,
}: {
  prod: Prod;
  categories: Cat[];
  onClose: () => void;
  onSave: (p: Prod) => void;
}) {
  const [f, setF] = useState<Prod>(prod);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Prod, v: any) => setF((c) => ({ ...c, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(f);
    setSaving(false);
  };
  return (
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center bg-eswen-deep/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e: any) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated overflow-hidden"
      >
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            {prod.id ? "Edit Product" : "New Product"}
          </h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen p-5 space-y-3.5">
          <div className="rounded-xl bg-eswen-light-lavender/60 p-2.5 text-[11px] text-eswen-soft-purple font-semibold flex items-center gap-1.5">
            💡 Cukup input Bahasa Indonesia. English otomatis diterjemahkan saat Save.
          </div>

          {/* Category dropdown + order */}
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Kategori">
              <select
                value={f.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="ainput"
                required
              >
                <option value="">— Pilih Kategori —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameId}
                  </option>
                ))}
              </select>
            </F>
            <F label="Order">
              <input
                type="number"
                value={f.order}
                onChange={(e) => set("order", e.target.value)}
                className="ainput"
              />
            </F>
          </div>

          {/* Name + price */}
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Nama Produk (ID)">
              <input
                value={f.nameId}
                onChange={(e) => set("nameId", e.target.value)}
                className="ainput"
                placeholder="mis. OBH Combi 100ml"
                required
              />
            </F>
            <F label="Harga">
              <input
                value={f.price}
                onChange={(e) => set("price", e.target.value)}
                className="ainput"
                placeholder="mis. IDR 28.500"
              />
            </F>
          </div>

          {/* Short description */}
          <F label="Deskripsi Singkat (ID)" hint="untuk kartu produk">
            <textarea
              value={f.shortDescId}
              onChange={(e) => set("shortDescId", e.target.value)}
              className="ainput min-h-[60px] resize-y"
              placeholder="Deskripsi singkat untuk kartu produk (maks 2 baris)..."
            />
          </F>

          {/* Image upload */}
          <F label="Gambar Produk">
            <ImageUpload
              value={f.image}
              onChange={(v) => set("image", v)}
              placeholder="/images/..."
              recommendedSize="800×600px (landscape 4:3)"
              previewClass="h-16 w-24"
            />
          </F>

          {/* Stock */}
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Jumlah Stok" hint="0 = Stok Habis, <5 = Stok Menipis">
              <input
                type="number"
                value={f.stock}
                onChange={(e) => set("stock", e.target.value)}
                className="ainput"
                min={0}
              />
            </F>
            <F label="Active (tampilkan di store)">
              <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-eswen-lavender bg-white px-3 py-2.5 h-[34px]">
                <input
                  type="checkbox"
                  checked={f.active}
                  onChange={(e) => set("active", e.target.checked)}
                  className="h-4 w-4 accent-[#5B3A91]"
                />
                <span className="text-xs font-medium text-eswen-deep">
                  {f.active ? "Active" : "Hidden"}
                </span>
              </label>
            </F>
          </div>

          {/* Long-form markdown fields */}
          <F label="Deskripsi Lengkap (ID)" hint="markdown didukung">
            <MarkdownEditor
              value={f.fullDescId}
              onChange={(v) => set("fullDescId", v)}
              minHeight="140px"
              placeholder="Penjelasan medis lengkap produk dalam Bahasa Indonesia..."
              hint="Markdown didukung"
            />
          </F>
          <F label="Dosis (ID)" hint="markdown didukung">
            <MarkdownEditor
              value={f.dosageId}
              onChange={(v) => set("dosageId", v)}
              minHeight="120px"
              placeholder="mis. **Dewasa:** 3x sehari 1 tablet..."
              hint="Gunakan **bold** untuk sub-headers"
            />
          </F>
          <F label="Petunjuk Penggunaan (ID)">
            <textarea
              value={f.usageId}
              onChange={(e) => set("usageId", e.target.value)}
              className="ainput min-h-[60px] resize-y"
              placeholder="Petunjuk penggunaan..."
            />
          </F>
          <F label="Perhatian (ID)" hint="markdown didukung">
            <MarkdownEditor
              value={f.precautionsId}
              onChange={(v) => set("precautionsId", v)}
              minHeight="120px"
              placeholder="Peringatan, interaksi, kategori kehamilan..."
              hint="Markdown didukung"
            />
          </F>

          <style>{`.ainput{width:100%;border-radius:0.625rem;border:1px solid #E9DDFF;background:#fff;padding:0.45rem 0.65rem;font-size:0.8125rem;color:#5B3A91;outline:none;transition:border-color .15s}.ainput:focus{border-color:#8B5CC7}`}</style>
        </form>
        <div className="shrink-0 border-t border-eswen-lavender bg-white px-5 py-3 flex items-center justify-end gap-2">
          <Button type="button" onClick={onClose} variant="ghost" className="rounded-full h-9 text-eswen-deep">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-5"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{" "}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable label wrapper                                            */
/* ------------------------------------------------------------------ */

function F({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-between">
        <span>{label}</span>
        {hint && (
          <span className="text-[9px] font-normal normal-case text-muted-foreground/60">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}
