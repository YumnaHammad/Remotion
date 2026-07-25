import { z } from "zod";

/** HTTP(S) URLs or site-relative paths like /generated-assets/... */
const mediaUrl = z.string().min(1);

export const editRecipeSceneSchema = z.object({
  id: z.string(),
  startFrame: z.number().int().min(0),
  durationInFrames: z.number().int().min(15).max(900),
  subtitleText: z.string(),
  stockVideoKeyword: z.string(),
  soundEffect: z.string().optional(),
  animationStyle: z.enum(["fade", "zoom", "neon-glow"]).optional(),
  transition: z.enum(["fade-out", "crossfade"]).optional(),
});

export const editRecipeSchema = z.object({
  title: z.string(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
  fps: z.literal(30).default(30),
  voiceoverText: z.string(),
  backgroundMusicKeyword: z.string().optional(),
  scenes: z.array(editRecipeSceneSchema).min(1).max(30),
});

export const resolvedEditRecipeSceneSchema = editRecipeSceneSchema.extend({
  stockVideoUrl: mediaUrl,
  soundEffectUrl: mediaUrl.optional(),
});

export const resolvedEditRecipeSchema = z.object({
  title: z.string(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
  fps: z.literal(30).default(30),
  voiceoverUrl: mediaUrl,
  backgroundMusicUrl: mediaUrl.optional(),
  captions: z
    .array(
      z.object({
        text: z.string(),
        startMs: z.number(),
        endMs: z.number(),
        timestampMs: z.number(),
        confidence: z.number().nullable().optional(),
      })
    )
    .optional(),
  accent: z.string(),
  brandColor: z.string(),
  fontFamily: z.string().optional(),
  scenes: z.array(resolvedEditRecipeSceneSchema).min(1).max(30),
});

export type EditRecipeSchema = z.infer<typeof editRecipeSchema>;
export type ResolvedEditRecipeSchema = z.infer<typeof resolvedEditRecipeSchema>;

export function sceneListDuration(
  scenes: { startFrame: number; durationInFrames: number }[] | undefined
): number {
  if (!Array.isArray(scenes) || scenes.length === 0) return 30;
  return Math.max(
    30,
    ...scenes.map((s) => s.startFrame + s.durationInFrames)
  );
}
