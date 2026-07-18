import React, { Component, type ErrorInfo, type ReactNode } from "react";
import {
  AbsoluteFill,
  Sequence,
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

/** One broken media/shape must not blank the entire Player. */
class LayerBoundary extends Component<
  { children: ReactNode; name: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[layer:${this.props.name}]`, error.message, info.componentStack);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function LayerRenderer({
  layer,
  gain = 1,
}: {
  layer: Layer;
  gain?: number;
}) {
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
            backgroundColor: layer.fill ?? "#0b84f3",
            opacity: layer.transform?.opacity ?? 1,
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
      return <MediaLayer layer={layer} gain={gain} />;
    default:
      return null;
  }
}

function makeGainResolver(project: Project) {
  const master = project.masterVolume ?? 1;
  const soloed = project.tracks.filter((t) => t.solo).map((t) => t.id);
  return (layer: Layer) => {
    const track = project.tracks.find((t) => t.id === layer.trackId);
    if (!track) return master;
    if (track.muted) return 0;
    if (soloed.length && !soloed.includes(track.id)) return 0;
    return (track.volume ?? 1) * master;
  };
}

function SceneBackground({ scene, isLast }: { scene: Scene; isLast: boolean }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: scene.background || "#0b0c0f" }}>
      <ParticleField density={12} />
      {!isLast && scene.transition !== "none" && scene.transitionDuration > 0 && (
        <Sequence
          from={Math.max(0, scene.durationInFrames - scene.transitionDuration)}
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
          [0, Math.max(1, scene.durationInFrames)],
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

/**
 * Timeline-accurate composition: every layer is an absolute <Sequence>
 * using the same startFrame/duration as the editor timeline (WYSIWYG).
 * Scene backgrounds run in parallel underneath.
 */
export const MainComposition: React.FC<MainCompositionProps> = ({
  project,
}) => {
  const { width, height } = useVideoConfig();
  const gainFor = makeGainResolver(project);
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
            background: "#0b0c0f",
          },
        ];

  // Paint lower tracks first so higher tracks (later in array) stack on top.
  const layers = [...project.layers];

  return (
    <AbsoluteFill style={{ width, height, backgroundColor: "#000000" }}>
      {scenes.map((scene, i) => (
        <Sequence
          key={`bg-${scene.id}`}
          from={scene.startFrame}
          durationInFrames={Math.max(1, scene.durationInFrames)}
          name={`Scene · ${scene.name}`}
        >
          <SceneBackground
            scene={scene}
            isLast={i === scenes.length - 1}
          />
        </Sequence>
      ))}

      {layers.map((layer) => (
        <Sequence
          key={layer.id}
          from={Math.max(0, layer.startFrame)}
          durationInFrames={Math.max(1, layer.durationInFrames)}
          name={layer.name}
        >
          <LayerBoundary name={layer.name}>
            <LayerRenderer layer={layer} gain={gainFor(layer)} />
          </LayerBoundary>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
