import type { LayerFilters } from "@/types";
import { DEFAULT_FILTERS } from "@/types";

export function filtersToCss(filters?: LayerFilters, extraBlur = 0): string {
  const f = filters ?? DEFAULT_FILTERS;
  const parts = [
    `brightness(${f.brightness}%)`,
    `contrast(${f.contrast}%)`,
    `saturate(${f.saturate}%)`,
    `hue-rotate(${f.hueRotate}deg)`,
    `grayscale(${f.grayscale}%)`,
    `sepia(${f.sepia}%)`,
  ];
  if (extraBlur > 0) parts.push(`blur(${extraBlur}px)`);
  return parts.join(" ");
}
