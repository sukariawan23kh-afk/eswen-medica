"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/eswen/admin/image-upload";

type Art = {
  id: string;
  titleEn: string; titleId: string;
  slug: string;
  excerptEn: string; excerptId: string;
  contentEn: string; contentId: string;
  categoryEn: string; categoryId: string;
  imageUrl: string;
  readTime: string;
  published: boolean;
  date: string;
};

const EMPTY: Art = {
  id: "",
  titleEn: "", titleId: "",
  slug: "",
  excerptEn: "", excerptId: "",
  contentEn: "", contentId: "",
  categoryEn: "", categoryId: "Medical",
  imageUrl: "/images/blog-1.png",
  readTime: "5 min read",
  published: true,
  date: "",
};

export function ArticlesTab({ showToast }: { showToast: (msg: string) => void }) {
  const [items, setItems] = useState<Art[] | null>(null);
  const [editing, setEditing] = useState<Art | "new" | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/articles", { cache: "no-store" });
    const d = await r.json();
    if (d?.ok) setItems(d.articles);
  }, []);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { load(); }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = async (data: Art) => {
    const isNew = editing === "new";
    const body = { ...data };
    const r = await fetch(
      isNew ? "/api/admin/articles" : `/api/admin/articles/${(editing as Art)?.id}`,
      { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const d = await r.json();
    if (r.ok && d?.ok) { setEditing(null); await load(); showToast("Article saved"); }
    else showToast(d?.error || "Error");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const r = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    if (r.ok) { await load(); showToast("Article deleted"); }
  };

  if (!items) return <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-eswen-deep">Articles</h3>
        <Button onClick={() => setEditing("new")} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-4 text-sm">
          <Plus className="h-4 w-4" /> Add Article
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No articles yet.</p>
      ) : (
        <div className="rounded-2xl border border-eswen-lavender bg-white overflow-hidden">
          {/* desktop table */}
          <table className="hidden sm:table w-full text-sm">
            <thead className="bg-eswen-light-lavender/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Title (ID)</th>
                <th className="text-left px-4 py-2.5 font-semibold">Category</th>
                <th className="text-left px-4 py-2.5 font-semibold">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold">Date</th>
                <th className="text-right px-4 py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eswen-lavender/60">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-eswen-light-lavender/30">
                  <td className="px-4 py-3 font-medium text-eswen-deep max-w-xs truncate">{a.titleId || a.titleEn}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{a.categoryId || a.categoryEn}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", a.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}>
                      {a.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(a)} className="p-1.5 rounded-lg hover:bg-eswen-light-lavender text-eswen-soft-purple" aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => del(a.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500" aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* mobile cards */}
          <div className="sm:hidden divide-y divide-eswen-lavender/60">
            {items.map((a) => (
              <div key={a.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-eswen-deep text-sm leading-snug">{a.titleId || a.titleEn}</p>
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0", a.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}>
                    {a.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{a.categoryId || a.categoryEn} · {a.date}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setEditing(a)} className="inline-flex items-center gap-1 rounded-full bg-eswen-light-lavender text-eswen-deep px-2.5 py-1 text-[11px] font-semibold">
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => del(a.id)} className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-500 px-2.5 py-1 text-[11px] font-semibold">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <ArticleEditor article={editing === "new" ? EMPTY : editing} onClose={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function ArticleEditor({ article, onClose, onSave }: { article: Art; onClose: () => void; onSave: (a: Art) => void }) {
  const [f, setF] = useState<Art>(article);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof Art, v: any) => setF((c) => ({ ...c, [k]: v }));

  // Auto-generate slug from the Indonesian title when creating a new article.
  // (Derived state — eslint disable is intentional here, matching the
  // services-tab pattern for slug auto-gen.)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!article.id) {
      setF((c) => ({
        ...c,
        slug: c.titleId
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 80),
      }));
    }
  }, [f.titleId, article.id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (f.titleId.trim().length < 3 || f.excerptId.trim().length < 10 || f.slug.trim().length < 3) {
      setErr("Please fill Title (ID), Slug, and Excerpt (ID).");
      return;
    }
    setSaving(true);
    await onSave(f);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-eswen-deep/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div onClick={(e: any) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated overflow-hidden">
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white">
          <h3 className="font-bold text-sm">{article.id ? "Edit Article" : "New Article"}</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen p-5 space-y-3.5">
          <div className="rounded-xl bg-eswen-light-lavender/60 p-2.5 text-[11px] text-eswen-soft-purple font-semibold flex items-center gap-1.5">
            💡 Cukup input Bahasa Indonesia. English otomatis diterjemahkan saat Save.
          </div>
          <F label="Judul (ID)">
            <input value={f.titleId} onChange={(e) => set("titleId", e.target.value)} maxLength={200} className="ainput" placeholder="mis. Panduan Kesehatan untuk Ekspatriwa di Bali" />
          </F>
          <F label="Slug" hint="lowercase letters, numbers, hyphens only">
            <input value={f.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} maxLength={120} className="ainput font-mono text-xs" />
          </F>
          <F label="Ringkasan (ID)">
            <textarea value={f.excerptId} onChange={(e) => set("excerptId", e.target.value)} maxLength={500} className="ainput min-h-[60px] resize-none" placeholder="Ringkasan singkat artikel dalam Bahasa Indonesia..." />
          </F>
          <F label="Konten (ID, markdown)">
            <textarea value={f.contentId} onChange={(e) => set("contentId", e.target.value)} maxLength={20000} className="ainput min-h-[140px] resize-y font-mono text-xs" placeholder="# Judul Artikel&#10;&#10;Tulis konten dalam Bahasa Indonesia. Mendukung markdown." />
          </F>
          <div className="grid sm:grid-cols-2 gap-3">
            <F label="Kategori (ID)">
              <input value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} className="ainput" placeholder="mis. Medis" />
            </F>
            <F label="Read Time">
              <input value={f.readTime} onChange={(e) => set("readTime", e.target.value)} className="ainput" placeholder="mis. 5 min read" />
            </F>
          </div>
          <F label="Image URL">
            <ImageUpload
              value={f.imageUrl}
              onChange={(v) => set("imageUrl", v)}
              placeholder="/images/..."
              recommendedSize="800×500px (landscape)"
              previewClass="h-16 w-24"
            />
          </F>
          <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-eswen-lavender bg-white px-3 py-2.5">
            <input type="checkbox" checked={f.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#5B3A91]" />
            <span className="text-sm font-medium text-eswen-deep">Published (show on website)</span>
          </label>
          {err && (
            <p className="text-xs text-rose-600 flex items-center gap-1.5"><span className="font-bold">!</span> {err}</p>
          )}
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
