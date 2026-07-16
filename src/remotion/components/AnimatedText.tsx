import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import type { AnimationPreset, TextStyle, TransformProps } from "@/types";

export function useAnimatedStyle(
  animation: AnimationPreset,
  duration: number,
  transform: TransformProps
) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: duration,
  });

  const fade = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const slideY = interpolate(frame, [0, duration], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const scaleIn = interpolate(frame, [0, duration], [0.85, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });

  const rotate = interpolate(frame, [0, duration], [-8, 0], {
    extrapolateRight: "clamp",
  });

  const blur = interpolate(frame, [0, duration], [12, 0], {
    extrapolateRight: "clamp",
  });

  const bounce = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 120, mass: 0.6 },
  });

  let opacity = transform.opacity;
  let translateY = transform.y;
  let translateX = transform.x;
  let scale = transform.scale;
  let rotation = transform.rotation;
  let filterBlur = transform.blur;

  switch (animation) {
    case "fade":
      opacity *= fade;
      break;
    case "slide":
      opacity *= fade;
      translateY += slideY;
      break;
    case "scale":
      opacity *= fade;
      scale *= scaleIn;
      break;
    case "rotation":
      opacity *= fade;
      rotation += rotate;
      break;
    case "blur":
      opacity *= fade;
      filterBlur += blur;
      break;
    case "bounce":
      opacity *= fade;
      scale *= bounce;
      break;
    case "reveal":
      opacity *= progress;
      translateY += interpolate(progress, [0, 1], [24, 0]);
      break;
    case "morph":
      opacity *= fade;
      scale *= interpolate(progress, [0, 0.5, 1], [0.6, 1.08, 1]);
      break;
    default:
      break;
  }

  return {
    opacity,
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
    filter: filterBlur > 0 ? `blur(${filterBlur}px)` : undefined,
  };
}

export function AnimatedText({
  text,
  style,
  animation = "fade",
  animationDuration = 20,
  transform,
}: {
  text: string;
  style?: TextStyle;
  animation?: AnimationPreset;
  animationDuration?: number;
  transform: TransformProps;
}) {
  const frame = useCurrentFrame();
  const animated = useAnimatedStyle(animation, animationDuration, transform);

  const displayText =
    animation === "typewriter"
      ? text.slice(
          0,
          Math.floor(
            interpolate(frame, [0, animationDuration], [0, text.length], {
              extrapolateRight: "clamp",
            })
          )
        )
      : text;

  const chars =
    animation === "split-text"
      ? text.split("").map((char, i) => {
          const delay = i * 2;
          const o = interpolate(frame - delay, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame - delay, [0, 12], [16, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={`${char}-${i}`}
              style={{
                display: "inline-block",
                opacity: o,
                transform: `translateY(${y}px)`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })
      : null;

  const countValue =
    animation === "count-up"
      ? Math.floor(
          interpolate(frame, [0, animationDuration], [0, Number(text) || 100], {
            extrapolateRight: "clamp",
          })
        )
      : null;

  const color = style?.gradient
    ? undefined
    : style?.neon
      ? style.color
      : style?.color ?? "#fff";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        ...animated,
      }}
    >
      <div
        style={{
          fontFamily: style?.fontFamily ?? "Inter, system-ui, sans-serif",
          fontSize: style?.fontSize ?? 64,
          fontWeight: style?.fontWeight ?? 700,
          color,
          textAlign: style?.align ?? "center",
          lineHeight: style?.lineHeight ?? 1.15,
          letterSpacing: style?.letterSpacing ?? 0,
          backgroundImage: style?.gradient,
          backgroundClip: style?.gradient ? "text" : undefined,
          WebkitBackgroundClip: style?.gradient ? "text" : undefined,
          WebkitTextFillColor: style?.gradient ? "transparent" : undefined,
          textShadow: style?.neon
            ? `0 0 20px ${style.color}, 0 0 40px ${style.color}`
            : undefined,
          maxWidth: "90%",
        }}
      >
        {chars ?? (countValue !== null ? countValue : displayText)}
      </div>
    </AbsoluteFill>
  );
}

export function ProgressBarScene({
  progress,
  color = "#6366f1",
}: {
  progress: number;
  color?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: "10%",
        width: "80%",
        height: 6,
        borderRadius: 999,
        background: "rgba(255,255,255,0.15)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
        }}
      />
    </div>
  );
}
