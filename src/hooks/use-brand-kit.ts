"use client";

import { useBrandStore } from "@/stores/brand-store";

/** Read brand kit and expose apply helper for video props. */
export function useBrandKit() {
  const brand = useBrandStore((s) => s.brand);
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const setLogo = useBrandStore((s) => s.setLogo);
  const resetBrand = useBrandStore((s) => s.resetBrand);

  return { brand, updateBrand, setLogo, resetBrand };
}
