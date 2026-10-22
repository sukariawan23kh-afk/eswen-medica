"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/eswen/admin/image-upload";

type Doc = {
  id: string; name: string; roleEn: string; roleId: string; category: "doctor" | "wellness";
  specialtyEn: string; specialtyId: string; experienceEn: string; experienceId: string;
  languages: string; image: string; initials: string; order: number; published: boolean;
};

const EMPTY: Doc = {
  id: "", name: "", roleEn: "", roleId: "", category: "doctor",
  specialtyEn: "", specialtyId: "", experienceEn: "", experienceId: "",
  languages: "EN, ID", image: "/images/doctor-1.png", initials: "XX",
  order: 0, published: true,
};

export function DoctorsTab({ showToast }: { showToast: (msg: string) => void }) {
  const [items, setItems] = useState<Doc[] | null>(null);
  const [editing, setEditing] = useState<Doc | "new" | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/doctors", { cache: "no-store" });
    const d = await r.json();
    if (d?.ok) setItems(d.doctors);
  }, []);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load(); }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = async (data: Doc) => {
    const isNew = editing === "new";
    const body = { ...data, order: Number(data.order) || 0 };
    const r = await fetch(
      isNew ? "/api/admin/doctors" : `/api/admin/doctors/${(editing as Doc)?.id}`,
      { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const d = await r.json();
    if (r.ok && d?.ok) { setEditing(null); await load(); showToast("Doctor saved"); }
    else showToast(d?.error || "Error");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this professional?")) return;
    const r = await fetch(`/api/admin/doctors/${id}`, { method: "DELETE" });
    if (r.ok) { await load(); showToast("Doctor deleted"); }
  };

  if (!items) return <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-eswen-deep">Doctors & Professionals</h3>
        <Button onClick={() => setEditing("new")} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-4 text-sm">
          <Plus className="h-4 w-4" /> Add Professional
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No professionals yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((d) => (
            <div key={d.id} className="rounded-2xl border border-eswen-lavender bg-white p-3 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-lavender-soft to-eswen-soft-purple text-white font-bold text-sm shrink-0 overflow-hidden">
                {d.image ? <img src={d.image} alt={d.name} className="h-full w-full object-cover" /> : d.initials}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-eswen-deep leading-tight truncate">{d.name}</h4>
                <p className="text-[11px] font-semibold text-eswen-soft-purple">{d.roleId}</p>
                <p className="text-[11px] text-muted-foreground truncate">{d.specialtyId}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                  <span>{d.experienceId}</span><span>·</span><span>{d.category}</span><span>·</span><span>order {d.order}</span>
                  <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold", d.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}>
                    {d.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => setEditing(d)} className="p-1.5 rounded-lg hover:bg-eswen-light-lavender text-eswen-soft-purple"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => del(d.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <DocEditor doc={editing === "new" ? EMPTY : editing} onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function DocEditor({ doc, onClose, onSave }: { doc: Doc; onClose: () => void; onSave: (d: Doc) => void }) {
  const [f, setF] = useState<Doc>(doc);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof Doc, v: any) => setF((c) => ({ ...c, [k]: v }));
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
          <h3 className="font-bold text-sm">{doc.id ? "Edit Professional" : "New Professional"}</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen p-5 space-y-3.5">
          <div className="rounded-xl bg-eswen-light-lavender/60 p-2.5 text-[11px] text-eswen-soft-purple font-semibold flex items-center gap-1.5">
            💡 Cukup input Bahasa Indonesia. English otomatis diterjemahkan saat Save.
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Full Name"><input value={f.name} onChange={(e) => set("name", e.target.value)} className="ainput" /></F>
            <F label="Initials"><input value={f.initials} onChange={(e) => set("initials", e.target.value)} maxLength={4} className="ainput" /></F>
            <F label="Role (ID)"><input value={f.roleId} onChange={(e) => set("roleId", e.target.value)} className="ainput" placeholder="mis. Dokter Umum" /></F>
            <F label="Specialty (ID)"><input value={f.specialtyId} onChange={(e) => set("specialtyId", e.target.value)} className="ainput" placeholder="mis. Penyakit Dalam" /></F>
            <F label="Experience (ID)"><input value={f.experienceId} onChange={(e) => set("experienceId", e.target.value)} className="ainput" placeholder="mis. 12 tahun" /></F>
            <F label="Languages (comma-sep)"><input value={f.languages} onChange={(e) => set("languages", e.target.value)} className="ainput" /></F>
            <F label="Category">
              <select value={f.category} onChange={(e) => set("category", e.target.value)} className="ainput">
                <option value="doctor">doctor</option>
                <option value="wellness">wellness</option>
              </select>
            </F>
            <F label="Order"><input type="number" value={f.order} onChange={(e) => set("order", e.target.value)} className="ainput" /></F>
            <F label="Photo URL">
              <ImageUpload
                value={f.image}
                onChange={(v) => set("image", v)}
                placeholder="/images/..."
                recommendedSize="600×800px (portrait 3:4)"
                previewClass="h-16 w-16"
              />
            </F>
          </div>
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

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}
