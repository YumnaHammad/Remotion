import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { TransitionType } from "@/types";

export function TransitionOverlay({
  type,
  duration,
}: {
  type: TransitionType;
  duration: number;
}) {
  const frame = useCurrentFrame();
  if (type === "none" || duration <= 0) return null;

  const t = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  switch (type) {
    case "fade":
      return (
        <AbsoluteFill
          style={{ backgroundColor: "#000", opacity: 1 - Math.abs(t * 2 - 1) }}
        />
      );
    case "slide":
      return (
        <AbsoluteFill
          style={{
            backgroundColor: "#0a0a0f",
            transform: `translateX(${(1 - t) * 100}%)`,
          }}
        />
      );
    case "zoom":
      return (
        <AbsoluteFill
          style={{
            backgroundColor: "#000",
            opacity: 1 - t,
            transform: `scale(${1 + t})`,
          }}
        />
      );
    case "wipe":
      return (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at center, transparent ${t * 100}%, #000 ${t * 100}%)`,
          }}
        />
      );
    case "blur":
      return (
        <AbsoluteFill
          style={{
            backdropFilter: `blur(${(1 - t) * 20}px)`,
            backgroundColor: `rgba(0,0,0,${(1 - t) * 0.4})`,
          }}
        />
      );
    case "flip":
      return (
        <AbsoluteFill
          style={{
            backgroundColor: "#111",
            transform: `perspective(800px) rotateY(${(1 - t) * 90}deg)`,
            transformOrigin: "left center",
          }}
        />
      );
    case "cinematic":
      return (
        <>
          <AbsoluteFill
            style={{
              backgroundColor: "#000",
              height: `${((1 - t) * 18)}%`,
              bottom: "auto",
            }}
          />
          <AbsoluteFill
            style={{
              backgroundColor: "#000",
              height: `${((1 - t) * 18)}%`,
              top: "auto",
            }}
          />
        </>
      );
    case "camera":
      return (
        <AbsoluteFill
          style={{
            backgroundColor: "#000",
            opacity: interpolate(t, [0, 0.3, 0.7, 1], [1, 0, 0, 1]),
            transform: `scale(${interpolate(t, [0, 1], [1.15, 1])})`,
          }}
        />
      );
    default:
      return null;
  }
}
