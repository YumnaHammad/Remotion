import type { Caption } from "@remotion/captions";

export type EditRecipeAspectRatio = "16:9" | "9:16" | "1:1";

export type EditRecipeAnimationStyle = "fade" | "zoom" | "neon-glow";

export type EditRecipeTransition = "fade-out" | "crossfade";

/** One scene in the AI-generated edit list (keywords, not URLs). */
export interface EditRecipeScene {
  id: string;
  startFrame: number;
  durationInFrames: number;
  subtitleText: string;
  stockVideoKeyword: string;
  soundEffect?: string;
  animationStyle?: EditRecipeAnimationStyle;
  transition?: EditRecipeTransition;
}

/** Structured edit list produced by the AI breakdown step. */
export interface EditRecipe {
  title: string;
  aspectRatio: EditRecipeAspectRatio;
  fps: 30;
  voiceoverText: string;
  backgroundMusicKeyword?: string;
  backgroundMusicUrl?: string;
  scenes: EditRecipeScene[];
}

/** Scene after asset resolution — URLs ready for Remotion. */
export interface ResolvedEditRecipeScene extends EditRecipeScene {
  stockVideoUrl: string;
  soundEffectUrl?: string;
}

/** Full recipe with all media URLs resolved. */
export interface ResolvedEditRecipe {
  title: string;
  aspectRatio: EditRecipeAspectRatio;
  fps: 30;
  voiceoverUrl: string;
  backgroundMusicUrl?: string;
  captions?: Caption[];
  accent: string;
  brandColor: string;
  fontFamily?: string;
  scenes: ResolvedEditRecipeScene[];
}

/** Props passed to the AutomatedVideo Remotion composition. */
export interface AutomatedVideoProps {
  title: string;
  accent: string;
  brandColor: string;
  aspectRatio?: EditRecipeAspectRatio;
  fontFamily?: string;
  voiceoverUrl?: string;
  backgroundMusicUrl?: string;
  captions?: Caption[];
  scenes: ResolvedEditRecipeScene[];
}

export function editRecipeDuration(recipe: {
  scenes: { startFrame: number; durationInFrames: number }[];
}): number {
  if (!recipe.scenes.length) return 30;
  return Math.max(
    30,
    ...recipe.scenes.map((s) => s.startFrame + s.durationInFrames)
  );
}

export function aspectRatioToDimensions(
  aspectRatio: EditRecipeAspectRatio
): { width: number; height: number } {
  switch (aspectRatio) {
    case "9:16":
      return { width: 1080, height: 1920 };
    case "1:1":
      return { width: 1080, height: 1080 };
    default:
      return { width: 1920, height: 1080 };
  }
}
