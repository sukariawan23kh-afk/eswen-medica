"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Save, ChevronDown, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/eswen/admin/image-upload";

type Config = {
  logo: { url: string; alt: string };
  // URL of the image shown in the About section. Empty = use the default
  // /images/clinic-interior.png. Top-level field (not a translation key).
  about_image: string;
  brand: { name: string; tagline: { en: string; id: string } };
  contact: {
    address: string; whatsapp: string; phone: string; email: string;
    hours: { en: string; id: string };
    mapEmbed: string; directions: string;
  };
  social: { instagram: string; facebook: string; tiktok: string };
  payment: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    instructionsEn: string;
    instructionsId: string;
  };
  theme: Record<string, string>;
  translations: { en: Record<string, string>; id: Record<string, string> };
};

const SECTIONS: { key: string; label: string }[] = [
  { key: "logo", label: "Logo & Brand" },
  { key: "hero", label: "Hero" },
  { key: "nav", label: "Navbar" },
  { key: "services", label: "Services Section" },
  { key: "promo", label: "Promo Section" },
  { key: "booking", label: "Smart Booking" },
  { key: "journey", label: "Patient Journey" },
  { key: "doctors", label: "Doctors Section" },
  { key: "about", label: "About" },
  { key: "why", label: "Why Choose Us" },
  { key: "blog", label: "Blog Section" },
  { key: "location", label: "Location" },
  { key: "footer", label: "Footer" },
  { key: "ai", label: "AI Assistant" },
  { key: "bk", label: "Booking Wizard" },
];

function groupKeys(keys: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const k of keys) {
    const prefix = k.split("_")[0];
    (out[prefix] ??= []).push(k);
  }
  return out;
}

/**
 * Friendlier admin-facing labels for the long-form markdown fields in the
 * About group. Falls back to the raw key name (the existing pattern) for
 * any key not listed here — so this is purely a UX polish, not a behavior
 * change.
 */
const LABEL_MAP: Record<string, string> = {
  about_body: "Body Paragraph (ID) — markdown OK",
  about_vision_title: "Vision Title (ID)",
  about_vision_body: "Vision Body (ID) — markdown OK",
  about_mission_title: "Mission Title (ID)",
  about_mission_body: "Mission Body (ID) — markdown OK",
};

/** Long-form fields whose textarea should be taller (multi-paragraph). */
const LONG_FORM_KEYS = new Set([
  "about_body",
  "about_vision_body",
  "about_mission_body",
]);

