"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon, X, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  label?: string;
  previewClass?: string;
  recommendedSize?: string;
};

/**
 * ImageUpload — reusable image picker used across admin tabs.
 *
 * Combines:
 *   - a thumbnail preview (shows the current image or a placeholder)
 *   - a URL text input (paste any image path/URL)
 *   - an Upload button (opens a file picker, POSTs to /api/admin/upload,
 *     drops the file into /public/images/uploads/ and returns its URL)
 *   - a Clear button (empties the value)
 *   - an optional "recommended size" badge with a Ruler icon
 */
export function ImageUpload({
  value,
  onChange,
  placeholder = "/images/... or paste URL",
  label,
  previewClass,
  recommendedSize,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (r.ok && d?.ok && d.url) {
        onChange(d.url);
      } else {
        setError(d?.error || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>{label}</span>
          {recommendedSize && (
            <span className="inline-flex items-center gap-1 text-[9px] font-normal normal-case text-muted-foreground/70">
              <Ruler className="h-3 w-3" /> {recommendedSize}
            </span>
          )}
        </span>
      )}
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl border border-eswen-lavender bg-eswen-light-lavender/40 flex items-center justify-center",
            previewClass || "h-16 w-16"
          )}
        >
          {value ? (
             
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
              aria-label="Clear image"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        {/* URL + upload */}
        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="ainput"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full bg-eswen-light-lavender text-eswen-deep px-3 py-1.5 text-[11px] font-semibold hover:bg-eswen-lavender/60 transition-colors disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            {recommendedSize && !label && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
                <Ruler className="h-3 w-3" /> {recommendedSize}
              </span>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
          </div>
          {error && (
            <p className="text-[10px] text-rose-600">{error}</p>
          )}
        </div>
      </div>
      <style>{`.ainput{width:100%;border-radius:0.625rem;border:1px solid #E9DDFF;background:#fff;padding:0.45rem 0.65rem;font-size:0.8125rem;color:#5B3A91;outline:none;transition:border-color .15s}.ainput:focus{border-color:#8B5CC7}`}</style>
    </div>
  );
}
