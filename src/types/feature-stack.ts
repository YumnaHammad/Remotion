/** Standard Preston Blair / Rhubarb-compatible mouth shapes. */
export type VisemeCode = "A" | "B" | "C" | "D" | "E" | "F" | "X";

export interface VisemeCue {
  /** Mouth shape code */
  value: VisemeCode;
  /** Start time in milliseconds */
  startMs: number;
  /** End time in milliseconds */
  endMs: number;
}

export interface CameraKeyframe {
  frame: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
}

export interface LandmarkFrame {
  frame: number;
  /** Normalized face landmarks (x,y,z) — subset used for puppeting */
  face?: Array<{ x: number; y: number; z: number }>;
  /** Pose landmarks */
  pose?: Array<{ x: number; y: number; z: number; visibility?: number }>;
  /** Derived control values 0–1 for character rig */
  controls?: {
    mouthOpen?: number;
    smile?: number;
    browRaise?: number;
    headYaw?: number;
    headPitch?: number;
    armLeft?: number;
    armRight?: number;
  };
}

export type FeatureRoute = "script" | "reference";

export interface CharacterMapVideoProps {
  title: string;
  accent: string;
  brandColor: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  fontFamily?: string;
  voiceoverUrl?: string;
  backgroundMusicUrl?: string;
  captions?: Array<{
    text: string;
    startMs: number;
    endMs: number;
    timestampMs: number;
    confidence?: number | null;
  }>;
  visemes?: VisemeCue[];
  landmarks?: LandmarkFrame[];
  route?: FeatureRoute;
  /** Prefer Rive when .riv URL provided; otherwise procedural cartoon */
  riveSrc?: string;
  showMap?: boolean;
  showCharacter?: boolean;
  mapSeed?: number;
  cameraPath?: CameraKeyframe[];
  durationHintFrames?: number;
  /** Procedural look from character prompt */
  characterLook?: {
    skin: string;
    shirt: string;
    accent: string;
    hair: string;
    scale: number;
    label: string;
  };
  /** Procedural 3D world from place/story prompt */
  mapLook?: {
    theme: string;
    seed: number;
    sky: string;
    fog: string;
    ground: string;
    road: string;
    palette: string[];
    buildingHeight: number;
    density: number;
    label: string;
  };
}
