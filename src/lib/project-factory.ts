import type { AspectRatio, Layer, Project, Track } from "@/types";
import { DEFAULT_FILTERS } from "@/types";
import { ASPECT_PRESETS } from "@/lib/constants";

/** Collision-resistant id for client-generated entities. */
export const genId = (prefix = "id") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/** The standard starter tracks every studio project begins with. */
export function defaultTracks(): Track[] {
  return [
    { id: "t-v1", name: "Video 1", kind: "video", locked: false, muted: false, height: 48, volume: 1 },
    { id: "t-tx1", name: "Text 1", kind: "text", locked: false, muted: false, height: 40, volume: 1 },
    { id: "t-a1", name: "Audio 1", kind: "audio", locked: false, muted: false, height: 36, volume: 1 },
  ];
}

export interface BlankProjectOptions {
  name?: string;
  description?: string;
  aspectRatio?: AspectRatio;
  fps?: number;
  durationInFrames?: number;
  background?: string;
  thumbnail?: string;
  tags?: string[];
  /** When true, skip the default solid + title layers. */
  empty?: boolean;
}

/**
 * Create a studio project with one full-duration scene, default tracks, and
 * a visible starter composition (brand solid + title) so the preview is never blank.
 */
export function createBlankProject(opts: BlankProjectOptions = {}): Project {
  const aspectRatio = opts.aspectRatio ?? "16:9";
  const preset = ASPECT_PRESETS[aspectRatio];
  const fps = opts.fps ?? 30;
  const durationInFrames = opts.durationInFrames ?? 150;
  const background = opts.background ?? "#0b0c0f";
  const now = new Date().toISOString();
  const name = opts.name ?? "Untitled Project";

  const layers: Layer[] = opts.empty
    ? []
    : [
        {
          id: genId("l"),
          name: "Brand Color",
          type: "solid",
          trackId: "t-v1",
          startFrame: 0,
          durationInFrames,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 },
          animation: "none",
          animationDuration: 0,
          filters: { ...DEFAULT_FILTERS },
          fill: "#0b84f3",
        },
        makeTextLayer({
          name: "Title",
          text: name === "Untitled Project" ? "Hello" : name,
          startFrame: 0,
          durationInFrames: Math.min(90, durationInFrames),
          animation: "none",
          textStyle: {
            fontFamily: "Inter",
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            align: "center",
            lineHeight: 1.1,
            letterSpacing: -1.5,
          },
        }),
      ];

  return {
    id: genId("proj"),
    name,
    description: opts.description ?? "New Remotion composition",
    thumbnail: opts.thumbnail ?? "gradient-5",
    createdAt: now,
    updatedAt: now,
    status: "draft",
    settings: {
      width: preset.width,
      height: preset.height,
      fps,
      durationInFrames,
      aspectRatio,
    },
    scenes: [
      {
        id: genId("sc"),
        name: "Scene 1",
        startFrame: 0,
        durationInFrames,
        transition: "none",
        transitionDuration: 0,
        background,
      },
    ],
    tracks: defaultTracks(),
    layers,
    masterVolume: 1,
    tags: opts.tags ?? [],
  };
}

/** Convenience builder for a centered headline text layer. */
export function makeTextLayer(
  partial: Partial<Layer> & Pick<Layer, "name" | "text">
): Layer {
  return {
    id: genId("l"),
    type: "text",
    trackId: "t-tx1",
    startFrame: 0,
    durationInFrames: 60,
    transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 },
    animation: "none",
    animationDuration: 18,
    filters: { ...DEFAULT_FILTERS },
    textStyle: {
      fontFamily: "Inter",
      fontSize: 64,
      fontWeight: 800,
      color: "#ffffff",
      align: "center",
      lineHeight: 1.1,
      letterSpacing: -1,
      gradient: "linear-gradient(135deg,#fff,#93c5fd)",
    },
    ...partial,
  };
}
