import type { AspectRatio } from "@/types";

export type RegistryItem = {
  id: string;
  name: string;
  folder: "Main" | "Templates" | "Effects" | "Labs";
  description: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  aspectRatio: AspectRatio;
};

/** Mirrors compositions registered in `src/remotion/Root.tsx`. */
export const COMPOSITION_REGISTRY: RegistryItem[] = [
  {
    id: "Main",
    name: "Main Composition",
    folder: "Main",
    description: "Project-driven Series + Sequence timeline composition",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 300,
    aspectRatio: "16:9",
  },
  {
    id: "YoutubeShort",
    name: "YouTube Short",
    folder: "Templates",
    description: "Vertical kinetic typography hook",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 150,
    aspectRatio: "9:16",
  },
  {
    id: "InstagramReel",
    name: "Instagram Reel",
    folder: "Templates",
    description: "Neon product showcase reel",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 180,
    aspectRatio: "9:16",
  },
  {
    id: "TikTokTrend",
    name: "TikTok Trend",
    folder: "Templates",
    description: "Beat-synced captions + transitions",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 120,
    aspectRatio: "9:16",
  },
  {
    id: "PodcastOpener",
    name: "Podcast Opener",
    folder: "Templates",
    description: "Waveform-driven podcast bump",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
    aspectRatio: "16:9",
  },
  {
    id: "ProductAd",
    name: "Product Ad",
    folder: "Templates",
    description: "Cinematic product reveal",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 240,
    aspectRatio: "16:9",
  },
  {
    id: "ThreeShowcase",
    name: "Three.js Showcase",
    folder: "Effects",
    description: "@remotion/three floating product orbit",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 120,
    aspectRatio: "16:9",
  },
  {
    id: "CaptionDemo",
    name: "Caption Demo",
    folder: "Effects",
    description: "@remotion/captions TikTok-style karaoke",
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 150,
    aspectRatio: "9:16",
  },
  {
    id: "TransitionsShowcase",
    name: "Transitions Showcase",
    folder: "Effects",
    description: "@remotion/transitions gallery",
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 240,
    aspectRatio: "16:9",
  },
  {
    id: "PrimitivesLab",
    name: "Primitives Lab",
    folder: "Labs",
    description: "Sequence, Series, Loop, Freeze, interpolate, spring",
    width: 1280,
    height: 720,
    fps: 30,
    durationInFrames: 120,
    aspectRatio: "16:9",
  },
  {
    id: "AnimationLab",
    name: "Animation Lab",
    folder: "Labs",
    description: "Springs, easing, typewriter, parallax, shake",
    width: 1280,
    height: 720,
    fps: 30,
    durationInFrames: 120,
    aspectRatio: "16:9",
  },
];
