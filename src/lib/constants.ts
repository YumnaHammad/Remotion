import type { AspectRatio, ExportQuality } from "@/types";

export const APP_NAME = "Lumen Studio";
export const APP_TAGLINE = "AI Video Creation Platform";

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

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/projects", label: "Projects", icon: "FolderOpen" },
  { href: "/templates", label: "Templates", icon: "LayoutTemplate" },
  { href: "/media", label: "Media Library", icon: "Images" },
  { href: "/voices", label: "Voice Library", icon: "Mic" },
  { href: "/brand", label: "Brand Kit", icon: "Palette" },
  { href: "/export", label: "Export Center", icon: "Download" },
  { href: "/team", label: "Team", icon: "Users" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;

export const EDITOR_TABS = [
  { id: "assets", label: "Assets", icon: "Folder" },
  { id: "templates", label: "Templates", icon: "LayoutTemplate" },
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
