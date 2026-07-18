import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrandSettings } from "@/types/video";
import { DEFAULT_BRAND } from "@/utils/brand-defaults";

interface BrandState {
  brand: BrandSettings;
  updateBrand: (patch: Partial<BrandSettings>) => void;
  setLogo: (logoUrl: string) => void;
  resetBrand: () => void;
}

/** Brand kit persisted to localStorage — applied to all generated videos. */
export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      brand: DEFAULT_BRAND,
      updateBrand: (patch) =>
        set((s) => ({
          brand: {
            ...s.brand,
            ...patch,
            colors: patch.colors ? { ...s.brand.colors, ...patch.colors } : s.brand.colors,
          },
        })),
      setLogo: (logoUrl) =>
        set((s) => ({
          brand: { ...s.brand, logoUrl: logoUrl || undefined },
        })),
      resetBrand: () => set({ brand: DEFAULT_BRAND }),
    }),
    { name: "video-brand-kit" }
  )
);