export function SiteSettingsTab({ showToast }: { showToast: (msg: string) => void }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ logo: true, brand: true, about_image: true, contact: true, social: true, payment: true });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/site-config", { cache: "no-store" });
      const d = await r.json();
      if (d?.ok && d.config) setConfig(d.config);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const r = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const d = await r.json();
      if (r.ok && d?.ok) showToast("Settings saved — reload the public site to see changes");
      else showToast(d?.error || "Save failed");
    } catch {
      showToast("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading settings...
      </div>
    );
  }

  const tKeys = Object.keys(config.translations.en).sort();
  const grouped = groupKeys(tKeys);

  const setT = (lang: "en" | "id", key: string, val: string) =>
    setConfig((c) => c ? { ...c, translations: { ...c.translations, [lang]: { ...c.translations[lang], [key]: val } } } : c);

  const toggle = (g: string) => setOpenGroups((s) => ({ ...s, [g]: !s[g] }));

  return (
    <div className="space-y-5">
      {/* sticky save bar */}
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/90 backdrop-blur border-b border-eswen-lavender flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-eswen-deep">Site Settings</h3>
        <Button onClick={save} disabled={saving} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-9 px-5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save All"}
        </Button>
      </div>

      {/* Indonesian-only hint banner */}
      <div className="rounded-xl bg-eswen-light-lavender/70 border border-eswen-lavender px-4 py-2.5 text-xs text-eswen-deep font-medium flex items-center gap-2">
        <span className="text-base">💡</span>
        <span>Cukup input Bahasa Indonesia. Semua text English otomatis diterjemahkan saat <strong>Save All</strong>.</span>
      </div>

      <p className="text-xs text-muted-foreground -mt-2">Edit logo, brand, all text, contact info, and social links. Click <strong>Save All</strong>, then reload the public site to see changes.</p>

      {/* Logo & Brand */}
      <Card title="Logo & Brand" open={openGroups.logo} onToggle={() => toggle("logo")}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple flex items-center justify-center overflow-hidden shrink-0">
              {config.logo.url ? <img src={config.logo.url} alt={config.logo.alt} className="h-full w-full object-contain p-1" /> : <ImageIcon className="h-6 w-6 text-white" />}
            </div>
            <div className="flex-1">
              <ImageUpload
                value={config.logo.url}
                onChange={(url) => setConfig({ ...config, logo: { ...config.logo, url } })}
                label="Logo Image URL"
                placeholder="/images/logo.png (leave empty for default mark)"
                recommendedSize="200×200px (square, transparent PNG/SVG)"
                previewClass="h-14 w-14"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Upload a transparent PNG/SVG logo, or paste any image URL. Empty = default sparkle icon.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="lbl">Brand Name</label>
              <input value={config.brand.name} onChange={(e) => setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })} className="ainput" />
            </div>
            <div>
              <label className="lbl">Logo Alt Text</label>
              <input value={config.logo.alt} onChange={(e) => setConfig({ ...config, logo: { ...config.logo, alt: e.target.value } })} className="ainput" />
            </div>
          </div>
          <div>
            <label className="lbl">Tagline (ID) <span className="text-[9px] font-normal normal-case text-muted-foreground/70">— EN auto-translated on save</span></label>
            <input value={config.brand.tagline.id} onChange={(e) => setConfig({ ...config, brand: { ...config.brand, tagline: { ...config.brand.tagline, id: e.target.value } } })} className="ainput" placeholder="mis. Kesehatan • Wellness • Kepercayaan" />
          </div>
        </div>
      </Card>

      {/* About Section Image — top-level field, not a translation key */}
      <Card title="About Section Image" open={openGroups.about_image} onToggle={() => toggle("about_image")}>
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">The image shown on the left of the About section. Empty = use the default <code className="text-[10px] bg-eswen-light-lavender/50 px-1 py-0.5 rounded">/images/clinic-interior.png</code>. Recommended aspect ratio ~4:3 (the section displays it at <strong>440px tall</strong> with <code className="text-[10px] bg-eswen-light-lavender/50 px-1 py-0.5 rounded">object-cover</code>).</p>
          <ImageUpload
            value={config.about_image || ""}
            onChange={(url) => setConfig({ ...config, about_image: url })}
            label="About Section Image URL"
            placeholder="/images/clinic-interior.png (leave empty for default)"
            recommendedSize="~800×600px (4:3)"
            previewClass="h-20 w-28"
          />
        </div>
      </Card>

      {/* Contact */}
      <Card title="Contact Information" open={openGroups.contact} onToggle={() => toggle("contact")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="lbl">Address</label>
            <input value={config.contact.address} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, address: e.target.value } })} className="ainput" />
          </div>
          <div><label className="lbl">WhatsApp</label><input value={config.contact.whatsapp} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, whatsapp: e.target.value } })} className="ainput" /></div>
          <div><label className="lbl">Phone</label><input value={config.contact.phone} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, phone: e.target.value } })} className="ainput" /></div>
          <div><label className="lbl">Email</label><input value={config.contact.email} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, email: e.target.value } })} className="ainput" /></div>
          <div><label className="lbl">Hours (ID) <span className="text-[9px] font-normal normal-case text-muted-foreground/70">— EN auto-translated on save</span></label><input value={config.contact.hours.id} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, hours: { ...config.contact.hours, id: e.target.value } } })} className="ainput" placeholder="mis. Senin–Sabtu, 08:00–20:00 WITA" /></div>
          <div className="sm:col-span-2"><label className="lbl">Google Maps Embed URL</label><input value={config.contact.mapEmbed} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, mapEmbed: e.target.value } })} className="ainput" /></div>
          <div className="sm:col-span-2"><label className="lbl">Get Directions URL</label><input value={config.contact.directions} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, directions: e.target.value } })} className="ainput" /></div>
        </div>
      </Card>

      {/* Social */}
      <Card title="Social Media Links" open={openGroups.social} onToggle={() => toggle("social")}>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><label className="lbl">Instagram</label><input value={config.social.instagram} onChange={(e) => setConfig({ ...config, social: { ...config.social, instagram: e.target.value } })} className="ainput" /></div>
          <div><label className="lbl">Facebook</label><input value={config.social.facebook} onChange={(e) => setConfig({ ...config, social: { ...config.social, facebook: e.target.value } })} className="ainput" /></div>
          <div><label className="lbl">TikTok</label><input value={config.social.tiktok} onChange={(e) => setConfig({ ...config, social: { ...config.social, tiktok: e.target.value } })} className="ainput" /></div>
        </div>
      </Card>

      {/* Payment / Bank account */}
      <Card title="Payment / Bank Account (where deposits go)" open={openGroups.payment} onToggle={() => toggle("payment")}>
        <div className="space-y-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">This bank account is shown to clients who choose <strong>Bank Transfer</strong>, and referenced in the admin "Approve Payment" modal. Money from gateway payments (Credit Card/QRIS/E-Wallet) also lands here once a real gateway is connected.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="lbl">Bank Name</label><input value={config.payment.bankName} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, bankName: e.target.value } })} className="ainput" placeholder="e.g. Bank Central Asia (BCA)" /></div>
            <div><label className="lbl">Account Number</label><input value={config.payment.accountNumber} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, accountNumber: e.target.value } })} className="ainput font-mono" placeholder="e.g. 1234567890" /></div>
          </div>
          <div><label className="lbl">Account Holder Name</label><input value={config.payment.accountHolder} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, accountHolder: e.target.value } })} className="ainput" placeholder="e.g. PT Eswen Medica Sehat" /></div>
          <div><label className="lbl">Transfer Instructions (ID) <span className="text-[9px] font-normal normal-case text-muted-foreground/70">— EN auto-translated on save</span></label><textarea value={config.payment.instructionsId} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, instructionsId: e.target.value } })} className="ainput min-h-[50px] resize-none" placeholder="Instruksi transfer bank dalam Bahasa Indonesia..." /></div>
        </div>
      </Card>

      {/* Text content (all translations, grouped) — ID only */}
      <div className="rounded-2xl border border-eswen-lavender bg-white overflow-hidden">
        <div className="px-4 py-3 bg-eswen-light-lavender/50 border-b border-eswen-lavender">
          <h4 className="text-sm font-bold text-eswen-deep">All Text Content (ID only)</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Setiap teks tervisual di website — input Bahasa Indonesia saja. Versi English otomatis dibuat saat Save All.</p>
        </div>
        <div className="divide-y divide-eswen-lavender/40">
          {SECTIONS.map((sec) => {
            const keys = grouped[sec.key];
            if (!keys || keys.length === 0) return null;
            const open = openGroups[sec.key];
            return (
              <div key={sec.key}>
                <button onClick={() => toggle(sec.key)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-eswen-light-lavender/30">
                  <span className="text-sm font-semibold text-eswen-deep">{sec.label} <span className="text-[10px] text-muted-foreground font-normal">({keys.length})</span></span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="px-4 pb-3 space-y-2.5 bg-eswen-gradient-soft/40">
                    {keys.map((k) => (
                      <div key={k}>
                        <label className="lbl-tiny">{LABEL_MAP[k] || k} <span className="text-[9px] normal-case text-muted-foreground/70 font-normal">— EN auto-translated</span></label>
                        <textarea
                          value={config.translations.id[k] ?? ""}
                          onChange={(e) => setT("id", k, e.target.value)}
                          className={cn("ainput resize-y text-xs", LONG_FORM_KEYS.has(k) ? "min-h-[110px]" : "min-h-[40px]")}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* bottom save */}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="rounded-full bg-gradient-to-r from-eswen-deep to-eswen-soft-purple text-white h-10 px-6">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      <style>{`
        .ainput{width:100%;border-radius:0.625rem;border:1px solid #E9DDFF;background:#fff;padding:0.45rem 0.65rem;font-size:0.8125rem;color:#5B3A91;outline:none;transition:border-color .15s}
        .ainput:focus{border-color:#8B5CC7}
        .lbl{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#6B6577;margin-bottom:4px}
        .lbl-tiny{display:block;font-size:9px;font-weight:600;font-family:monospace;color:#8B5CC7;margin-bottom:2px}
      `}</style>
    </div>
  );
}

function Card({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-eswen-lavender bg-white overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 bg-eswen-light-lavender/50 hover:bg-eswen-light-lavender">
        <span className="text-sm font-bold text-eswen-deep">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}
