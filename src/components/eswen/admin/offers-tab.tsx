"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, X, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUpload } from "./image-upload";

type Offer = {
  id: string;
  titleEn: string;
  titleId: string;
  descEn: string;
  descId: string;
  offerType: string;
  badge: string;
  imageUrl: string;
  ctaTextEn: string;
  ctaTextId: string;
  ctaLink: string;
  active: boolean;
  priority: number;
  startAt: string;
  endAt: string;
  createdAt: string;
};

const EMPTY: Offer = {
  id: "",
  titleEn: "",
  titleId: "",
  descEn: "",
  descId: "",
  offerType: "weekly",
  badge: "",
  imageUrl: "",
  ctaTextEn: "",
  ctaTextId: "",
  ctaLink: "#booking",
  active: true,
  priority: 0,
  startAt: "",
  endAt: "",
  createdAt: "",
};

const TYPES = ["daily", "weekly", "monthly", "onetime"];

export function OffersTab({ showToast }: { showToast: (msg: string) => void }) {
  const [items, setItems] = useState<Offer[] | null>(null);
  const [editing, setEditing] = useState<Offer | "new" | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/offers", { cache: "no-store" });
    const d = await r.json();
    if (d?.ok) setItems(d.offers);
  }, []);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load();
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = async (data: Offer) => {
    const isNew = editing === "new";
    const body = {
      ...data,
      priority: Number(data.priority) || 0,
      startAt: data.startAt || null,
      endAt: data.endAt || null,
      badge: data.badge || null,
      imageUrl: data.imageUrl || null,
      ctaTextEn: data.ctaTextEn || null,
      ctaTextId: data.ctaTextId || null,
      ctaLink: data.ctaLink || null,
    };
    const r = await fetch(
      isNew ? "/api/admin/offers" : `/api/admin/offers/${(editing as Offer)?.id}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const d = await r.json();
    if (r.ok && d?.ok) {
      setEditing(null);
      await load();
      showToast("Offer saved");
    } else {
      showToast(d?.error || "Error");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    const r = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    if (r.ok) {
      await load();
      showToast("Offer deleted");
    }
  };

  if (!items)
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-eswen-deep flex items-center gap-2">
          <Gift className="h-5 w-5 text-eswen-soft-purple" /> Special Offers
        </h3>
        <Button
          onClick={() => setEditing("new")}
          className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-4 text-sm"
        >
          <Plus className="h-4 w-4" /> Add Offer
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-4 -mt-2">
        Active offers show on the public Promo section and trigger the homepage popup (highest priority first). Toggle the{" "}
        <strong>active</strong> switch off to hide an offer without deleting it.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No offers yet. Click "Add Offer" to create one.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((o) => (
            <div key={o.id} className="rounded-2xl border border-eswen-lavender bg-white overflow-hidden">
              <div className="flex items-start gap-3 p-3">
                <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-eswen-light-lavender flex items-center justify-center">
                  {o.imageUrl ? (
                     
                    <img src={o.imageUrl} alt={o.titleEn} className="h-full w-full object-cover" />
                  ) : (
                    <Gift className="h-5 w-5 text-muted-foreground/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {o.badge && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white px-2 py-0.5 text-[9px] font-bold">
                        {o.badge}
                      </span>
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-eswen-soft-purple">
                      {o.offerType}
                    </span>
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold",
                        o.active ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                      )}
                    >
                      {o.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-eswen-deep leading-tight mt-1 line-clamp-1">{o.titleEn}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{o.descEn}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>priority {o.priority}</span>
                    {o.ctaLink && <span>· → {o.ctaLink}</span>}
                  </div>
                </div>
              </div>
              <div className="flex border-t border-eswen-lavender/60">
                <button
                  onClick={() => setEditing(o)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-2 text-[11px] font-semibold text-eswen-deep hover:bg-eswen-light-lavender transition-colors"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => del(o.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-2 text-[11px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors border-l border-eswen-lavender/60"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <OfferEditor offer={editing === "new" ? EMPTY : editing} onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function OfferEditor({ offer, onClose, onSave }: { offer: Offer; onClose: () => void; onSave: (o: Offer) => void }) {
  const [f, setF] = useState<Offer>(offer);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Offer, v: unknown) => setF((c) => ({ ...c, [k]: v }) as Offer);
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
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated overflow-hidden"
      >
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Gift className="h-4 w-4" /> {offer.id ? "Edit Offer" : "New Offer"}
          </h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen p-5 space-y-3.5">
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Title (EN)">
              <input value={f.titleEn} onChange={(e) => set("titleEn", e.target.value)} className="ainput" />
            </F>
            <F label="Title (ID)">
              <input value={f.titleId} onChange={(e) => set("titleId", e.target.value)} className="ainput" />
            </F>
          </div>
          <F label="Description (EN)">
            <textarea
              value={f.descEn}
              onChange={(e) => set("descEn", e.target.value)}
              className="ainput min-h-[70px] resize-none"
            />
          </F>
          <F label="Description (ID)">
            <textarea
              value={f.descId}
              onChange={(e) => set("descId", e.target.value)}
              className="ainput min-h-[70px] resize-none"
            />
          </F>
          <div className="grid sm:grid-cols-3 gap-3">
            <F label="Offer Type">
              <select value={f.offerType} onChange={(e) => set("offerType", e.target.value)} className="ainput">
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </F>
            <F label="Badge (e.g. 20% OFF)">
              <input value={f.badge} onChange={(e) => set("badge", e.target.value)} maxLength={40} className="ainput" />
            </F>
            <F label="Priority">
              <input
                type="number"
                value={f.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="ainput"
              />
            </F>
          </div>
          <F label="Offer Image">
            <ImageUpload
              value={f.imageUrl}
              onChange={(v) => set("imageUrl", v)}
              placeholder="/images/... or upload"
              recommendedSize="800×500px (landscape)"
              previewClass="h-16 w-24"
            />
          </F>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="CTA Text (EN)">
              <input
                value={f.ctaTextEn}
                onChange={(e) => set("ctaTextEn", e.target.value)}
                placeholder="Book Now"
                maxLength={80}
                className="ainput"
              />
            </F>
            <F label="CTA Text (ID)">
              <input
                value={f.ctaTextId}
                onChange={(e) => set("ctaTextId", e.target.value)}
                placeholder="Booking Sekarang"
                maxLength={80}
                className="ainput"
              />
            </F>
          </div>
          <F label="CTA Link (section anchor or URL)">
            <input
              value={f.ctaLink}
              onChange={(e) => set("ctaLink", e.target.value)}
              placeholder="#booking or #services"
              className="ainput"
            />
          </F>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Start At (optional)">
              <input
                type="datetime-local"
                value={f.startAt ? f.startAt.slice(0, 16) : ""}
                onChange={(e) => set("startAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
                className="ainput"
              />
            </F>
            <F label="End At (optional)">
              <input
                type="datetime-local"
                value={f.endAt ? f.endAt.slice(0, 16) : ""}
                onChange={(e) => set("endAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
                className="ainput"
              />
            </F>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-eswen-lavender bg-white px-3 py-2.5">
            <input
              type="checkbox"
              checked={f.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 accent-[#5B3A91]"
            />
            <span className="text-sm font-medium text-eswen-deep">Active (show on public site + popup)</span>
          </label>
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

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}
