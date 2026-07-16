import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Series,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { Layer, Project, Scene } from "@/types";
import { AnimatedText, ProgressBarScene } from "../components/AnimatedText";
import { TransitionOverlay } from "../components/TransitionOverlay";
import { ShapeLayer } from "../components/ShapeLayer";
import { ParticleField } from "../components/ParticleField";
import { MediaLayer } from "../components/MediaLayer";
import { NoiseBackground } from "../components/NoiseBackground";
import { CaptionRenderer } from "./Captions";

function LayerRenderer({ layer }: { layer: Layer }) {
  if (layer.visible === false) return null;

  switch (layer.type) {
    case "text":
      return layer.text ? (
        <AnimatedText
          text={layer.text}
          style={layer.textStyle}
          animation={layer.animation}
          animationDuration={layer.animationDuration}
          transform={layer.transform}
        />
      ) : null;
    case "shape":
      return <ShapeLayer layer={layer} />;
    case "noise":
      return <NoiseBackground layer={layer} />;
    case "solid":
      return (
        <AbsoluteFill
          style={{
            backgroundColor: layer.fill ?? "#111",
            opacity: layer.transform.opacity,
          }}
        />
      );
    case "caption":
      return <CaptionRenderer theme="neon" />;
    case "image":
    case "video":
    case "audio":
    case "gif":
    case "lottie":
      return <MediaLayer layer={layer} />;
    default:
      return null;
  }
}

function SceneBlock({
  scene,
  layers,
  isLast,
}: {
  scene: Scene;
  layers: Layer[];
  isLast: boolean;
}) {
  const frame = useCurrentFrame();
  const sceneLayers = layers.filter(
    (l) =>
      l.startFrame >= scene.startFrame &&
      l.startFrame < scene.startFrame + scene.durationInFrames
  );

  return (
    <AbsoluteFill style={{ backgroundColor: scene.background }}>
      <ParticleField density={18} />
      {sceneLayers.map((layer) => (
        <Sequence
          key={layer.id}
          from={Math.max(0, layer.startFrame - scene.startFrame)}
          durationInFrames={layer.durationInFrames}
          name={layer.name}
        >
          <LayerRenderer layer={layer} />
        </Sequence>
      ))}
      {!isLast && scene.transition !== "none" && (
        <Sequence
          from={scene.durationInFrames - scene.transitionDuration}
          durationInFrames={scene.transitionDuration}
        >
          <TransitionOverlay
            type={scene.transition}
            duration={scene.transitionDuration}
          />
        </Sequence>
      )}
      <ProgressBarScene
        progress={interpolate(
          frame,
          [0, scene.durationInFrames],
          [0, 1],
          { extrapolateRight: "clamp" }
        )}
      />
    </AbsoluteFill>
  );
}

export type MainCompositionProps = {
  project: Project;
};

export const MainComposition: React.FC<MainCompositionProps> = ({
  project,
}) => {
  const { width, height } = useVideoConfig();
  const scenes =
    project.scenes.length > 0
      ? project.scenes
      : [
          {
            id: "default",
            name: "Main",
            startFrame: 0,
            durationInFrames: project.settings.durationInFrames,
            transition: "none" as const,
            transitionDuration: 0,
            background: "#0a0a0f",
          },
        ];

  return (
    <AbsoluteFill style={{ width, height, backgroundColor: "#050508" }}>
      <Series>
        {scenes.map((scene, i) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames}
            name={scene.name}
          >
            <SceneBlock
              scene={scene}
              layers={project.layers}
              isLast={i === scenes.length - 1}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
