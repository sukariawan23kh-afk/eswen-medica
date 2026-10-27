"use client";

import { ApotekStore } from "./apotek-store";
import { useApotekOverlay } from "@/lib/eswen/apotek-overlay-store";

/**
 * Page-level wrapper that mounts the Apotek e-commerce overlay exactly once
 * and binds it to the global `apotek-overlay` Zustand store.
 *
 * Both the navbar ("Apotek" link) and the ApotekSection ("Lihat Semua Produk"
 * button) call `useApotekOverlay().openStore()`; this provider reads the
 * resulting `open` flag and forwards it to `<ApotekStore>` along with a
 * `closeStore` callback. Defined as a separate client component so the
 * parent page.tsx can stay a server component.
 */
export function ApotekOverlayProvider() {
  const open = useApotekOverlay((s) => s.open);
  const closeStore = useApotekOverlay((s) => s.closeStore);
  return <ApotekStore open={open} onClose={closeStore} />;
}
