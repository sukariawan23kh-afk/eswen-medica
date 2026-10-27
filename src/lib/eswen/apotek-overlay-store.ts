import { create } from "zustand";

/**
 * Global UI state for the Apotek e-commerce overlay.
 *
 * The overlay itself is rendered once at the page level (in page.tsx) and
 * reads its `open` / `onClose` props from this store. Any component — the
 * navbar's "Apotek" link, the apotek-section's "Lihat Semua Produk" button,
 * a hero CTA, etc. — can open the overlay by calling `openStore()`.
 */
type ApotekOverlayState = {
  open: boolean;
  openStore: () => void;
  closeStore: () => void;
};

export const useApotekOverlay = create<ApotekOverlayState>((set) => ({
  open: false,
  openStore: () => set({ open: true }),
  closeStore: () => set({ open: false }),
}));
