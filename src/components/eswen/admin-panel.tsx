"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  FileText,
  CalendarClock,
  Loader2,
  Check,
  Settings,
  Stethoscope,
  Users,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/eswen/language-store";
import type { Lang } from "@/lib/eswen/language-store";
import { SiteSettingsTab } from "@/components/eswen/admin/site-settings-tab";
import { ServicesTab } from "@/components/eswen/admin/services-tab";
import { DoctorsTab } from "@/components/eswen/admin/doctors-tab";

/* ---------- types ---------- */
type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  language: string;
  readTime: string;
  published: boolean;
  date: string;
};
type Booking = {
  id: string;
  refCode: string;
  serviceName: string;
  doctorName: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientNotes: string;
  depositFormatted: string;
  paymentMethod: string;
  paymentGateway: string;
  createdAt: string;
};

/* ---------- tiny i18n for the admin (keeps it self-contained) ---------- */
const A = (lang: Lang) =>
  ({
    en: {
      title: "Eswen Medica · Admin",
      subtitle: "Content & Booking Management",
      login: "Admin Login",
      loginDesc: "Enter your password to manage articles and bookings.",
      password: "Password",
      enter: "Enter Dashboard",
      wrong: "Incorrect password.",
      checking: "Checking session...",
      tabArticles: "Articles",
      tabBookings: "Bookings",
      logout: "Logout",
      newArticle: "New Article",
      edit: "Edit",
      delete: "Delete",
      published: "Published",
      draft: "Draft",
      noArticles: "No articles yet. Click \"New Article\" to create one.",
      noBookings: "No bookings yet.",
      colTitle: "Title",
      colCategory: "Category",
      colLang: "Lang",
      colStatus: "Status",
      colDate: "Date",
      colActions: "Actions",
      colRef: "Reference",
      colService: "Service",
      colDoctor: "Doctor",
      colWhen: "When",
      colPatient: "Patient",
      colDeposit: "Deposit",
      colPayment: "Payment",
      editorNew: "New Article",
      editorEdit: "Edit Article",
      fTitle: "Title",
      fSlug: "Slug (url)",
      fSlugHint: "lowercase, hyphens only",
      fExcerpt: "Excerpt",
      fContent: "Content (Markdown)",
      fCategory: "Category",
      fImage: "Image URL",
      fReadTime: "Read Time",
      fLang: "Language",
      fPublished: "Published",
      save: "Save",
      cancel: "Cancel",
      saving: "Saving...",
      deleteConfirm: "Delete this article?",
      statusSaved: "Status updated",
      articleSaved: "Article saved",
      articleDeleted: "Article deleted",
      publishedToggle: "Show on website",
      viewSite: "View Site",
      total: "Total",
    },
    id: {
      title: "Eswen Medica · Admin",
      subtitle: "Manajemen Konten & Booking",
      login: "Login Admin",
      loginDesc: "Masukkan kata sandi untuk mengelola artikel dan booking.",
      password: "Kata Sandi",
      enter: "Masuk Dashboard",
      wrong: "Kata sandi salah.",
      checking: "Memeriksa sesi...",
      tabArticles: "Artikel",
      tabBookings: "Booking",
      logout: "Keluar",
      newArticle: "Artikel Baru",
      edit: "Edit",
      delete: "Hapus",
      published: "Dipublikasi",
      draft: "Draf",
      noArticles: "Belum ada artikel. Klik \"Artikel Baru\" untuk membuat.",
      noBookings: "Belum ada booking.",
      colTitle: "Judul",
      colCategory: "Kategori",
      colLang: "Bahasa",
      colStatus: "Status",
      colDate: "Tanggal",
      colActions: "Aksi",
      colRef: "Referensi",
      colService: "Layanan",
      colDoctor: "Dokter",
      colWhen: "Waktu",
      colPatient: "Pasien",
      colDeposit: "Deposit",
      colPayment: "Pembayaran",
      editorNew: "Artikel Baru",
      editorEdit: "Edit Artikel",
      fTitle: "Judul",
      fSlug: "Slug (url)",
      fSlugHint: "huruf kecil, tanda hubung saja",
      fExcerpt: "Ringkasan",
      fContent: "Konten (Markdown)",
      fCategory: "Kategori",
      fImage: "URL Gambar",
      fReadTime: "Durasi Baca",
      fLang: "Bahasa",
      fPublished: "Dipublikasi",
      save: "Simpan",
      cancel: "Batal",
      saving: "Menyimpan...",
      deleteConfirm: "Hapus artikel ini?",
      statusSaved: "Status diperbarui",
      articleSaved: "Artikel disimpan",
      articleDeleted: "Artikel dihapus",
      publishedToggle: "Tampilkan di website",
      viewSite: "Lihat Website",
      total: "Total",
    },
  }[lang]);

