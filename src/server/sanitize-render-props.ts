import {
  sceneVideoSchema,
} from "@/remotion/compositions/scene-video-schema";
import {
  automatedVideoSchema,
} from "@/remotion/compositions/automated-video-schema";
import {
  characterMapVideoSchema,
} from "@/remotion/compositions/character-map-schema";
import path from "node:path";
import { rewriteBrokenMediaUrl } from "@/lib/sample-media";

const VALID_ANIMATIONS = new Set([
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
]);

/** Convert site-relative generated asset paths to absolute filesystem paths for Remotion render. */
function toRenderableMediaUrl(url: string): string {
  return rewriteBrokenMediaUrl(url) ?? url;
}

/** Normalize long-form props before Remotion render (API + Vercel). */
export function sanitizeLongFormInputProps(
  inputProps: Record<string, unknown>
): Record<string, unknown> {
  const parsed = sceneVideoSchema.safeParse(inputProps);
  if (parsed.success) {
    return parsed.data as unknown as Record<string, unknown>;
  }

  const scenes = Array.isArray(inputProps.scenes) ? inputProps.scenes : [];
  const normalizedScenes = scenes.map((scene, index) => {
    if (!scene || typeof scene !== "object") {
      return {
        id: `scene-${index}`,
        type: "content" as const,
        title: "Scene",
        animation: "fade" as const,
        durationInFrames: 90,
      };
    }

    const s = scene as Record<string, unknown>;
    const animation =
      typeof s.animation === "string" && VALID_ANIMATIONS.has(s.animation)
        ? s.animation
        : "fade";

    return {
      ...s,
      id: typeof s.id === "string" && s.id ? s.id : `scene-${index}`,
      type: s.type ?? "content",
      title: typeof s.title === "string" ? s.title : "Scene",
      animation,
      durationInFrames:
        typeof s.durationInFrames === "number"
          ? Math.min(900, Math.max(30, s.durationInFrames))
          : 90,
    };
  });

  return {
    title: typeof inputProps.title === "string" ? inputProps.title : "Video",
    subtitle:
      typeof inputProps.subtitle === "string" ? inputProps.subtitle : "",
    accent:
      typeof inputProps.accent === "string" ? inputProps.accent : "#0b84f3",
    brandColor:
      typeof inputProps.brandColor === "string"
        ? inputProps.brandColor
        : "#1e3a5f",
    ...(typeof inputProps.fontFamily === "string"
      ? { fontFamily: inputProps.fontFamily }
      : {}),
    ...(typeof inputProps.logoUrl === "string"
      ? { logoUrl: inputProps.logoUrl }
      : {}),
    ...(typeof inputProps.musicUrl === "string"
      ? { musicUrl: inputProps.musicUrl }
      : {}),
    scenes: normalizedScenes,
  };
}

/** Normalize AutomatedVideo props before Remotion render. */
export function sanitizeAutomatedVideoInputProps(
  inputProps: Record<string, unknown>
): Record<string, unknown> {
  const parsed = automatedVideoSchema.safeParse(inputProps);
  if (parsed.success) {
    const data = parsed.data;
    return {
      ...data,
      voiceoverUrl: data.voiceoverUrl
        ? toRenderableMediaUrl(data.voiceoverUrl)
        : undefined,
      backgroundMusicUrl: data.backgroundMusicUrl
        ? toRenderableMediaUrl(data.backgroundMusicUrl)
        : undefined,
      scenes: data.scenes.map((scene) => ({
        ...scene,
        stockVideoUrl: toRenderableMediaUrl(scene.stockVideoUrl),
        soundEffectUrl: scene.soundEffectUrl
          ? toRenderableMediaUrl(scene.soundEffectUrl)
          : undefined,
      })),
    } as unknown as Record<string, unknown>;
  }

  const scenes = Array.isArray(inputProps.scenes) ? inputProps.scenes : [];
  const normalizedScenes = scenes.map((scene, index) => {
    if (!scene || typeof scene !== "object") {
      return {
        id: `scene-${index}`,
        startFrame: index * 90,
        durationInFrames: 90,
        subtitleText: "Scene",
        stockVideoKeyword: "abstract",
        stockVideoUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=80",
      };
    }
    const s = scene as Record<string, unknown>;
    return {
      ...s,
      id: typeof s.id === "string" && s.id ? s.id : `scene-${index}`,
      startFrame: typeof s.startFrame === "number" ? s.startFrame : index * 90,
      durationInFrames:
        typeof s.durationInFrames === "number"
          ? Math.min(900, Math.max(15, s.durationInFrames))
          : 90,
      subtitleText:
        typeof s.subtitleText === "string" ? s.subtitleText : "Scene",
      stockVideoKeyword:
        typeof s.stockVideoKeyword === "string"
          ? s.stockVideoKeyword
          : "abstract",
      stockVideoUrl:
        typeof s.stockVideoUrl === "string"
          ? toRenderableMediaUrl(s.stockVideoUrl) ||
            "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=80"
          : "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=80",
    };
  });

  return {
    title: typeof inputProps.title === "string" ? inputProps.title : "Video",
    accent:
      typeof inputProps.accent === "string" ? inputProps.accent : "#0b84f3",
    brandColor:
      typeof inputProps.brandColor === "string"
        ? inputProps.brandColor
        : "#1e3a5f",
    aspectRatio:
      inputProps.aspectRatio === "9:16" ||
      inputProps.aspectRatio === "1:1" ||
      inputProps.aspectRatio === "16:9"
        ? inputProps.aspectRatio
        : "16:9",
    ...(typeof inputProps.fontFamily === "string"
      ? { fontFamily: inputProps.fontFamily }
      : {}),
    ...(typeof inputProps.voiceoverUrl === "string"
      ? { voiceoverUrl: toRenderableMediaUrl(inputProps.voiceoverUrl) }
      : {}),
    ...(typeof inputProps.backgroundMusicUrl === "string"
      ? {
          backgroundMusicUrl: toRenderableMediaUrl(
            inputProps.backgroundMusicUrl
          ),
        }
      : {}),
    ...(Array.isArray(inputProps.captions)
      ? { captions: inputProps.captions }
      : {}),
    scenes: normalizedScenes.map((scene) => {
      const s = scene as Record<string, unknown>;
      return {
        ...s,
        stockVideoUrl: toRenderableMediaUrl(String(s.stockVideoUrl)),
        ...(typeof s.soundEffectUrl === "string"
          ? { soundEffectUrl: toRenderableMediaUrl(s.soundEffectUrl) }
          : {}),
      };
    }),
  };
}

