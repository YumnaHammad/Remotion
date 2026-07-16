import {
  AbsoluteFill,
  Audio,
  Freeze,
  Img,
  Loop,
  OffthreadVideo,
  Video,
  useVideoConfig,
} from "remotion";
import { Gif } from "@remotion/gif";
import { Lottie } from "@remotion/lottie";
import { CameraMotionBlur } from "@remotion/motion-blur";
import type { Layer } from "@/types";
import { useAnimatedStyle } from "./AnimatedText";
import { filtersToCss } from "./filters";

function Wrapper({
  layer,
  children,
}: {
  layer: Layer;
  children: React.ReactNode;
}) {
  const animated = useAnimatedStyle(
    layer.animation,
    layer.animationDuration,
    layer.transform
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: animated.opacity,
        transform: animated.transform,
        filter: filtersToCss(layer.filters, layer.transform.blur),
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

export function MediaLayer({ layer }: { layer: Layer }) {
  const { width, height } = useVideoConfig();
  const fit = layer.objectFit ?? "cover";

  if (layer.type === "image" && layer.src) {
    const img = (
      <Img
        src={layer.src}
        style={{ width, height, objectFit: fit }}
      />
    );
    return <Wrapper layer={layer}>{img}</Wrapper>;
  }

  if (layer.type === "gif" && layer.src) {
    return (
      <Wrapper layer={layer}>
        <Gif
          src={layer.src}
          width={width}
          height={height}
          fit={fit}
          playbackRate={layer.playbackRate ?? 1}
        />
      </Wrapper>
    );
  }

  if (layer.type === "lottie" && layer.lottieSrc) {
    // lottieSrc expects imported JSON; skip when not provided as object
    return null;
  }

  if (layer.type === "video" && layer.src) {
    const VideoComp = layer.useOffthread === false ? Video : OffthreadVideo;
    let node: React.ReactNode = (
      <VideoComp
        src={layer.src}
        volume={layer.muted ? 0 : layer.volume ?? 1}
        playbackRate={layer.playbackRate ?? 1}
        style={{ width, height, objectFit: fit }}
      />
    );

    if (typeof layer.freezeFrame === "number") {
      node = <Freeze frame={layer.freezeFrame}>{node}</Freeze>;
    }
    if (layer.loop) {
      node = <Loop durationInFrames={layer.durationInFrames}>{node}</Loop>;
    }
    if (layer.motionBlur) {
      node = (
        <CameraMotionBlur samples={layer.motionBlurSamples ?? 8}>
          {node}
        </CameraMotionBlur>
      );
    }
    return <Wrapper layer={layer}>{node}</Wrapper>;
  }

  if (layer.type === "audio" && layer.src) {
    let node: React.ReactNode = (
      <Audio
        src={layer.src}
        volume={layer.muted ? 0 : layer.volume ?? 1}
        playbackRate={layer.playbackRate ?? 1}
      />
    );
    if (layer.loop) {
      node = <Loop durationInFrames={layer.durationInFrames}>{node}</Loop>;
    }
    return node;
  }

  return null;
}
