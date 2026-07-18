import type { AspectRatio, ExportFormat, ExportQuality } from "./index";

/** Metadata extracted from a website URL (Open Graph / HTML). */
export interface UrlMetadata {
  url: string;
  title: string;
  description: string;
  image?: string;
  siteName?: string;
}

/** One row from CSV / Excel / JSON uploads. */
export interface DataRow {
  [key: string]: string | number | boolean | null | undefined;
}

/** Extended brand settings persisted in localStorage. */
export interface BrandSettings {
  id: string;
  name: string;
  logoUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontFamily: string;
  introAnimation: "fade" | "slide" | "scale" | "none";
  outroAnimation: "fade" | "slide" | "scale" | "none";
  musicUrl?: string;
}

/** Props passed to Remotion template compositions. */
export interface VideoTemplateProps {
  title: string;
  subtitle: string;
  accent: string;
  brandColor: string;
  imageUrl?: string;
  fontFamily?: string;
  logoUrl?: string;
  musicUrl?: string;
}

/** Props for data-driven slideshow composition. */
export interface DataVideoProps {
  title: string;
  subtitle: string;
  accent: string;
  brandColor: string;
  rows: DataRow[];
  columns: string[];
  fontFamily?: string;
}

/** Source that created a simple video project. */
export type VideoSourceType = "template" | "website" | "data" | "manual";

/**
 * Lightweight video project — no timeline tracks.
 * Used by the simple create workflow (Website / Data / Templates).
 */
export interface SimpleVideoProject {
  id: string;
  name: string;
  sourceType: VideoSourceType;
  compositionId: string;
  templateId?: string;
  props: VideoTemplateProps | DataVideoProps;
  aspectRatio: AspectRatio;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "ready" | "rendering";
  /** Original URL when sourceType is website */
  sourceUrl?: string;
  /** Parsed rows when sourceType is data */
  dataRows?: DataRow[];
}

export interface ExportRequest {
  projectId: string;
  compositionId: string;
  inputProps: Record<string, unknown>;
  format: ExportFormat;
  quality: ExportQuality;
}
