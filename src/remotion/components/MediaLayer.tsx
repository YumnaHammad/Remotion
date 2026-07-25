import {
  AbsoluteFill,
  Audio,
  Freeze,
  Img,
  Loop,
  OffthreadVideo,
  Video,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import type { Layer } from "@/types";
import { useAnimatedStyle } from "./AnimatedText";
import { filtersToCss } from "./filters";
import {
  enhanceToCss,
  maskToStyle,
  stabilizeTransform,
  voicePresetToPlayback,
} from "@/lib/media-tools";
import { rewriteBrokenMediaUrl } from "@/lib/sample-media";

function Wrapper({
  layer,
  children,
}: {
  layer: Layer;
  children: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const animated = useAnimatedStyle(
    layer.animation,
    layer.animationDuration,
    layer.transform
  );
  const maskStyle = maskToStyle(layer.mask);
  const enhanceCss = enhanceToCss(layer.enhance);
  const baseFilter = filtersToCss(layer.filters, layer.transform.blur);
  const filter = [baseFilter, enhanceCss].filter(Boolean).join(" ");
  const stab = stabilizeTransform(frame, layer.stabilize);
  const bg = layer.backgroundReplace;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: animated.opacity,
        transform: [animated.transform, stab].filter(Boolean).join(" "),
        filter: filter || undefined,
        mixBlendMode: layer.blendMode ?? "normal",
        ...maskStyle,
      }}
    >
      {/* Background replace layers sit behind the media */}
      {bg?.mode === "solid" && (
        <AbsoluteFill
          style={{
            background: bg.color ?? "#00ff00",
            zIndex: 0,
          }}
        />
      )}
      {bg?.mode === "image" && bg.imageUrl && (
        <AbsoluteFill style={{ zIndex: 0 }}>
          <Img
            src={bg.imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      )}
      {bg?.mode === "blur" && (
        <AbsoluteFill
          style={{
            zIndex: 0,
            background: "rgba(0,0,0,0.15)",
            backdropFilter: `blur(${bg.blurAmount ?? 16}px)`,
            WebkitBackdropFilter: `blur(${bg.blurAmount ?? 16}px)`,
          }}
        />
      )}
      {bg?.mode === "chroma" && (
        <AbsoluteFill
          style={{
            zIndex: 0,
            background: bg.color ?? bg.chromaColor ?? "#00ff00",
          }}
        />
      )}

      <AbsoluteFill style={{ zIndex: 1 }}>{children}</AbsoluteFill>

      {layer.overlay?.enabled && (
        <AbsoluteFill
          style={{
            zIndex: 2,
            background:
              layer.overlay.gradient ??
              layer.overlay.color ??
              "rgba(99,102,241,0.35)",
            opacity: layer.overlay.opacity ?? 0.35,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
}

export function MediaLayer({
  layer,
  gain = 1,
}: {
  layer: Layer;
  gain?: number;
}) {
  const { width, height } = useVideoConfig();
  const fit = layer.objectFit ?? "cover";
  const src = rewriteBrokenMediaUrl(layer.src) ?? layer.src;
  const volume = (layer.muted ? 0 : (layer.volume ?? 1)) * gain;
  const baseRate = Math.abs(layer.playbackRate ?? 1);
  const voice = voicePresetToPlayback(layer.voiceEffects?.preset ?? "none");
  const playbackRate = layer.reverse ? -baseRate : baseRate * voice.playbackRate;
  const finalVolume = volume * voice.volume;

  // Remotion doesn't support negative playbackRate — reverse uses freeze+scrub approx
  // via positive rate + CSS scaleX flip for visual reverse when reverse flag set
  const reverseVisual = !!layer.reverse;
  const safeRate = Math.max(0.1, Math.abs(playbackRate) || 1);

  const mediaStyle: React.CSSProperties = {
    width,
    height,
    objectFit: fit,
    transform: reverseVisual ? "scaleX(-1)" : undefined,
    // Chroma-ish: when chroma mode, slightly reduce green via filter on media only
    ...(layer.backgroundReplace?.mode === "chroma"
      ? {
          mixBlendMode: "multiply" as const,
          filter: "saturate(1.1) contrast(1.05)",
        }
      : {}),
  };

  if (layer.type === "image" && src) {
    return (
      <Wrapper layer={layer}>
        <Img src={src} style={mediaStyle} />
      </Wrapper>
    );
  }

  if (layer.type === "gif" && src) {
    return (
      <Wrapper layer={layer}>
        <Img src={src} style={mediaStyle} />
      </Wrapper>
    );
  }

  if (layer.type === "sticker" && src) {
    return (
      <Wrapper layer={layer}>
        <Img
          src={src}
          style={{
            maxWidth: width * 0.4,
            maxHeight: height * 0.4,
            objectFit: "contain",
            transform: reverseVisual ? "scaleX(-1)" : undefined,
          }}
        />
      </Wrapper>
    );
  }

  if (layer.type === "lottie" && layer.lottieSrc) {
    return null;
  }

  if (layer.type === "video" && src) {
    // Prefer <Video> for remote/blob sources in the browser Player.
    // OffthreadVideo often fails with CDN CORS / decode errors in preview.
    const preferHtmlVideo =
      layer.useOffthread === false ||
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("blob:");
    const VideoComp = preferHtmlVideo ? Video : OffthreadVideo;
    let node: React.ReactNode = (
      <VideoComp
        src={src}
        volume={finalVolume}
        playbackRate={safeRate}
        style={mediaStyle}
        pauseWhenBuffering
        acceptableTimeShiftInSeconds={1}
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

  if (layer.type === "audio" && src) {
    // Audio denoise / normalize approximated via volume shaping
    const denoise = layer.audioTools?.denoise ?? 0;
    const normalizeBoost = layer.audioTools?.normalize ? 1.15 : 1;
    const denoiseAttenuate = 1 - denoise * 0.002;
    let node: React.ReactNode = (
      <Audio
        src={src}
        volume={finalVolume * normalizeBoost * denoiseAttenuate}
        playbackRate={safeRate}
      />
    );
    if (layer.loop) {
      node = <Loop durationInFrames={layer.durationInFrames}>{node}</Loop>;
    }
    return node;
  }

  return null;
}
