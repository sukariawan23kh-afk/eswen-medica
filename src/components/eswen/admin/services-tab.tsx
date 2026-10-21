"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLucideIcon, VALID_ICON_NAMES } from "@/lib/eswen/icons";
import { ImageUpload } from "@/components/eswen/admin/image-upload";
import { GalleryUpload } from "@/components/eswen/admin/gallery-upload";
import { MarkdownEditor } from "@/components/eswen/admin/markdown-editor";

type Svc = {
  id: string; categoryEn: string; categoryId: string;
  nameEn: string; nameId: string;
  descriptionEn: string; descriptionId: string;
  startingPrice: string; deposit: number;
  icon: string; image: string; brand: string;
  gallery: string[];
  order: number; published: boolean;
};

const EMPTY: Svc = {
  id: "", categoryEn: "", categoryId: "", nameEn: "", nameId: "",
  descriptionEn: "", descriptionId: "", startingPrice: "IDR 350.000",
  deposit: 100000, icon: "Stethoscope", image: "/images/service-medical.png",
  brand: "medical", gallery: [], order: 0, published: true,
};

export function ServicesTab({ showToast }: { showToast: (msg: string) => void }) {
  const [items, setItems] = useState<Svc[] | null>(null);
  const [editing, setEditing] = useState<Svc | "new" | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/services", { cache: "no-store" });
    const d = await r.json();
    if (d?.ok) setItems(d.services);
  }, []);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load(); }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = async (data: Svc) => {
    const isNew = editing === "new";
    const body = { ...data, deposit: Number(data.deposit) || 0, order: Number(data.order) || 0 };
    const r = await fetch(
      isNew ? "/api/admin/services" : `/api/admin/services/${(editing as Svc)?.id}`,
      { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const d = await r.json();
    if (r.ok && d?.ok) { setEditing(null); await load(); showToast("Service saved"); }
    else showToast(d?.error || "Error");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    const r = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (r.ok) { await load(); showToast("Service deleted"); }
  };

  if (!items) return <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-eswen-deep">Services</h3>
        <Button onClick={() => setEditing("new")} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-4 text-sm">
          <Plus className="h-4 w-4" /> Add Service
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No services yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((s) => {
            const Icon = getLucideIcon(s.icon);
            return (
              <div key={s.id} className="rounded-2xl border border-eswen-lavender bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shrink-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-eswen-soft-purple">{s.categoryId}</p>
                    <h4 className="text-sm font-bold text-eswen-deep leading-tight">{s.nameId}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.descriptionId}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                      <span className="font-bold text-eswen-deep">{s.startingPrice}</span>
                      <span>·</span>
                      <span>deposit {s.deposit}</span>
                      <span>·</span>
                      <span>order {s.order}</span>
                      <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold", s.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}>
                        {s.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  <button onClick={() => setEditing(s)} className="inline-flex items-center gap-1 rounded-full bg-eswen-light-lavender text-eswen-deep px-2.5 py-1 text-[11px] font-semibold">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => del(s.id)} className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-500 px-2.5 py-1 text-[11px] font-semibold">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <SvcEditor svc={editing === "new" ? EMPTY : editing} onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function SvcEditor({ svc, onClose, onSave }: { svc: Svc; onClose: () => void; onSave: (s: Svc) => void }) {
  const [f, setF] = useState<Svc>(svc);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Svc, v: any) => setF((c) => ({ ...c, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(f);
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-eswen-deep/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e: any) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white">
          <h3 className="font-bold text-sm">{svc.id ? "Edit Service" : "New Service"}</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen p-5 space-y-3.5">
          <div className="rounded-xl bg-eswen-light-lavender/60 p-2.5 text-[11px] text-eswen-soft-purple font-semibold flex items-center gap-1.5">
            💡 Cukup input Bahasa Indonesia. English otomatis diterjemahkan saat Save.
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Kategori (ID)"><input value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="ainput" placeholder="mis. Layanan Medis Umum" /></F>
            <F label="Nama Layanan (ID)"><input value={f.nameId} onChange={(e) => set("nameId", e.target.value)} className="ainput" placeholder="mis. Konsultasi Medis Umum" /></F>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
              Deskripsi (ID) — <span className="font-normal normal-case text-muted-foreground/70">gunakan toolbar untuk format</span>
            </span>
            <MarkdownEditor
              value={f.descriptionId}
              onChange={(v) => set("descriptionId", v)}
              placeholder="Deskripsi lengkap layanan dalam Bahasa Indonesia..."
              minHeight="160px"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <F label="Starting Price"><input value={f.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} className="ainput" /></F>
            <F label="Deposit (IDR)"><input type="number" value={f.deposit} onChange={(e) => set("deposit", e.target.value)} className="ainput" /></F>
            <F label="Order"><input type="number" value={f.order} onChange={(e) => set("order", e.target.value)} className="ainput" /></F>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Icon (lucide name)" hint={VALID_ICON_NAMES.slice(0, 8).join(", ") + "..."}>
              <input list="icon-list" value={f.icon} onChange={(e) => set("icon", e.target.value)} className="ainput" />
              <datalist id="icon-list">{VALID_ICON_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
            </F>
            <F label="Image URL">
              <ImageUpload
                value={f.image}
                onChange={(v) => set("image", v)}
                placeholder="/images/..."
                recommendedSize="800×600px (landscape 4:3)"
                previewClass="h-16 w-24"
              />
            </F>
          </div>
          <GalleryUpload
            images={f.gallery || []}
            onChange={(urls) => set("gallery", urls)}
          />
          <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-eswen-lavender bg-white px-3 py-2.5">
            <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#5B3A91]" />
            <span className="text-sm font-medium text-eswen-deep">Published (show on website)</span>
          </label>
          <style>{`.ainput{width:100%;border-radius:0.625rem;border:1px solid #E9DDFF;background:#fff;padding:0.45rem 0.65rem;font-size:0.8125rem;color:#5B3A91;outline:none;transition:border-color .15s}.ainput:focus{border-color:#8B5CC7}`}</style>
        </form>
        <div className="shrink-0 border-t border-eswen-lavender bg-white px-5 py-3 flex items-center justify-end gap-2">
          <Button type="button" onClick={onClose} variant="ghost" className="rounded-full h-9 text-eswen-deep">Cancel</Button>
          <Button type="button" onClick={submit} disabled={saving} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[9px] font-normal normal-case text-muted-foreground/60">{hint}</span>}
      </span>
      {children}
    </label>
  );
}