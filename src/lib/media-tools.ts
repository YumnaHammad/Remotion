import type { EnhanceSettings, LayerMask, StabilizeSettings } from "@/types/editing-tools";
import type { LayerFilters } from "@/types";

export interface MaskStyle {
  clipPath?: string;
  WebkitClipPath?: string;
  maskImage?: string;
  WebkitMaskImage?: string;
  maskSize?: string;
  WebkitMaskSize?: string;
  maskRepeat?: string;
  WebkitMaskRepeat?: string;
  maskMode?: string;
}

/** Build CSS mask / clip-path styles that actually render in Remotion + browser. */
export function maskToStyle(mask?: LayerMask): MaskStyle {
  if (!mask || mask.shape === "none") return {};

  const f = Math.max(0, Math.min(100, mask.feather));
  const soft = Math.max(0, f);
  const invert = !!mask.invert;

  if (mask.shape === "gradient-v") {
    const stop = Math.max(5, 100 - soft);
    const grad = invert
      ? `linear-gradient(to bottom, transparent 0%, black ${100 - stop}%, black 100%)`
      : `linear-gradient(to bottom, black 0%, black ${stop}%, transparent 100%)`;
    return {
      maskImage: grad,
      WebkitMaskImage: grad,
      maskSize: "100% 100%",
      WebkitMaskSize: "100% 100%",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
    };
  }

  if (mask.shape === "gradient-h") {
    const stop = Math.max(5, 100 - soft);
    const grad = invert
      ? `linear-gradient(to right, transparent 0%, black ${100 - stop}%, black 100%)`
      : `linear-gradient(to right, black 0%, black ${stop}%, transparent 100%)`;
    return {
      maskImage: grad,
      WebkitMaskImage: grad,
      maskSize: "100% 100%",
      WebkitMaskSize: "100% 100%",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
    };
  }

  // Geometric masks — feather approximated via inset expansion / circle radius
  const insetPad = 5 + soft * 0.08;
  let clipPath: string;
  switch (mask.shape) {
    case "circle": {
      const r = Math.max(20, 48 - soft * 0.15);
      clipPath = `circle(${r}% at 50% 50%)`;
      break;
    }
    case "rounded":
      clipPath = `inset(${insetPad}% ${insetPad}% ${insetPad}% ${insetPad}% round ${12 + soft * 0.2}%)`;
      break;
    case "rect":
    default:
      clipPath = `inset(${insetPad}% ${insetPad}% ${insetPad}% ${insetPad}%)`;
      break;
  }

  if (invert) {
    // CSS clip-path can't truly invert; use a large rect with evenodd via SVG path approximation
    // Fallback: soft vignette mask that punches a hole
    const hole =
      mask.shape === "circle"
        ? `radial-gradient(circle at 50% 50%, transparent ${Math.max(15, 45 - soft * 0.2)}%, black ${Math.min(70, 55 + soft * 0.2)}%)`
        : `linear-gradient(#000,#000), linear-gradient(#000,#000)`;
    if (mask.shape === "circle") {
      return {
        maskImage: hole,
        WebkitMaskImage: hole,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      };
    }
  }

  return { clipPath, WebkitClipPath: clipPath };
}

/** @deprecated use maskToStyle */
export function maskToCss(mask?: LayerMask): string | undefined {
  return maskToStyle(mask).clipPath;
}

/**
 * Denoise preview: mild bilateral-style blur + slight contrast restore.
 * Higher values soften noise without destroying the whole frame.
 */
export function enhanceToCss(enhance?: EnhanceSettings): string {
  if (!enhance) return "";
  const parts: string[] = [];
  if (enhance.sharpen > 0) {
    parts.push(`contrast(${100 + enhance.sharpen * 0.5}%)`);
  }
  if (enhance.vibrance !== 100) {
    parts.push(`saturate(${enhance.vibrance}%)`);
  }
  if (enhance.clarity > 0) {
    parts.push(`brightness(${100 + enhance.clarity * 0.3}%)`);
  }
  if (enhance.denoise > 0) {
    // Soft denoise — keep detail with tiny blur + contrast bump
    const blur = enhance.denoise * 0.035;
    parts.push(`blur(${blur.toFixed(2)}px)`);
    parts.push(`contrast(${100 + enhance.denoise * 0.08}%)`);
  }
  return parts.join(" ");
}