/** Normalize CharacterMapVideo props before Remotion render. */
export function sanitizeCharacterMapInputProps(
  inputProps: Record<string, unknown>
): Record<string, unknown> {
  const parsed = characterMapVideoSchema.safeParse(inputProps);
  if (parsed.success) {
    const data = parsed.data;
    return {
      ...data,
      voiceoverUrl: data.voiceoverUrl
        ? toRenderableMediaUrl(data.voiceoverUrl)
        : undefined,
      backgroundMusicUrl: data.backgroundMusicUrl
        ? toRenderableMediaUrl(data.backgroundMusicUrl)
        : undefined,
      riveSrc: data.riveSrc ? toRenderableMediaUrl(data.riveSrc) : undefined,
    } as unknown as Record<string, unknown>;
  }

  return {
    title: typeof inputProps.title === "string" ? inputProps.title : "Video",
    accent:
      typeof inputProps.accent === "string" ? inputProps.accent : "#0b84f3",
    brandColor:
      typeof inputProps.brandColor === "string"
        ? inputProps.brandColor
        : "#1e3a5f",
    aspectRatio:
      inputProps.aspectRatio === "9:16" ||
      inputProps.aspectRatio === "1:1" ||
      inputProps.aspectRatio === "16:9"
        ? inputProps.aspectRatio
        : "9:16",
    showMap: inputProps.showMap !== false,
    showCharacter: inputProps.showCharacter !== false,
    ...(typeof inputProps.voiceoverUrl === "string"
      ? { voiceoverUrl: toRenderableMediaUrl(inputProps.voiceoverUrl) }
      : {}),
    ...(typeof inputProps.backgroundMusicUrl === "string"
      ? {
          backgroundMusicUrl: toRenderableMediaUrl(
            inputProps.backgroundMusicUrl
          ),
        }
      : {}),
    ...(Array.isArray(inputProps.captions)
      ? { captions: inputProps.captions }
      : {}),
    ...(Array.isArray(inputProps.visemes)
      ? { visemes: inputProps.visemes }
      : {}),
    ...(Array.isArray(inputProps.landmarks)
      ? { landmarks: inputProps.landmarks }
      : {}),
    ...(typeof inputProps.mapSeed === "number"
      ? { mapSeed: inputProps.mapSeed }
      : {}),
    ...(typeof inputProps.durationHintFrames === "number"
      ? { durationHintFrames: inputProps.durationHintFrames }
      : {}),
    ...(inputProps.characterLook && typeof inputProps.characterLook === "object"
      ? { characterLook: inputProps.characterLook }
      : {}),
    ...(inputProps.mapLook && typeof inputProps.mapLook === "object"
      ? { mapLook: inputProps.mapLook }
      : {}),
    ...(inputProps.route === "script" || inputProps.route === "reference"
      ? { route: inputProps.route }
      : {}),
  };
}

export function prepareRenderInputProps(
  compositionId: string,
  inputProps: Record<string, unknown> | undefined
): Record<string, unknown> {
  const props = inputProps ?? {};
  if (compositionId === "LongFormVideo") {
    return sanitizeLongFormInputProps(props);
  }
  if (compositionId === "AutomatedVideo") {
    return sanitizeAutomatedVideoInputProps(props);
  }
  if (compositionId === "CharacterMapVideo") {
    return sanitizeCharacterMapInputProps(props);
  }
  return props;
}
