import type { AspectRatio, ExportQuality } from "@/types";

export const APP_NAME = "Framekit";
export const APP_TAGLINE = "Templates & video automation";

export const ASPECT_PRESETS: Record<
  AspectRatio,
  { width: number; height: number; label: string }
> = {
  "16:9": { width: 1920, height: 1080, label: "Landscape" },
  "9:16": { width: 1080, height: 1920, label: "Vertical" },
  "1:1": { width: 1080, height: 1080, label: "Square" },
  "4:5": { width: 1080, height: 1350, label: "Portrait" },
};

export const QUALITY_SCALE: Record<ExportQuality, number> = {
  "720p": 0.67,
  "1080p": 1,
  "2k": 1.33,
  "4k": 2,
};

export const FPS_OPTIONS = [24, 25, 30, 60] as const;

export const NAV_SECTIONS = [
  {
    label: "Video Studio",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "Home" },
      { href: "/showcase", label: "Template Marketplace", icon: "LayoutTemplate" },
      { href: "/script-to-video", label: "Script to Video", icon: "Sparkles" },
      { href: "/website-to-video", label: "Website to Video", icon: "Globe" },
    ],
  },
  {
    label: "Assets & Brand",
    items: [
      { href: "/brand", label: "Brand Kit", icon: "Palette" },
      { href: "/assets", label: "Media Library", icon: "Image" },
      { href: "/audio", label: "Audio Library", icon: "Music" },
      { href: "/exports", label: "Render Exports", icon: "Download" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/projects", label: "Timeline Projects", icon: "FolderOpen" },
      { href: "/settings", label: "Settings", icon: "Settings" },
    ],
  },
] as const;

export const NAV_ITEMS = NAV_SECTIONS.flatMap(
  (s) => s.items as readonly { href: string; label: string; icon: string }[]
);

export const EDITOR_TABS = [
  {
    id: "assets",
    label: "My files",
    hint: "Upload photos, videos, and music",
    icon: "Folder",
  },
  {
    id: "templates",
    label: "Ready-made",
    hint: "Start from a finished look",
    icon: "LayoutTemplate",
  },
  {
    id: "scenes",
    label: "Chapters",
    hint: "Split your video into parts",
    icon: "Film",
  },
  {
    id: "text",
    label: "Words",
    hint: "Titles, subtitles, and captions",
    icon: "Type",
  },
  {
    id: "shapes",
    label: "Shapes",
    hint: "Circles, stars, arrows, and more",
    icon: "Shapes",
  },
  {
    id: "audio",
    label: "Music",
    hint: "Songs, voice, and sound",
    icon: "Music",
  },
  {
    id: "video",
    label: "Clips",
    hint: "Add video clips to your story",
    icon: "Video",
  },
  {
    id: "broll",
    label: "Extra clips",
    hint: "Supporting footage between main shots",
    icon: "Film",
  },
  {
    id: "stickers",
    label: "Stickers",
    hint: "Fun graphics on top of your video",
    icon: "Sticker",
  },
  {
    id: "patterns",
    label: "Backgrounds",
    hint: "Patterns and textured backdrops",
    icon: "Waves",
  },
  {
    id: "effects",
    label: "Effects",
    hint: "Visual extras and polish",
    icon: "Sparkles",
  },
  {
    id: "collage",
    label: "Collage",
    hint: "Put several photos side by side",
    icon: "LayoutGrid",
  },
  {
    id: "brand",
    label: "Brand",
    hint: "Your colors and logo",
    icon: "Sparkles",
  },
] as const;

export const ANIMATION_PRESETS = [
  "fade",
  "slide",
  "scale",
  "rotation",
  "blur",
  "bounce",
  "typewriter",
  "split-text",
  "count-up",
  "reveal",
  "morph",
  "none",
] as const;

export const TRANSITION_TYPES = [
  "fade",
  "slide",
  "zoom",
  "wipe",
  "blur",
  "camera",
  "flip",
  "cinematic",
  "dissolve",
  "crossfade",
  "push",
  "cube",
  "none",
] as const;

export const SHORTCUTS = [
  { keys: ["⌘", "K"], action: "Command palette" },
  { keys: ["Space"], action: "Play / Pause" },
  { keys: ["⌘", "S"], action: "Save project" },
  { keys: ["⌘", "Z"], action: "Undo" },
  { keys: ["⌘", "⇧", "Z"], action: "Redo" },
  { keys: ["Delete"], action: "Delete layer" },
  { keys: ["←", "→"], action: "Frame step" },
  { keys: ["⌘", "E"], action: "Export" },
] as const;
