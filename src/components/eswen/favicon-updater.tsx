"use client";

import { useEffect } from "react";
import { useLogo } from "@/lib/eswen/site-config-context";

/**
 * FaviconUpdater — dynamically updates the browser tab favicon to match
 * the admin-configured logo from SiteConfig.
 *
 * - If admin sets a logo URL in Site Settings → Logo & Brand → that URL
 *   is used as the favicon (browser tab icon).
 * - If logo URL is empty → the default /logo.svg from layout.tsx metadata
 *   is used (no change).
 *
 * This component renders nothing — it only manipulates the <link rel="icon">
 * tag in <head> via useEffect.
 */
export function FaviconUpdater() {
  const logo = useLogo();

  useEffect(() => {
    if (!logo.url) return; // empty = use default favicon from layout.tsx

    // Find existing favicon link (Next.js sets one via metadata.icons)
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      // Create one if not found
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      document.head.appendChild(link);
    }
    // Update href to the admin-configured logo
    link.href = logo.url;

    // Also update apple-touch-icon if present
    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (appleLink) {
      appleLink.href = logo.url;
    }
  }, [logo.url]);

  return null;
}
