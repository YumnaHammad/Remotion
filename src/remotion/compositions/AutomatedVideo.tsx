import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { CaptionRenderer } from "./Captions";
import type { Caption } from "@remotion/captions";
import type { AutomatedVideoSchemaProps } from "./automated-video-schema";
import type { ResolvedEditRecipeScene } from "@/types/edit-recipe";
import { rewriteBrokenMediaUrl } from "@/lib/sample-media";
import { isStockImageUrl } from "@/lib/pipeline/local-stock";

const DEFAULT_FONT = "Inter, system-ui, sans-serif";

function SceneVideo({
  scene,
  accent,
}: {
  scene: ResolvedEditRecipeScene;
  accent: string;
}) {
  const frame = useCurrentFrame();
  const src =
    rewriteBrokenMediaUrl(scene.stockVideoUrl) ?? scene.stockVideoUrl;
  if (!src) {
    return <AbsoluteFill style={{ backgroundColor: "#0b0c10" }} />;
  }
  const asImage = isStockImageUrl(src);

  const transition = scene.transition as any;
  const fadeIn =
    transition === "fade" || transition === "fade-in" || transition === "crossfade"
      ? interpolate(frame, [0, 15], [0, 1], {
          extrapolateRight: "clamp",
        })
      : 1;
  const fadeOut =
    scene.transition === "fade-out"
      ? interpolate(
          frame,
          [scene.durationInFrames - 15, scene.durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      : 1;

  const zoom =
    scene.animationStyle === "zoom" || asImage
      ? interpolate(frame, [0, scene.durationInFrames], [1.12, 1], {
          extrapolateRight: "clamp",
        })
      : 1;

  const neonGlow =
    scene.animationStyle === "neon-glow"
      ? `drop-shadow(0 0 24px ${accent})`
      : undefined;

  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          filter: neonGlow,
        }}
      >
        {asImage ? (
          <Img src={src} style={mediaStyle} />
        ) : (
          <Video src={src} style={mediaStyle} />
        )}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%)",
        }}
      />
    </AbsoluteFill>
  );
}

function DuckingBackgroundMusic({ musicUrl }: { musicUrl?: string }) {
  const frame = useCurrentFrame();
  const src = rewriteBrokenMediaUrl(musicUrl) ?? musicUrl;
  if (!src) return null;

  const pulse = 0.12 + Math.sin(frame / 20) * 0.02;
  return <Audio src={src} volume={pulse} loop />;
}

export const AutomatedVideo: React.FC<Partial<AutomatedVideoSchemaProps>> = (
  raw
) => {
  const showCaptions = raw.showCaptions !== false;
  const props = {
    title: raw.title ?? "Script Video",
    accent: raw.accent ?? "#0b84f3",
    brandColor: raw.brandColor ?? "#1e3a5f",
    fontFamily: raw.fontFamily ?? DEFAULT_FONT,
    voiceoverUrl: rewriteBrokenMediaUrl(raw.voiceoverUrl) ?? raw.voiceoverUrl,
    backgroundMusicUrl:
      rewriteBrokenMediaUrl(raw.backgroundMusicUrl) ?? raw.backgroundMusicUrl,
    captions: raw.captions,
    scenes: raw.scenes ?? [],
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <DuckingBackgroundMusic musicUrl={props.backgroundMusicUrl} />

      {showCaptions && props.voiceoverUrl ? (
        <Audio src={props.voiceoverUrl} volume={1} />
      ) : null}

      {props.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <SceneVideo scene={scene} accent={props.accent} />
          {scene.soundEffectUrl && (
            <Audio src={scene.soundEffectUrl} volume={0.7} />
          )}
        </Sequence>
      ))}

      {showCaptions ? (
        <CaptionRenderer
          captions={
            (props.captions?.map((c) => ({
              ...c,
              confidence: c.confidence ?? null,
            })) ?? null) as Caption[] | null
          }
          theme="neon"
          combineMs={1400}
          useSampleFallback={false}
        />
      ) : null}
    </AbsoluteFill>
  );
};
