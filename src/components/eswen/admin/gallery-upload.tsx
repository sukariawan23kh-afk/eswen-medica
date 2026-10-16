"use client";

import { Plus, X } from "lucide-react";
import { ImageUpload } from "@/components/eswen/admin/image-upload";

/**
 * Multi-image gallery uploader. Shows a list of images (each with ImageUpload
 * + remove button) and an "Add Image" button to append more. The parent gets
 * `onChange(string[])` with the full list of image URLs.
 */
export function GalleryUpload({
  images,
  onChange,
  label = "Gallery (Additional Photos)",
  recommendedSize = "800×600px (landscape)",
}: {
  images: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  recommendedSize?: string;
}) {
  const update = (index: number, url: string) => {
    const next = [...images];
    next[index] = url;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...images, ""]);
  };

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
        {label}
      </span>
      {images.length === 0 && (
        <p className="text-[11px] text-muted-foreground italic">
          No additional photos yet. Click "Add Photo" to upload real clinic photos for this service.
        </p>
      )}
      {images.map((url, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <ImageUpload
              value={url}
              onChange={(v) => update(i, v)}
              recommendedSize={recommendedSize}
              previewClass="h-12 w-12 rounded-xl"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 mt-7 inline-flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 h-9 w-9 hover:bg-rose-100 transition-colors"
            title="Remove this photo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-full bg-eswen-light-lavender text-eswen-deep px-3 py-1.5 text-xs font-semibold hover:bg-eswen-lavender transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Photo
      </button>
    </div>
  );
}
