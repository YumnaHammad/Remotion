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
import { getAnimationParams } from "../animation-engine";

const DEFAULT_FONT = "Inter, system-ui, sans-serif";

function SceneVideo({
  scene,
  accent,
  styleProfile,
  speedProfile,
  sceneIndex,
}: {
  scene: ResolvedEditRecipeScene;
  accent: string;
  styleProfile: "minimal" | "dynamic" | "luxury" | "modern" | "energetic";
  speedProfile: "slow" | "medium" | "fast";
  sceneIndex: number;
}) {
  const frame = useCurrentFrame();
  const src =
    rewriteBrokenMediaUrl(scene.stockVideoUrl) ?? scene.stockVideoUrl;
  if (!src) {
    return <AbsoluteFill style={{ backgroundColor: "#0b0c10" }} />;
  }
  const asImage = isStockImageUrl(src);

  const { mediaStyle, transitionOpacity } = getAnimationParams(
    { styleProfile, speedProfile },
    frame,
    scene.durationInFrames,
    sceneIndex
  );

  return (
    <AbsoluteFill style={{ opacity: transitionOpacity }}>
      <AbsoluteFill style={mediaStyle}>
        {asImage ? (
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Video src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
    animationStyleProfile: raw.animationStyleProfile ?? "dynamic",
    animationSpeedProfile: raw.animationSpeedProfile ?? "medium",
  };

  const frame = useCurrentFrame();
  
  // Find active scene index for captions style overrides
  const activeSceneIndex = props.scenes.findIndex(
    (s) => frame >= s.startFrame && frame < s.startFrame + s.durationInFrames
  );
  const activeScene = props.scenes[activeSceneIndex] || props.scenes[0];
  const { captionTheme, captionStyle } = getAnimationParams(
    { styleProfile: props.animationStyleProfile, speedProfile: props.animationSpeedProfile },
    activeScene ? frame - activeScene.startFrame : frame,
    activeScene ? activeScene.durationInFrames : 300,
    activeSceneIndex >= 0 ? activeSceneIndex : 0
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <DuckingBackgroundMusic musicUrl={props.backgroundMusicUrl} />

      {showCaptions && props.voiceoverUrl ? (
        <Audio src={props.voiceoverUrl} volume={1} />
      ) : null}

      {props.scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <SceneVideo
            scene={scene}
            accent={props.accent}
            styleProfile={props.animationStyleProfile}
            speedProfile={props.animationSpeedProfile}
            sceneIndex={index}
          />
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
          theme={captionTheme}
          textStyle={{
            ...captionStyle,
            fontFamily: (props.fontFamily && props.animationStyleProfile === "dynamic" ? props.fontFamily : captionStyle.fontFamily) || DEFAULT_FONT
          } as any}
          combineMs={1400}
          useSampleFallback={false}
        />
      ) : null}
    </AbsoluteFill>
  );
};
