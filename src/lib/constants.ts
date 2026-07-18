import type { AspectRatio, ExportQuality } from "@/types";

export const APP_NAME = "Remotion Studio";
export const APP_TAGLINE = "Make videos programmatically";

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
    label: "Create",
    items: [
      { href: "/", label: "Dashboard", icon: "Home" },
      { href: "/projects", label: "Projects", icon: "FolderOpen" },
      { href: "/templates", label: "Templates", icon: "LayoutTemplate" },
    ],
  },
  {
    label: "Studios",
    items: [
      { href: "/storyboard", label: "Storyboard", icon: "Clapperboard" },
      { href: "/compositions", label: "Compositions", icon: "Boxes" },
      { href: "/timeline", label: "Timeline", icon: "ListVideo" },
      { href: "/assets", label: "Assets", icon: "Images" },
      { href: "/audio", label: "Audio", icon: "Music" },
    ],
  },
  {
    label: "Labs",
    items: [
      { href: "/showcase", label: "Showcase", icon: "Sparkles" },
      { href: "/primitives", label: "Primitives", icon: "Layers" },
      { href: "/animations", label: "Animations", icon: "Wand2" },
      { href: "/transitions", label: "Transitions", icon: "ArrowLeftRight" },
      { href: "/captions", label: "Captions", icon: "Captions" },
      { href: "/three", label: "3D Studio", icon: "Box" },
      { href: "/player-lab", label: "Player Lab", icon: "PlayCircle" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/render-center", label: "Render Center", icon: "Server" },
      { href: "/brand", label: "Brand Kit", icon: "Palette" },
      { href: "/team", label: "Team", icon: "Users" },
      { href: "/analytics", label: "Analytics", icon: "BarChart3" },
      { href: "/settings", label: "Settings", icon: "Settings" },
    ],
  },
] as const;

export const NAV_ITEMS = NAV_SECTIONS.flatMap(
  (s) => s.items as readonly { href: string; label: string; icon: string }[]
);

export const EDITOR_TABS = [
  { id: "assets", label: "Assets", icon: "Folder" },
  { id: "templates", label: "Templates", icon: "LayoutTemplate" },
  { id: "scenes", label: "Scenes", icon: "Film" },
  { id: "text", label: "Text", icon: "Type" },
  { id: "shapes", label: "Shapes", icon: "Shapes" },
  { id: "audio", label: "Audio", icon: "Music" },
  { id: "video", label: "Video", icon: "Video" },
  { id: "stickers", label: "Stickers", icon: "Sticker" },
  { id: "brand", label: "Brand", icon: "Sparkles" },
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