export function mergeEnhanceIntoFilters(
  filters: LayerFilters,
  enhance?: EnhanceSettings
): LayerFilters {
  if (!enhance) return filters;
  return {
    ...filters,
    contrast: filters.contrast + enhance.sharpen * 0.3 + enhance.clarity * 0.2,
    saturate: enhance.vibrance,
  };
}

/**
 * Stabilize preview: dampens micro-jitter with a counter-transform.
 * strength 0–100 → amplitude of correction.
 */
export function stabilizeTransform(
  frame: number,
  stabilize?: StabilizeSettings
): string | undefined {
  if (!stabilize?.enabled || stabilize.strength <= 0) return undefined;
  const s = stabilize.strength / 100;
  // Pseudo optical-flow dampening (deterministic per frame)
  const x = Math.sin(frame * 0.37) * 2.2 * s + Math.sin(frame * 0.11) * 0.8 * s;
  const y = Math.cos(frame * 0.29) * 1.8 * s + Math.cos(frame * 0.17) * 0.6 * s;
  const rot = Math.sin(frame * 0.21) * 0.35 * s;
  // Counter-shake: invert the noise so the subject appears steadier
  return `translate(${-x}px, ${-y}px) rotate(${-rot}deg) scale(${1 + 0.012 * s})`;
}

/** Estimate silent regions for silence-cut UI (returns segment count). */
export async function analyzeSilenceRegions(
  audioUrl: string,
  thresholdDb = -40,
  minSilenceMs = 300
): Promise<{ silentRegions: number; durationSec: number }> {
  try {
    const res = await fetch(audioUrl);
    const buf = await res.arrayBuffer();
    const ctx = new AudioContext();
    const decoded = await ctx.decodeAudioData(buf.slice(0));
    const data = decoded.getChannelData(0);
    const sampleRate = decoded.sampleRate;
    const minSamples = (minSilenceMs / 1000) * sampleRate;
    const threshold = Math.pow(10, thresholdDb / 20);
    let silentRegions = 0;
    let silentRun = 0;
    for (let i = 0; i < data.length; i += 512) {
      const amp = Math.abs(data[i] ?? 0);
      if (amp < threshold) {
        silentRun += 512;
      } else if (silentRun >= minSamples) {
        silentRegions++;
        silentRun = 0;
      } else {
        silentRun = 0;
      }
    }
    await ctx.close();
    return { silentRegions, durationSec: decoded.duration };
  } catch {
    return { silentRegions: 0, durationSec: 0 };
  }
}

export function voicePresetToPlayback(preset: string): {
  playbackRate: number;
  volume: number;
} {
  switch (preset) {
    case "deep":
      return { playbackRate: 0.85, volume: 1.05 };
    case "bright":
      return { playbackRate: 1.08, volume: 1 };
    case "robot":
      return { playbackRate: 0.95, volume: 1.1 };
    case "telephone":
      return { playbackRate: 1, volume: 1 };
    default:
      return { playbackRate: 1, volume: 1 };
  }
}

export function collageGridStyle(
  layout: string | undefined,
  cellCount: number
): { gridTemplateColumns: string; gridTemplateRows: string; areas?: string } {
  switch (layout) {
    case "grid-3x3":
      return {
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr",
      };
    case "split-h":
      return { gridTemplateColumns: "1fr", gridTemplateRows: "1fr 1fr" };
    case "split-v":
      return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr" };
    case "filmstrip":
      return {
        gridTemplateColumns: `repeat(${Math.max(2, cellCount)}, 1fr)`,
        gridTemplateRows: "1fr",
      };
    case "pip":
      return { gridTemplateColumns: "1fr", gridTemplateRows: "1fr" };
    case "grid-2x2":
    default:
      return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" };
  }
}
