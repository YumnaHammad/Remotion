import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const videoSceneSchema = z.object({
  id: z.string(),
  type: z.enum(["intro", "content", "stats", "gallery", "quote", "outro"]),
  title: z.string(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  statValue: z.string().optional(),
  statLabel: z.string().optional(),
  images: z.array(z.string()).optional(),
  quote: z.string().optional(),
  author: z.string().optional(),
  animation: z.enum([
    "fade",
    "slide",
    "zoom",
    "scale",
    "parallax",
    "reveal",
    "card-stack",
    "split-screen",
    "timeline",
    "count-up",
  ]),
  durationInFrames: z.number().min(30).max(900),
  background: z.string().optional(),
});

export const sceneVideoSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accent: zColor(),
  brandColor: zColor(),
  fontFamily: z.string().optional(),
  logoUrl: z.string().optional(),
  musicUrl: z.string().optional(),
  scenes: z.array(videoSceneSchema).min(1).max(50),
});

export type SceneVideoSchemaProps = z.infer<typeof sceneVideoSchema>;

/** Default scenes for Remotion Studio preview. */
export const DEFAULT_SCENE_VIDEO_PROPS: SceneVideoSchemaProps = {
  title: "Monthly Business Report",
  subtitle: "Q4 Performance Overview",
  accent: "#0b84f3",
  brandColor: "#1e3a5f",
  fontFamily: "Inter, system-ui, sans-serif",
  scenes: [
    {
      id: "intro-1",
      type: "intro",
      title: "Monthly Business Report",
      subtitle: "December 2025",
      animation: "fade",
      durationInFrames: 90,
      background: "gradient-hero",
    },
    {
      id: "stats-1",
      type: "stats",
      title: "Revenue Growth",
      statValue: "+24%",
      statLabel: "Year over year",
      animation: "count-up",
      durationInFrames: 100,
    },
    {
      id: "content-1",
      type: "content",
      title: "Key Highlights",
      body: "New markets opened · Customer retention at 94% · Product launch exceeded targets",
      animation: "slide",
      durationInFrames: 120,
    },
    {
      id: "quote-1",
      type: "quote",
      quote: "Our best quarter yet — the team delivered beyond expectations.",
      author: "CEO, Acme Corp",
      title: "Leadership",
      animation: "reveal",
      durationInFrames: 90,
    },
    {
      id: "outro-1",
      type: "outro",
      title: "Thank You",
      subtitle: "acme.com/report",
      animation: "fade",
      durationInFrames: 90,
    },
  ],
};

/** Sum scene durations for calculateMetadata / export. */
export function sceneListDuration(
  scenes: { durationInFrames: number }[] | undefined
): number {
  if (!Array.isArray(scenes) || scenes.length === 0) return 30;
  return Math.max(30, scenes.reduce((sum, s) => sum + s.durationInFrames, 0));
}
