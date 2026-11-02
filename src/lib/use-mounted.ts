"use client";

import * as React from "react";

// Client-only detection without setState-in-effect: the server snapshot is
// `false`, and React re-renders with `true` right after hydration.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Client-only mounted flag. Prevents SSR/CSR hydration mismatches on pages
 * that touch date formatting, images, or localStorage-driven sessions.
 * Uses `useSyncExternalStore` (same pattern as the auth gate) so it never
 * calls setState inside an effect.
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}
