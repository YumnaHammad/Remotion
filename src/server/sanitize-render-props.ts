import {
  sceneVideoSchema,
} from "@/remotion/compositions/scene-video-schema";

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

export function prepareRenderInputProps(
  compositionId: string,
  inputProps: Record<string, unknown> | undefined
): Record<string, unknown> {
  const props = inputProps ?? {};
  if (compositionId === "LongFormVideo") {
    return sanitizeLongFormInputProps(props);
  }
  return props;
}
