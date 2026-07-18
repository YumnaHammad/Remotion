import type { SceneAnimationPreset, SceneType, VideoScene } from "@/types/scene-video";
import { genId } from "@/lib/project-factory";

export const SCENE_ANIMATION_PRESETS: {
  id: SceneAnimationPreset;
  label: string;
  description: string;
}[] = [
  { id: "fade", label: "Fade", description: "Smooth opacity transition" },
  { id: "slide", label: "Slide", description: "Slide in from the side" },
  { id: "zoom", label: "Zoom", description: "Zoom into frame" },
  { id: "scale", label: "Scale", description: "Spring scale entrance" },
  { id: "parallax", label: "Parallax", description: "Layered depth motion" },
  { id: "reveal", label: "Reveal", description: "Mask reveal wipe" },
  { id: "card-stack", label: "Card stack", description: "Stacked card carousel" },
  { id: "split-screen", label: "Split screen", description: "Dual panel layout" },
  { id: "timeline", label: "Timeline", description: "Animated timeline rail" },
  { id: "count-up", label: "Number counter", description: "Animated statistics" },
];

export const SCENE_TYPE_LABELS: Record<SceneType, string> = {
  intro: "Intro",
  content: "Content",
  stats: "Statistics",
  gallery: "Gallery",
  quote: "Quote",
  outro: "Outro",
};

export const DEFAULT_SCENE_DURATIONS: Record<SceneType, number> = {
  intro: 90,
  content: 120,
  stats: 100,
  gallery: 150,
  quote: 90,
  outro: 90,
};

export function createEmptyScene(type: SceneType): VideoScene {
  return {
    id: genId("scene"),
    type,
    title: SCENE_TYPE_LABELS[type],
    subtitle: "",
    animation: type === "stats" ? "count-up" : type === "gallery" ? "card-stack" : "fade",
    durationInFrames: DEFAULT_SCENE_DURATIONS[type],
    background: type === "intro" ? "gradient-hero" : undefined,
  };
}

export function duplicateScene(scene: VideoScene): VideoScene {
  return { ...scene, id: genId("scene"), title: `${scene.title} (copy)` };
}

export function scenesWithIds(
  scenes: Omit<VideoScene, "id">[]
): VideoScene[] {
  return scenes.map((s) => ({ ...s, id: genId("scene") }));
}
