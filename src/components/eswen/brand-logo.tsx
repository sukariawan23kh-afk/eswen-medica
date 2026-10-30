"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogo, useBrand } from "@/lib/eswen/site-config-context";
import { useLanguage } from "@/lib/eswen/language-store";

/**
 * The clinic logo mark + wordmark. Fully admin-editable:
 * - If `config.logo.url` is set, render that image.
 * - Otherwise, render the default Sparkles mark.
 * - Brand name + tagline come from config.brand (bilingual).
 */
export function BrandLogo({
  className,
  showTagline = true,
  size = "md",
}: {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md";
}) {
  const logo = useLogo();
  const brand = useBrand();
  const { lang } = useLanguage();

  const markSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      {logo.url ? (
        // Custom logo: display as-is, no box/rounded/bg — clearer for JPG/PNG
        <img
          src={logo.url}
          alt={logo.alt}
          className="h-10 sm:h-12 w-auto object-contain max-w-[180px]"
        />
      ) : (
        // Default: Sparkles icon in gradient box (only when no logo set)
        <span className={cn("relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-eswen-deep to-eswen-soft-purple text-white shadow-eswen-soft", markSize)}>
          <Sparkles className={iconSize} strokeWidth={2.2} />
        </span>
      )}
      {showTagline && (
        <span className="flex flex-col leading-none text-left">
          <span className="font-extrabold text-base tracking-tight text-eswen-deep">
            {brand.name}
          </span>
          <span className="text-[10px] tracking-[0.2em] text-muted-foreground font-medium uppercase mt-0.5 hidden sm:block">
            {brand.tagline[lang]}
          </span>
        </span>
      )}
    </span>
  );
}
