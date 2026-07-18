import type { BrandSettings } from "@/types/video";
import { DEFAULT_BRAND } from "@/utils/brand-defaults";

type Rgb = [number, number, number];

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function colorDistance(a: Rgb, b: Rgb): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image for color extraction"));
    img.src = src;
  });
}

function pickDistinct(sorted: { rgb: Rgb; count: number }[], minDistance = 36): Rgb[] {
  const picked: Rgb[] = [];
  for (const entry of sorted) {
    if (picked.every((p) => colorDistance(p, entry.rgb) >= minDistance)) {
      picked.push(entry.rgb);
    }
    if (picked.length >= 5) break;
  }
  return picked;
}

/** Sample dominant colors from a logo image and map them to brand kit slots. */
export async function extractColorsFromImage(
  dataUrl: string
): Promise<BrandSettings["colors"]> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const size = 72;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported in this browser");

  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const buckets = new Map<string, { rgb: Rgb; count: number }>();

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = luminance(r, g, b);

    // Skip common logo backdrop pixels (pure white/black)
    if (lum > 248 || lum < 8) continue;

    const qr = Math.round(r / 8) * 8;
    const qg = Math.round(g / 8) * 8;
    const qb = Math.round(b / 8) * 8;
    const key = `${qr},${qg},${qb}`;

    const hit = buckets.get(key);
    if (hit) hit.count += 1;
    else buckets.set(key, { rgb: [qr, qg, qb], count: 1 });
  }

  const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
  const picked = pickDistinct(sorted);

  if (picked.length === 0) {
    return { ...DEFAULT_BRAND.colors };
  }

  const bySat = [...picked].sort(
    (a, b) => saturation(...b) - saturation(...a)
  );
  const byLum = [...picked].sort(
    (a, b) => luminance(...a) - luminance(...b)
  );

  const primary = bySat[0] ?? picked[0];
  const secondary = bySat[1] ?? primary;
  const accent = bySat[2] ?? secondary;

  const darkest = byLum[0];
  const lightest = byLum[byLum.length - 1];

  const bgLum = luminance(...darkest);
  const background =
    bgLum < 60 ? rgbToHex(...darkest) : DEFAULT_BRAND.colors.background;

  const textLum = luminance(...lightest);
  const text =
    textLum > 170 ? rgbToHex(...lightest) : DEFAULT_BRAND.colors.text;

  return {
    primary: rgbToHex(...primary),
    secondary: rgbToHex(...secondary),
    accent: rgbToHex(...accent),
    background,
    text,
  };
}
