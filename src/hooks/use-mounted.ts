import * as React from "react";

/**
 * Returns `false` during SSR and the first client render (hydration),
 * then `true` after hydration completes.
 *
 * Uses `useSyncExternalStore` so it is lint-clean (no setState-in-effect)
 * and guarantees the server snapshot matches the first client render,
 * preventing hydration mismatches for components that generate client-only
 * IDs (e.g. Radix Dialog / Sheet `aria-controls`).
 */
const emptySubscribe = () => () => {};

export function useMounted(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
