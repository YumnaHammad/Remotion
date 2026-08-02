import type { CollageLayoutId } from "@/types/editing-tools";
import { LOCAL_STOCK_LIBRARY } from "@/lib/pipeline/local-stock";

export interface StickerItem {
  id: string;
  name: string;
  url: string;
  category: string;
  tags: string[];
}

export interface BrollClip {
  id: string;
  name: string;
  url: string;
  kind: "image" | "video";
  thumbnail?: string;
  durationSec: number;
  tags: string[];
}

export interface PatternPreset {
  id: string;
  name: string;
  type: "dots" | "grid" | "lines" | "waves" | "noise" | "checker" | "diagonal";
  preview: string;
}

export interface EffectPreset {
  id: string;
  name: string;
  description: string;
  filters: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    hueRotate?: number;
    grayscale?: number;
    sepia?: number;
    blur?: number;
  };
}

export interface CollageLayout {
  id: CollageLayoutId;
  name: string;
  cells: number;
  description: string;
}

export const STICKER_LIBRARY: StickerItem[] = [
  { id: "st-fire", name: "Fire", url: "https://media.giphy.com/media/26BRuo6sKon343jTO/giphy.gif", category: "Emoji", tags: ["hot", "trending"] },
  { id: "st-star", name: "Sparkle", url: "https://media.giphy.com/media/l0MYt5jPR6Y5Pc9fG/giphy.gif", category: "Emoji", tags: ["shine"] },
  { id: "st-heart", name: "Hearts", url: "https://media.giphy.com/media/26BRv0WElKRHy4DxS/giphy.gif", category: "Emoji", tags: ["love"] },
  { id: "st-arrow", name: "Arrow", url: "https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif", category: "Arrows", tags: ["point"] },
  { id: "st-check", name: "Check", url: "https://media.giphy.com/media/111ebjYAHFD7m/giphy.gif", category: "UI", tags: ["done"] },
  { id: "st-confetti", name: "Confetti", url: "https://media.giphy.com/media/l0MYC0LajboPxz2qI/giphy.gif", category: "Celebration", tags: ["party"] },
  { id: "st-thumbs", name: "Thumbs up", url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", category: "Emoji", tags: ["approve"] },
  { id: "st-bell", name: "Subscribe", url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif", category: "Social", tags: ["cta"] },
];

/** Editor + Script→Video local B-roll (themed stills, not color bars). */
export const BROLL_LIBRARY: BrollClip[] = LOCAL_STOCK_LIBRARY.map((c) => ({
  id: c.id,
  name: c.name,
  url: c.url,
  kind: c.kind,
  thumbnail: c.url,
  durationSec: c.durationSec,
  tags: c.tags,
}));

export const PATTERN_PRESETS: PatternPreset[] = [
  { id: "pat-dots", name: "Dots", type: "dots", preview: "radial-gradient(circle, #fff2 1px, transparent 1px)" },
  { id: "pat-grid", name: "Grid", type: "grid", preview: "linear-gradient(#fff1 1px, transparent 1px), linear-gradient(90deg, #fff1 1px, transparent 1px)" },
  { id: "pat-lines", name: "Lines", type: "lines", preview: "repeating-linear-gradient(45deg, #fff1, #fff1 2px, transparent 2px, transparent 12px)" },
  { id: "pat-waves", name: "Waves", type: "waves", preview: "repeating-radial-gradient(circle at 0 0, #fff1, transparent 8px)" },
  { id: "pat-noise", name: "Noise", type: "noise", preview: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")" },
  { id: "pat-checker", name: "Checker", type: "checker", preview: "conic-gradient(#fff1 90deg, transparent 90deg 180deg, #fff1 180deg 270deg, transparent 270deg)" },
  { id: "pat-diagonal", name: "Diagonal", type: "diagonal", preview: "repeating-linear-gradient(-45deg, #fff1, #fff1 4px, transparent 4px, transparent 16px)" },
];

export const EFFECT_PRESETS: EffectPreset[] = [
  { id: "fx-cinematic", name: "Cinematic", description: "Film look with lifted shadows", filters: { contrast: 115, saturate: 90, sepia: 12 } },
  { id: "fx-vintage", name: "Vintage", description: "Warm retro tone", filters: { sepia: 45, contrast: 105, saturate: 80 } },
  { id: "fx-neon", name: "Neon", description: "High saturation pop", filters: { saturate: 180, contrast: 120, brightness: 105 } },
  { id: "fx-noir", name: "Noir", description: "Black and white drama", filters: { grayscale: 100, contrast: 130 } },
  { id: "fx-dream", name: "Dream", description: "Soft glow blur", filters: { brightness: 110, saturate: 120, blur: 2 } },
  { id: "fx-cold", name: "Cold", description: "Cool blue tone", filters: { hueRotate: 200, saturate: 85, contrast: 108 } },
  { id: "fx-warm", name: "Warm", description: "Golden hour", filters: { hueRotate: 15, saturate: 115, brightness: 105 } },
  { id: "fx-sharp", name: "Sharp", description: "Crisp detail boost", filters: { contrast: 125, saturate: 110 } },
];

export const COLLAGE_LAYOUTS: CollageLayout[] = [
  { id: "grid-2x2", name: "2×2 Grid", cells: 4, description: "Four equal panels" },
  { id: "grid-3x3", name: "3×3 Grid", cells: 9, description: "Nine photo grid" },
  { id: "split-h", name: "Split horizontal", cells: 2, description: "Top / bottom" },
  { id: "split-v", name: "Split vertical", cells: 2, description: "Left / right" },
  { id: "pip", name: "Picture-in-picture", cells: 2, description: "Main + corner inset" },
  { id: "filmstrip", name: "Film strip", cells: 3, description: "Three horizontal frames" },
];

export const VOICE_EFFECT_PRESETS = [
  { id: "none", label: "Original" },
  { id: "warm", label: "Warm studio" },
  { id: "bright", label: "Bright" },
  { id: "deep", label: "Deep voice" },
  { id: "radio", label: "Radio DJ" },
  { id: "telephone", label: "Telephone" },
  { id: "robot", label: "Robot" },
  { id: "echo", label: "Echo hall" },
] as const;

export const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
] as const;
