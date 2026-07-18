import type { BrandSettings, VideoTemplateProps } from "@/types/video";

export const DEFAULT_BRAND: BrandSettings = {
  id: "brand-default",
  name: "My Brand",
  colors: {
    primary: "#0b84f3",
    secondary: "#6366f1",
    accent: "#22d3ee",
    background: "#0f1115",
    text: "#ffffff",
  },
  fontFamily: "Inter",
  introAnimation: "fade",
  outroAnimation: "fade",
};

/** Merge saved brand kit into template props for every generated video. */
export function applyBrandToProps(
  props: VideoTemplateProps,
  brand: BrandSettings
): VideoTemplateProps {
  return {
    ...props,
    accent: brand.colors.accent,
    brandColor: brand.colors.primary,
    fontFamily: brand.fontFamily,
    ...(brand.musicUrl ? { musicUrl: brand.musicUrl } : {}),
  };
}
