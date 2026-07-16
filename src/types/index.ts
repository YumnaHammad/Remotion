export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";
export type ExportFormat = "mp4" | "webm" | "gif";
export type ExportQuality = "720p" | "1080p" | "2k" | "4k";
export type RenderStatus = "queued" | "rendering" | "processing" | "completed" | "failed";
export type TrackKind = "video" | "audio" | "text" | "shape" | "caption" | "effect";
export type LayerType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "shape"
  | "caption"
  | "solid"
  | "lottie"
  | "three"
  | "gif"
  | "noise";

export type ShapeKind =
  | "rect"
  | "circle"
  | "ellipse"
  | "triangle"
  | "star"
  | "polygon"
  | "heart"
  | "pie"
  | "arrow";

export interface LayerFilters {
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  grayscale: number;
  sepia: number;
}

export const DEFAULT_FILTERS: LayerFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  hueRotate: 0,
  grayscale: 0,
  sepia: 0,
};

export type AnimationPreset =
  | "fade"
  | "slide"
  | "scale"
  | "rotation"
  | "blur"
  | "bounce"
  | "typewriter"
  | "split-text"
  | "count-up"
  | "reveal"
  | "morph"
  | "none";

export type TransitionType =
  | "fade"
  | "slide"
  | "zoom"
  | "wipe"
  | "blur"
  | "camera"
  | "flip"
  | "cinematic"
  | "none";

export interface TransformProps {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  blur: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
  gradient?: string;
  neon?: boolean;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  trackId: string;
  startFrame: number;
  durationInFrames: number;
  transform: TransformProps;
  animation: AnimationPreset;
  animationDuration: number;
  locked?: boolean;
  visible?: boolean;
  // content
  text?: string;
  textStyle?: TextStyle;
  src?: string;
  volume?: number;
  shape?: ShapeKind;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  captionWords?: CaptionWord[];
  // media controls
  objectFit?: "cover" | "contain" | "fill";
  playbackRate?: number;
  loop?: boolean;
  freezeFrame?: number | null;
  trimBefore?: number;
  muted?: boolean;
  useOffthread?: boolean;
  // effects
  filters?: LayerFilters;
  motionBlur?: boolean;
  motionBlurSamples?: number;
  // lottie
  lottieSrc?: string;
}

export interface CaptionWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface Track {
  id: string;
  name: string;
  kind: TrackKind;
  locked: boolean;
  muted: boolean;
  height: number;
}

export interface Scene {
  id: string;
  name: string;
  startFrame: number;
  durationInFrames: number;
  transition: TransitionType;
  transitionDuration: number;
  background: string;
}

export interface CompositionSettings {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  aspectRatio: AspectRatio;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "rendering" | "ready" | "archived";
  settings: CompositionSettings;
  scenes: Scene[];
  tracks: Track[];
  layers: Layer[];
  brandKitId?: string;
  tags: string[];
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  aspectRatio: AspectRatio;
  durationInFrames: number;
  tags: string[];
  popular?: boolean;
  premium?: boolean;
  compositionId: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "gif" | "font";
  url: string;
  thumbnail?: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  createdAt: string;
  folder?: string;
  tags: string[];
}

export interface VoiceAsset {
  id: string;
  name: string;
  provider: string;
  language: string;
  gender: "male" | "female" | "neutral";
  previewUrl?: string;
  style: string;
  popular?: boolean;
}

export interface BrandKit {
  id: string;
  name: string;
  colors: string[];
  fonts: string[];
  logos: string[];
  voiceId?: string;
}

export interface RenderJob {
  id: string;
  projectId: string;
  projectName: string;
  status: RenderStatus;
  progress: number;
  format: ExportFormat;
  quality: ExportQuality;
  aspectRatio: AspectRatio;
  createdAt: string;
  estimatedSeconds?: number;
  outputUrl?: string;
  error?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
  status: "active" | "pending";
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: "render" | "team" | "billing" | "system";
}