const STATUSES = [
  "WAITING_PAYMENT",
  "CONFIRMED",
  "PAYMENT_FAILED",
  "CHECKED IN",
  "IN TREATMENT",
  "COMPLETED",
  "CANCELLED",
  "NO SHOW",
];
const STATUS_COLORS: Record<string, string> = {
  WAITING_PAYMENT: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  PAYMENT_FAILED: "bg-rose-100 text-rose-700",
  "CHECKED IN": "bg-sky-100 text-sky-700",
  "IN TREATMENT": "bg-violet-100 text-violet-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-stone-200 text-stone-600",
  "NO SHOW": "bg-stone-100 text-stone-500",
};

export function AdminPanel() {
  const { lang } = useLanguage();
  const T = A(lang);
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null); // null = checking
  const [tab, setTab] = useState<"settings" | "services" | "doctors" | "articles" | "bookings">("settings");
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // login form
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // open the panel when the URL hash is #admin
  useEffect(() => {
    const check = () => setOpen(window.location.hash.replace("#", "").toLowerCase() === "admin");
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  // check session whenever the panel opens
  useEffect(() => {
    if (!open) return;
    setAuthed(null);
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAuthed(!!d?.authed))
      .catch(() => setAuthed(false));
  }, [open]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const loadArticles = useCallback(async () => {
    const r = await fetch("/api/admin/articles", { cache: "no-store" });
    const d = await r.json();
    if (d?.ok) setArticles(d.articles);
  }, []);

  const loadBookings = useCallback(async () => {
    const r = await fetch("/api/admin/bookings", { cache: "no-store" });
    const d = await r.json();
    if (d?.ok) setBookings(d.bookings);
  }, []);

  // when authed, load the active tab's data (settings/services/doctors tabs
  // load their own data internally, so only articles + bookings are handled here)
  useEffect(() => {
    if (!open || !authed) return;
    if (tab === "articles") loadArticles();
    else if (tab === "bookings") loadBookings();
  }, [open, authed, tab, loadArticles, loadBookings]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const d = await r.json();
      if (r.ok && d?.ok) {
        setAuthed(true);
        setPw("");
      } else {
        setLoginErr(d?.error || T.wrong);
      }
    } catch {
      setLoginErr(T.wrong);
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setArticles([]);
    setBookings([]);
  };

  const close = () => {
    setOpen(false);
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const saveArticle = async (data: Partial<Article> & { title: string; slug: string; excerpt: string }) => {
    const isNew = editing === "new";
    const r = await fetch(
      isNew ? "/api/admin/articles" : `/api/admin/articles/${(editing as Article)?.id}`,
      {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    const d = await r.json();
    if (r.ok && d?.ok) {
      setEditing(null);
      await loadArticles();
      showToast(T.articleSaved);
    } else {
      showToast(d?.error || "Error");
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm(T.deleteConfirm)) return;
    const r = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    const d = await r.json();
    if (r.ok && d?.ok) {
      await loadArticles();
      showToast(T.articleDeleted);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const r = await fetch(`/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const d = await r.json();
    if (r.ok && d?.ok) {
      setBookings((cur) => cur.map((b) => (b.id === id ? { ...b, status } : b)));
      showToast(T.statusSaved);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-eswen-gradient-soft">
      {/* top bar */}
      <header className="shrink-0 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-eswen-soft">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur shrink-0">
            <Lock className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{T.title}</p>
            <p className="text-[11px] text-white/80 truncate">{T.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {authed && (
            <button
              onClick={logout}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> {T.logout}
            </button>
          )}
          <button
            onClick={close}
            className="inline-flex sm:hidden items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold"
          >
            <X className="h-3.5 w-3.5" /> {T.viewSite}
          </button>
          <button
            onClick={close}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15 transition-colors"
            aria-label={T.viewSite}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* body */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen">
        {authed === null ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {T.checking}
          </div>
        ) : !authed ? (
          <LoginScreen
            T={T}
            pw={pw}
            setPw={setPw}
            loginErr={loginErr}
            loginLoading={loginLoading}
            onLogin={login}
          />
        ) : (
          <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {/* tabs */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <TabBtn active={tab === "settings"} onClick={() => setTab("settings")} icon={<Settings className="h-4 w-4" />}>
                Site Settings
              </TabBtn>
              <TabBtn active={tab === "services"} onClick={() => setTab("services")} icon={<Stethoscope className="h-4 w-4" />}>
                Services
              </TabBtn>
              <TabBtn active={tab === "doctors"} onClick={() => setTab("doctors")} icon={<Users className="h-4 w-4" />}>
                Doctors
              </TabBtn>
              <TabBtn active={tab === "articles"} onClick={() => setTab("articles")} icon={<FileText className="h-4 w-4" />}>
                {T.tabArticles}
                <span className="ml-1.5 rounded-full bg-eswen-light-lavender text-eswen-deep text-[10px] font-bold px-1.5 py-0.5">
                  {articles.length}
                </span>
              </TabBtn>
              <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")} icon={<CalendarClock className="h-4 w-4" />}>
                {T.tabBookings}
                <span className="ml-1.5 rounded-full bg-eswen-light-lavender text-eswen-deep text-[10px] font-bold px-1.5 py-0.5">
                  {bookings.length}
                </span>
              </TabBtn>
            </div>

            {tab === "settings" && <SiteSettingsTab showToast={showToast} />}
            {tab === "services" && <ServicesTab showToast={showToast} />}
            {tab === "doctors" && <DoctorsTab showToast={showToast} />}
            {tab === "articles" && (
              <ArticlesTab
                T={T}
                articles={articles}
                onNew={() => setEditing("new")}
                onEdit={(a) => setEditing(a)}
                onDelete={deleteArticle}
              />
            )}
            {tab === "bookings" && (
              <BookingsTab T={T} bookings={bookings} onUpdateStatus={updateBookingStatus} />
            )}
          </div>
        )}
      </div>

      {/* mobile logout */}
      {authed && (
        <div className="sm:hidden shrink-0 border-t border-eswen-lavender bg-white p-3">
          <Button onClick={logout} variant="outline" className="w-full rounded-full h-10 border-eswen-lavender text-eswen-deep">
            <LogOut className="h-4 w-4" /> {T.logout}
          </Button>
        </div>
      )}

      {/* article editor modal */}
      <AnimatePresence>
        {editing && (
          <ArticleEditor
            T={T}
            article={editing === "new" ? null : (editing as Article)}
            onClose={() => setEditing(null)}
            onSave={saveArticle}
          />
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] rounded-full bg-eswen-deep text-white px-4 py-2 text-xs font-semibold shadow-eswen-card flex items-center gap-2"
          >
            <Check className="h-3.5 w-3.5" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- login ---------- */
function LoginScreen({ T, pw, setPw, loginErr, loginLoading, onLogin }: any) {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl bg-white border border-eswen-lavender shadow-eswen-card p-7"
      >
        <div className="flex flex-col items-center text-center mb-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft mb-3">
            <Lock className="h-7 w-7" />
          </span>
          <h2 className="text-xl font-extrabold text-eswen-deep">{T.login}</h2>
          <p className="text-xs text-muted-foreground mt-1">{T.loginDesc}</p>
        </div>
        <form onSubmit={onLogin} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e: any) => setPw(e.target.value)}
            placeholder={T.password}
            className="w-full rounded-xl border border-eswen-lavender bg-white px-4 py-2.5 text-sm text-eswen-deep focus:outline-none focus:border-eswen-soft-purple"
          />
          {loginErr && (
            <p className="text-xs text-rose-600 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> {loginErr}
            </p>
          )}
          <Button
            type="submit"
            disabled={loginLoading || !pw}
            className="w-full rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-11"
          >
            {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {T.enter}
          </Button>
        </form>
        <p className="mt-4 text-[10px] text-center text-muted-foreground/70">
          Demo password: <code className="font-mono">eswen2026</code>
        </p>
      </motion.div>
    </div>
  );
}

/* ---------- tab button ---------- */
function TabBtn({ active, onClick, icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft"
          : "bg-white border border-eswen-lavender text-eswen-deep hover:bg-eswen-light-lavender"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------- articles tab ---------- */
function ArticlesTab({ T, articles, onNew, onEdit, onDelete }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-eswen-deep">{T.tabArticles}</h3>
        <Button onClick={onNew} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-4 text-sm">
          <Plus className="h-4 w-4" /> {T.newArticle}
        </Button>
      </div>
      {articles.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">{T.noArticles}</p>
      ) : (
        <div className="rounded-2xl border border-eswen-lavender bg-white overflow-hidden">
          {/* desktop table */}
          <table className="hidden sm:table w-full text-sm">
            <thead className="bg-eswen-light-lavender/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">{T.colTitle}</th>
                <th className="text-left px-4 py-2.5 font-semibold">{T.colCategory}</th>
                <th className="text-left px-4 py-2.5 font-semibold">{T.colLang}</th>
                <th className="text-left px-4 py-2.5 font-semibold">{T.colStatus}</th>
                <th className="text-left px-4 py-2.5 font-semibold">{T.colDate}</th>
                <th className="text-right px-4 py-2.5 font-semibold">{T.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eswen-lavender/60">
              {articles.map((a: Article) => (
                <tr key={a.id} className="hover:bg-eswen-light-lavender/30">
                  <td className="px-4 py-3 font-medium text-eswen-deep max-w-xs truncate">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{a.category}</td>
                  <td className="px-4 py-3 text-xs uppercase text-muted-foreground">{a.language}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", a.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}>
                      {a.published ? T.published : T.draft}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => onEdit(a)} className="p-1.5 rounded-lg hover:bg-eswen-light-lavender text-eswen-soft-purple" aria-label={T.edit}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => onDelete(a.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500" aria-label={T.delete}>
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
            {articles.map((a: Article) => (
              <div key={a.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-eswen-deep text-sm leading-snug">{a.title}</p>
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold shrink-0", a.published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500")}>
                    {a.published ? T.published : T.draft}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{a.category} · {a.language.toUpperCase()} · {a.date}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => onEdit(a)} className="inline-flex items-center gap-1 rounded-full bg-eswen-light-lavender text-eswen-deep px-2.5 py-1 text-[11px] font-semibold">
                    <Pencil className="h-3 w-3" /> {T.edit}
                  </button>
                  <button onClick={() => onDelete(a.id)} className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-500 px-2.5 py-1 text-[11px] font-semibold">
                    <Trash2 className="h-3 w-3" /> {T.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- bookings tab ---------- */
function BookingsTab({ T, bookings, onUpdateStatus }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-eswen-deep">{T.tabBookings}</h3>
        <span className="text-xs text-muted-foreground">{T.total}: {bookings.length}</span>
      </div>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">{T.noBookings}</p>
      ) : (
        <div className="rounded-2xl border border-eswen-lavender bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-eswen-light-lavender/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colRef}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colService}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colDoctor}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colWhen}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colPatient}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colDeposit}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eswen-lavender/60">
              {bookings.map((b: Booking) => (
                <tr key={b.id} className="hover:bg-eswen-light-lavender/30">
                  <td className="px-3 py-2.5 font-mono text-xs font-bold text-eswen-deep">{b.refCode}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{b.serviceName}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{b.doctorName}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{b.bookingDate} {b.bookingTime}</td>
                  <td className="px-3 py-2.5 text-xs">
                    <div className="font-medium text-eswen-deep">{b.patientName}</div>
                    <div className="text-[10px] text-muted-foreground">{b.patientPhone}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-bold text-eswen-deep">{b.depositFormatted}</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={b.status}
                      onChange={(e) => onUpdateStatus(b.id, e.target.value)}
                      className={cn("rounded-full border-0 px-2 py-1 text-[10px] font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-eswen-soft-purple", STATUS_COLORS[b.status] || "bg-stone-100 text-stone-600")}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- article editor ---------- */
function ArticleEditor({ T, article, onClose, onSave }: any) {
  const [form, setForm] = useState({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    category: article?.category ?? "Medical",
    imageUrl: article?.imageUrl ?? "",
    language: article?.language ?? "en",
    readTime: article?.readTime ?? "5 min read",
    published: article?.published ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // auto-generate slug from title when creating new (intentional derived state)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!article) {
      setForm((f) => ({
        ...f,
        slug: f.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 80),
      }));
    }
  }, [form.title]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (form.title.trim().length < 3 || form.excerpt.trim().length < 10 || form.slug.trim().length < 3) {
      setErr("Please fill title, slug, and excerpt.");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[105] flex items-center justify-center bg-eswen-deep/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated overflow-hidden"
      >
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white">
          <h3 className="font-bold text-sm">{article ? T.editorEdit : T.editorNew}</h3>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="flex-1 min-h-0 overflow-y-auto scrollbar-eswen p-5 space-y-3.5">
          <Field label={T.fTitle}>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={200} className="ainput" />
          </Field>
          <Field label={T.fSlug} hint={T.fSlugHint}>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} maxLength={120} className="ainput font-mono text-xs" />
          </Field>
          <Field label={T.fExcerpt}>
            <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} maxLength={500} className="ainput min-h-[60px] resize-none" />
          </Field>
          <Field label={T.fContent}>
            <textarea value={form.content} onChange={(e) => set("content", e.target.value)} maxLength={20000} className="ainput min-h-[120px] resize-y font-mono text-xs" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={T.fCategory}>
              <input value={form.category} onChange={(e) => set("category", e.target.value)} className="ainput" />
            </Field>
            <Field label={T.fReadTime}>
              <input value={form.readTime} onChange={(e) => set("readTime", e.target.value)} className="ainput" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={T.fLang}>
              <select value={form.language} onChange={(e) => set("language", e.target.value)} className="ainput">
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
              </select>
            </Field>
            <Field label={T.fImage}>
              <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="/images/..." className="ainput" />
            </Field>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-eswen-lavender bg-white px-3 py-2.5">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#5B3A91]" />
            <span className="text-sm font-medium text-eswen-deep">{T.publishedToggle}</span>
          </label>
          {err && (
            <p className="text-xs text-rose-600 flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>
          )}
          <style>{`.ainput{width:100%;border-radius:0.75rem;border:1px solid #E9DDFF;background:#fff;padding:0.5rem 0.75rem;font-size:0.875rem;color:#5B3A91;outline:none;transition:border-color .15s}.ainput:focus{border-color:#8B5CC7}`}</style>
        </form>
        <div className="shrink-0 border-t border-eswen-lavender bg-white px-5 py-3 flex items-center justify-end gap-2">
          <Button type="button" onClick={onClose} variant="ghost" className="rounded-full h-9 text-eswen-deep">{T.cancel}</Button>
          <Button type="button" onClick={submit} disabled={saving} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? T.saving : T.save}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[9px] font-normal normal-case tracking-normal text-muted-foreground/60">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
