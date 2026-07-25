import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { resolvedEditRecipeSceneSchema } from "@/server/edit-recipe-schema";

export const automatedVideoSchema = z.object({
  title: z.string(),
  accent: zColor(),
  brandColor: zColor(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  fontFamily: z.string().optional(),
  voiceoverUrl: z.string().optional(),
  backgroundMusicUrl: z.string().optional(),
  /** When false, hide on-screen captions and skip spoken voiceover. */
  showCaptions: z.boolean().optional(),
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
  scenes: z.array(resolvedEditRecipeSceneSchema).min(1).max(30),
});

export type AutomatedVideoSchemaProps = z.infer<typeof automatedVideoSchema>;

export const DEFAULT_AUTOMATED_VIDEO_PROPS: AutomatedVideoSchemaProps = {
  title: "Script Video",
  accent: "#0b84f3",
  brandColor: "#1e3a5f",
  aspectRatio: "16:9",
  fontFamily: "Inter, system-ui, sans-serif",
  voiceoverUrl: "https://remotion.media/dialogue.wav",
  backgroundMusicUrl: "https://remotion.media/audio.mp3",
  showCaptions: true,
  captions: [
    {
      text: "Your story begins here.",
      startMs: 0,
      endMs: 2500,
      timestampMs: 1250,
      confidence: 1,
    },
  ],
  scenes: [
    {
      id: "scene-1",
      startFrame: 0,
      durationInFrames: 90,
      subtitleText: "Your story begins here.",
      stockVideoKeyword: "city skyline",
      stockVideoUrl:
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=80",
      animationStyle: "fade",
      transition: "fade-out",
    },
  ],
};

export function automatedVideoDuration(
  scenes: { startFrame: number; durationInFrames: number }[] | undefined
): number {
  if (!Array.isArray(scenes) || scenes.length === 0) return 30;
  return Math.max(
    30,
    ...scenes.map((s) => s.startFrame + s.durationInFrames)
  );
}
