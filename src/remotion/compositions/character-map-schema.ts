import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import type { CharacterMapVideoProps } from "@/types/feature-stack";

const visemeSchema = z.object({
  value: z.enum(["A", "B", "C", "D", "E", "F", "X"]),
  startMs: z.number(),
  endMs: z.number(),
});

const landmarkSchema = z.object({
  frame: z.number(),
  face: z
    .array(z.object({ x: z.number(), y: z.number(), z: z.number() }))
    .optional(),
  pose: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
        visibility: z.number().optional(),
      })
    )
    .optional(),
  controls: z
    .object({
      mouthOpen: z.number().optional(),
      smile: z.number().optional(),
      browRaise: z.number().optional(),
      headYaw: z.number().optional(),
      headPitch: z.number().optional(),
      armLeft: z.number().optional(),
      armRight: z.number().optional(),
    })
    .optional(),
});

export const characterMapVideoSchema = z.object({
  title: z.string(),
  accent: zColor(),
  brandColor: zColor(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("9:16"),
  fontFamily: z.string().optional(),
  voiceoverUrl: z.string().optional(),
  backgroundMusicUrl: z.string().optional(),
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
  visemes: z.array(visemeSchema).optional(),
  landmarks: z.array(landmarkSchema).optional(),
  route: z.enum(["script", "reference"]).optional(),
  riveSrc: z.string().optional(),
  showMap: z.boolean().optional(),
  showCharacter: z.boolean().optional(),
  mapSeed: z.number().optional(),
  durationHintFrames: z.number().optional(),
  characterLook: z
    .object({
      skin: z.string(),
      shirt: z.string(),
      accent: z.string(),
      hair: z.string(),
      scale: z.number(),
      label: z.string(),
    })
    .optional(),
  mapLook: z
    .object({
      theme: z.string(),
      seed: z.number(),
      sky: z.string(),
      fog: z.string(),
      ground: z.string(),
      road: z.string(),
      palette: z.array(z.string()),
      buildingHeight: z.number(),
      density: z.number(),
      label: z.string(),
    })
    .optional(),
});

export type CharacterMapVideoSchemaProps = z.infer<
  typeof characterMapVideoSchema
>;

export const DEFAULT_CHARACTER_MAP_PROPS: CharacterMapVideoSchemaProps = {
  title: "City Story",
  accent: "#0b84f3",
  brandColor: "#1e3a5f",
  aspectRatio: "9:16",
  fontFamily: "Inter, system-ui, sans-serif",
  voiceoverUrl: "https://remotion.media/dialogue.wav",
  backgroundMusicUrl: "https://remotion.media/audio.mp3",
  showMap: true,
  showCharacter: true,
  mapSeed: 42,
  route: "script",
  captions: [
    {
      text: "Welcome",
      startMs: 0,
      endMs: 800,
      timestampMs: 400,
      confidence: 1,
    },
    {
      text: "to",
      startMs: 800,
      endMs: 1100,
      timestampMs: 950,
      confidence: 1,
    },
    {
      text: "the",
      startMs: 1100,
      endMs: 1400,
      timestampMs: 1250,
      confidence: 1,
    },
    {
      text: "city",
      startMs: 1400,
      endMs: 2200,
      timestampMs: 1800,
      confidence: 1,
    },
  ],
  visemes: [
    { value: "X", startMs: 0, endMs: 100 },
    { value: "D", startMs: 100, endMs: 500 },
    { value: "B", startMs: 500, endMs: 900 },
    { value: "C", startMs: 900, endMs: 1400 },
    { value: "E", startMs: 1400, endMs: 2000 },
    { value: "X", startMs: 2000, endMs: 4000 },
  ],
  durationHintFrames: 150,
};

export function characterMapDuration(
  props: Partial<CharacterMapVideoProps> | undefined
): number {
  if (props?.durationHintFrames && props.durationHintFrames > 0) {
    return props.durationHintFrames;
  }
  let endMs = 4000;
  for (const c of props?.captions ?? []) {
    endMs = Math.max(endMs, c.endMs);
  }
  for (const v of props?.visemes ?? []) {
    endMs = Math.max(endMs, v.endMs);
  }
  return Math.max(90, Math.ceil((endMs / 1000) * 30) + 30);
}
