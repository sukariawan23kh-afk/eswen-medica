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
  Gift,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/eswen/language-store";
import type { Lang } from "@/lib/eswen/language-store";
import { SiteSettingsTab } from "@/components/eswen/admin/site-settings-tab";
import { ServicesTab } from "@/components/eswen/admin/services-tab";
import { DoctorsTab } from "@/components/eswen/admin/doctors-tab";
import { OffersTab } from "@/components/eswen/admin/offers-tab";
import { ImageUpload } from "@/components/eswen/admin/image-upload";
import { usePayment } from "@/lib/eswen/site-config-context";

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
  paymentNote: string;
  confirmedAt: string;
  createdAt: string;
};

type Notif = {
  kind: "booking" | "article";
  id: string;
  title: string;
  detail: string;
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
  const [tab, setTab] = useState<"settings" | "services" | "doctors" | "articles" | "bookings" | "offers">("settings");
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editing, setEditing] = useState<Article | "new" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // notification bell state
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);

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

  // Notification bell: load the recent activity feed + compute the unread count
  // based on the last time the admin opened the bell (persisted in localStorage).
  const loadNotifs = useCallback(async () => {
    try {
      let since = "";
      try {
        since = window.localStorage.getItem("eswen_admin_last_seen") || "";
      } catch {
        /* ignore */
      }
      const url = since ? `/api/admin/notifications?since=${encodeURIComponent(since)}` : "/api/admin/notifications";
      const r = await fetch(url, { cache: "no-store" });
      const d = await r.json();
      if (d?.ok) {
        setNotifs(d.notifications || []);
        setUnread(Number(d.unread) || 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const markNotifsSeen = useCallback(() => {
    const nowIso = new Date().toISOString();
    try {
      window.localStorage.setItem("eswen_admin_last_seen", nowIso);
    } catch {
      /* ignore */
    }
    setUnread(0);
  }, []);

  // when authed, load the active tab's data (settings/services/doctors tabs
  // load their own data internally, so only articles + bookings are handled here)
  useEffect(() => {
    if (!open || !authed) return;
    if (tab === "articles") loadArticles();
    else if (tab === "bookings") loadBookings();
  }, [open, authed, tab, loadArticles, loadBookings]);

  // notification bell: load on auth, refresh every 30s while authed + open
  useEffect(() => {
    if (!open || !authed) return;
    loadNotifs();
    const timer = setInterval(loadNotifs, 30000);
    return () => clearInterval(timer);
  }, [open, authed, loadNotifs]);

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

  // Manual payment confirmation: admin verified the deposit arrived in the
  // clinic's bank account and is approving the booking → CONFIRMED.
  const approvePayment = async (id: string, note: string) => {
    const r = await fetch(`/api/admin/bookings/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note || undefined }),
    });
    const d = await r.json();
    if (r.ok && d?.ok) {
      const b = d.booking;
      setBookings((cur) =>
        cur.map((x) =>
          x.id === id
            ? {
                ...x,
                status: b.status,
                paymentGateway: b.paymentGateway,
                paymentNote: b.paymentNote ?? "",
                confirmedAt: b.confirmedAt ?? "",
              }
            : x
        )
      );
      showToast("Payment approved — booking CONFIRMED");
    } else {
      showToast(d?.error || "Approve failed");
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
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen((v) => !v);
                  if (!bellOpen) markNotifsSeen();
                }}
                aria-label="Notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold border border-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-11 w-80 max-h-96 overflow-y-auto scrollbar-eswen rounded-2xl bg-white border border-eswen-lavender shadow-eswen-elevated z-50 p-2">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-eswen-lavender/60">
                    <span className="text-xs font-bold text-eswen-deep">Recent activity</span>
                    <button onClick={() => setBellOpen(false)} className="text-muted-foreground hover:text-eswen-deep">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {notifs.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-6">No recent activity.</p>
                  ) : (
                    <ul className="space-y-1">
                      {notifs.map((n) => (
                        <li key={n.kind + "-" + n.id} className="rounded-xl px-2.5 py-2 hover:bg-eswen-light-lavender/60">
                          <div className="flex items-start gap-2">
                            <span
                              className={cn(
                                "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                                n.kind === "booking"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-eswen-light-lavender text-eswen-deep"
                              )}
                            >
                              {n.kind === "booking" ? <CalendarClock className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold text-eswen-deep truncate">{n.title}</p>
                              <p className="text-[10px] text-muted-foreground line-clamp-2">{n.detail}</p>
                              <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
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
              <TabBtn active={tab === "offers"} onClick={() => setTab("offers")} icon={<Gift className="h-4 w-4" />}>
                Offers
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
            {tab === "offers" && <OffersTab showToast={showToast} />}
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
              <BookingsTab T={T} bookings={bookings} onUpdateStatus={updateBookingStatus} onApprove={approvePayment} />
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
function BookingsTab({ T, bookings, onUpdateStatus, onApprove }: any) {
  const payment = usePayment();
  const [approving, setApproving] = useState<Booking | null>(null);
  const [note, setNote] = useState("");
  const [approvingLoading, setApprovingLoading] = useState(false);

  const doApprove = async () => {
    if (!approving) return;
    setApprovingLoading(true);
    await onApprove(approving.id, note);
    setApprovingLoading(false);
    setApproving(null);
    setNote("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-eswen-deep">{T.tabBookings}</h3>
        <span className="text-xs text-muted-foreground">{T.total}: {bookings.length}</span>
      </div>

      {/* Payment-flow guide banner */}
      <div className="mb-4 rounded-2xl border border-eswen-soft-purple/30 bg-eswen-light-lavender/50 p-4 text-xs text-eswen-deep/80 leading-relaxed">
        <p className="font-bold text-eswen-deep mb-1">💳 How payment works (real-world)</p>
        <p>• <strong>Bank Transfer</strong> (manual): the client transfers to <strong>{payment.bankName} — {payment.accountNumber} ({payment.accountHolder})</strong>. You verify the money arrived in your account, then click <strong>"Approve Payment"</strong> below → status becomes CONFIRMED. Edit your bank details in <em>Site Settings → Payment / Bank Account</em>.</p>
        <p className="mt-1">• <strong>Credit Card / QRIS / E-Wallet</strong> (gateway): currently simulated. For real automatic payments, integrate <strong>Midtrans / Xendit / Stripe</strong> (money lands in your account, gateway callback auto-confirms). Requires business registration with the gateway.</p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">{T.noBookings}</p>
      ) : (
        <div className="rounded-2xl border border-eswen-lavender bg-white overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-eswen-light-lavender/50 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colRef}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colService}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colPatient}</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colDeposit}</th>
                <th className="text-left px-3 py-2.5 font-semibold">Payment</th>
                <th className="text-left px-3 py-2.5 font-semibold">{T.colStatus}</th>
                <th className="text-left px-3 py-2.5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-eswen-lavender/60">
              {bookings.map((b: Booking) => (
                <tr key={b.id} className="hover:bg-eswen-light-lavender/30 align-top">
                  <td className="px-3 py-2.5 font-mono text-xs font-bold text-eswen-deep whitespace-nowrap">
                    {b.refCode}
                    <div className="text-[9px] text-muted-foreground font-sans font-normal mt-0.5">{b.bookingDate} {b.bookingTime}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    <div className="font-medium text-eswen-deep">{b.serviceName}</div>
                    <div className="text-[10px]">{b.doctorName}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    <div className="font-medium text-eswen-deep">{b.patientName}</div>
                    <div className="text-[10px] text-muted-foreground">{b.patientPhone}</div>
                    {b.patientNotes && <div className="text-[10px] text-muted-foreground italic mt-1 max-w-[160px]">“{b.patientNotes}”</div>}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-bold text-eswen-deep whitespace-nowrap">{b.depositFormatted}</td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground whitespace-nowrap">
                    {b.paymentMethod || "—"}<br />
                    <span className="text-muted-foreground/70">via {b.paymentGateway || "—"}</span>
                    {b.paymentNote && <div className="mt-0.5 italic text-eswen-soft-purple max-w-[140px]">“{b.paymentNote}”</div>}
                    {b.confirmedAt && <div className="mt-0.5 text-green-600">✓ {new Date(b.confirmedAt).toLocaleString()}</div>}
                  </td>
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
                  <td className="px-3 py-2.5">
                    {(b.status === "WAITING_PAYMENT" || b.status === "PAYMENT_FAILED") && (
                      <button
                        onClick={() => { setApproving(b); setNote(b.paymentNote || ""); }}
                        className="inline-flex items-center gap-1 rounded-full bg-green-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        <Check className="h-3 w-3" /> Approve Payment
                      </button>
                    )}
                    {b.status === "CONFIRMED" && <span className="text-[10px] text-green-600 font-bold">✓ Confirmed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve payment modal */}
      {approving && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-eswen-deep/40 backdrop-blur-sm p-4" onClick={() => setApproving(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white border border-eswen-lavender shadow-eswen-elevated overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Approve Payment — Confirm Deposit Received</h3>
              <button onClick={() => setApproving(null)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/15"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="rounded-xl bg-eswen-light-lavender/50 p-3 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Ref</span><span className="font-mono font-bold text-eswen-deep">{approving.refCode}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium text-eswen-deep">{approving.patientName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium text-eswen-deep text-right max-w-[180px]">{approving.serviceName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">When</span><span className="font-medium text-eswen-deep">{approving.bookingDate} {approving.bookingTime}</span></div>
                <div className="flex justify-between border-t border-eswen-lavender/60 pt-1 mt-1"><span className="text-muted-foreground">Deposit to receive</span><span className="font-bold text-eswen-deep text-sm">{approving.depositFormatted}</span></div>
              </div>
              <div className="rounded-xl border border-eswen-soft-purple/40 p-3 text-[11px]">
                <p className="font-bold text-eswen-deep mb-1">Bank account (where money should arrive):</p>
                <p className="text-muted-foreground">{payment.bankName}</p>
                <p className="font-mono font-bold text-eswen-deep text-base tracking-wider">{payment.accountNumber}</p>
                <p className="text-muted-foreground">{payment.accountHolder}</p>
              </div>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Confirmation note (optional — for audit)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Transfer received 2026-10-02, bank ref TRX12345, amount IDR 250.000"
                  maxLength={500}
                  className="w-full rounded-xl border border-eswen-lavender bg-white px-3 py-2 text-xs text-eswen-deep focus:outline-none focus:border-eswen-soft-purple min-h-[60px] resize-none"
                />
              </label>
              <p className="text-[10px] text-muted-foreground">Clicking confirm sets the booking to <strong>CONFIRMED</strong> and records your note + timestamp. Only do this after verifying the deposit arrived in the clinic account.</p>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" onClick={() => setApproving(null)} variant="ghost" className="rounded-full h-9 text-eswen-deep">Cancel</Button>
                <Button type="button" onClick={doApprove} disabled={approvingLoading} className="rounded-full bg-green-600 hover:bg-green-700 text-white h-9 px-5">
                  {approvingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {approvingLoading ? "Confirming..." : "Confirm Payment Received"}
                </Button>
              </div>
            </div>
          </div>
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
              <ImageUpload
                value={form.imageUrl}
                onChange={(v) => set("imageUrl", v)}
                placeholder="/images/..."
                recommendedSize="800×500px (landscape)"
                previewClass="h-16 w-24"
              />
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
