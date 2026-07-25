/** Unified editing-tool types for timeline + long-form workflows. */

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion";

export type MaskShape = "none" | "circle" | "rect" | "rounded" | "gradient-v" | "gradient-h";

export type BackgroundReplaceMode = "none" | "solid" | "blur" | "image" | "chroma";

export type VoiceEffectPreset =
  | "none"
  | "warm"
  | "bright"
  | "deep"
  | "radio"
  | "telephone"
  | "robot"
  | "echo";

export type PatternType =
  | "dots"
  | "grid"
  | "lines"
  | "waves"
  | "noise"
  | "checker"
  | "diagonal";

export type CollageLayoutId =
  | "grid-2x2"
  | "grid-3x3"
  | "split-h"
  | "split-v"
  | "pip"
  | "filmstrip";

export interface CollageCell {
  src: string;
  fit?: "cover" | "contain" | "fill";
}

export interface LayerMask {
  shape: MaskShape;
  /** Soft edge 0–100 */
  feather: number;
  invert?: boolean;
}

export interface BackgroundReplace {
  mode: BackgroundReplaceMode;
  color?: string;
  imageUrl?: string;
  chromaColor?: string;
  blurAmount?: number;
}

/** Preview + export stabilization strength (0–100). */
export interface StabilizeSettings {
  enabled: boolean;
  strength: number;
}

export interface EnhanceSettings {
  sharpen: number;
  vibrance: number;
  clarity: number;
  denoise: number;
}

export interface VoiceEffects {
  preset: VoiceEffectPreset;
  pitch: number;
  reverb: number;
  echo: number;
}

export interface AudioTools {
  silenceCut: boolean;
  silenceThresholdDb: number;
  minSilenceMs: number;
  denoise: number;
  normalize: boolean;
}

export interface OverlaySettings {
  enabled: boolean;
  color?: string;
  opacity: number;
  gradient?: string;
}

export interface LayerEditingTools {
  reverse?: boolean;
  blendMode?: BlendMode;
  mask?: LayerMask;
  backgroundReplace?: BackgroundReplace;
  enhance?: EnhanceSettings;
  stabilize?: StabilizeSettings;
  voiceEffects?: VoiceEffects;
  audioTools?: AudioTools;
  overlay?: OverlaySettings;
  pattern?: PatternType;
  stickerId?: string;
  brollTag?: string;
  isBroll?: boolean;
}

export interface SceneEditingTools {
  transition?: string;
  blendMode?: BlendMode;
  overlay?: OverlaySettings;
  pattern?: PatternType;
  backgroundReplace?: BackgroundReplace;
  enhance?: EnhanceSettings;
  speed?: number;
  reverse?: boolean;
  voiceEffects?: VoiceEffects;
}

export const DEFAULT_ENHANCE: EnhanceSettings = {
  sharpen: 0,
  vibrance: 100,
  clarity: 0,
  denoise: 0,
};

export const DEFAULT_MASK: LayerMask = {
  shape: "none",
  feather: 0,
};

export const DEFAULT_STABILIZE: StabilizeSettings = {
  enabled: false,
  strength: 40,
};

export const DEFAULT_AUDIO_TOOLS: AudioTools = {
  silenceCut: false,
  silenceThresholdDb: -40,
  minSilenceMs: 300,
  denoise: 0,
  normalize: false,
};

export const DEFAULT_VOICE_EFFECTS: VoiceEffects = {
  preset: "none",
  pitch: 1,
  reverb: 0,
  echo: 0,
};

export const DEFAULT_OVERLAY: OverlaySettings = {
  enabled: false,
  opacity: 0.35,
};

export const EDITING_TOOL_CATEGORIES = [
  {
    id: "audio",
    label: "Audio",
    tools: [
      "silence-cut",
      "denoise",
      "volume",
      "voice-effects",
    ] as const,
  },
  {
    id: "video",
    label: "Video",
    tools: [
      "background-change",
      "b-roll",
      "overlay",
      "masking",
      "stabilize",
      "speed",
      "reverse",
      "enhance",
    ] as const,
  },
  {
    id: "creative",
    label: "Creative",
    tools: [
      "blend",
      "stickers",
      "effects",
      "patterns",
      "animations",
      "collage",
    ] as const,
  },
] as const;

export type EditingToolId =
  | (typeof EDITING_TOOL_CATEGORIES)[number]["tools"][number];
