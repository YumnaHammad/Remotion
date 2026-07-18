import type { AnimationPreset } from "@/types";

/** Scene types supported by the multi-scene long-form engine. */
export type SceneType =
  | "intro"
  | "content"
  | "stats"
  | "gallery"
  | "quote"
  | "outro";

/** Animation presets available per scene (user-selectable, no code). */
export type SceneAnimationPreset =
  | "fade"
  | "slide"
  | "zoom"
  | "scale"
  | "parallax"
  | "reveal"
  | "card-stack"
  | "split-screen"
  | "timeline"
  | "count-up";

export interface VideoScene {
  id: string;
  type: SceneType;
  title: string;
  subtitle?: string;
  body?: string;
  /** For stats scenes */
  statValue?: string;
  statLabel?: string;
  /** For gallery scenes — image URLs or placeholders */
  images?: string[];
  /** For quote scenes */
  quote?: string;
  author?: string;
  animation: SceneAnimationPreset;
  durationInFrames: number;
  /** CSS color or gradient token */
  background?: string;
}

/** Props for LongFormVideo and DataLongFormVideo compositions. */
export interface SceneVideoProps {
  title: string;
  subtitle: string;
  accent: string;
  brandColor: string;
  fontFamily?: string;
  logoUrl?: string;
  musicUrl?: string;
  scenes: VideoScene[];
}

export type TemplateDifficulty = "beginner" | "intermediate" | "advanced";

export type LongFormCategory =
  | "Business & Analytics"
  | "Social Media"
  | "Marketing"
  | "Corporate"
  | "Data to Video";

/** Extended metadata for premium long-form templates (30s–5min). */
export interface LongFormTemplateMeta {
  longFormCategory: LongFormCategory;
  difficulty: TemplateDifficulty;
  /** Human-readable e.g. "2 min" */
  estimatedDuration: string;
  featured?: boolean;
  trending?: boolean;
  sceneCount: number;
  defaultScenes: Omit<VideoScene, "id">[];
}

export function totalSceneDuration(scenes: VideoScene[]): number {
  return scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
}

export function formatDurationFromFrames(frames: number, fps = 30): string {
  const sec = Math.round(frames / fps);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min} min`;
}

/** Map scene animation preset to timeline AnimationPreset where overlap exists. */
export function toAnimationPreset(preset: SceneAnimationPreset): AnimationPreset {
  const map: Partial<Record<SceneAnimationPreset, AnimationPreset>> = {
    fade: "fade",
    slide: "slide",
    scale: "scale",
    reveal: "reveal",
    "count-up": "count-up",
  };
  return map[preset] ?? "fade";
}
