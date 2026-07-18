import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type AnimMode =
  | "spring"
  | "ease"
  | "typewriter"
  | "counter"
  | "parallax"
  | "shake";

export type AnimationLabProps = {
  mode: AnimMode;
  intensity: number;
  accent: string;
  text: string;
};

export const AnimationLab: React.FC<AnimationLabProps> = ({
  mode,
  intensity,
  accent,
  text,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  if (mode === "typewriter") {
    const chars = Math.floor(
      interpolate(frame, [0, 60], [0, text.length], {
        extrapolateRight: "clamp",
      })
    );
    return (
      <AbsoluteFill
        style={{
          background: "#0b0c0f",
          justifyContent: "center",
          alignItems: "center",
          padding: 64,
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: 48,
            fontWeight: 700,
            fontFamily: "monospace",
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          {text.slice(0, chars)}
          <span style={{ color: accent, opacity: frame % 20 < 10 ? 1 : 0 }}>
            |
          </span>
        </p>
      </AbsoluteFill>
    );
  }

  if (mode === "counter") {
    const value = Math.floor(
      interpolate(frame, [0, 90], [0, 10000 * intensity], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    );
    return (
      <AbsoluteFill
        style={{
          background: "#0b0c0f",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: accent,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value.toLocaleString()}
        </p>
        <p style={{ color: "#9ca3af", marginTop: 12, fontSize: 20 }}>
          interpolate + Easing
        </p>
      </AbsoluteFill>
    );
  }

  if (mode === "parallax") {
    const far = interpolate(frame, [0, 120], [0, -80 * intensity]);
    const near = interpolate(frame, [0, 120], [0, -200 * intensity]);
    return (
      <AbsoluteFill style={{ background: "#0b0c0f", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 40%, ${accent}33, transparent 50%)`,
            transform: `translateX(${far}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "20%",
            top: "35%",
            width: 280,
            height: 180,
            borderRadius: 24,
            background: "#1f2937",
            border: "1px solid rgba(255,255,255,0.1)",
            transform: `translateX(${near * 0.4}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "18%",
            bottom: "28%",
            width: 220,
            height: 140,
            borderRadius: 20,
            background: accent,
            transform: `translateX(${near}px)`,
            boxShadow: `0 30px 80px ${accent}55`,
          }}
        />
        <p
          style={{
            position: "absolute",
            bottom: 48,
            left: 48,
            color: "white",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Parallax layers
        </p>
      </AbsoluteFill>
    );
  }

  if (mode === "shake") {
    const amp = 12 * intensity;
    const shakeX =
      Math.sin(frame * 1.7) * amp * (frame > 10 && frame < 50 ? 1 : 0.15);
    const shakeY =
      Math.cos(frame * 2.1) * amp * (frame > 10 && frame < 50 ? 1 : 0.15);
    return (
      <AbsoluteFill
        style={{
          background: "#0b0c0f",
          justifyContent: "center",
          alignItems: "center",
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <div
          style={{
            padding: "32px 56px",
            borderRadius: 20,
            background: accent,
            color: "white",
            fontSize: 40,
            fontWeight: 800,
          }}
        >
          Camera shake
        </div>
      </AbsoluteFill>
    );
  }

  if (mode === "ease") {
    const t = interpolate(frame, [0, 90], [0, 1], {
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    return (
      <AbsoluteFill style={{ background: "#0b0c0f", padding: 64 }}>
        <div
          style={{
            position: "relative",
            height: 12,
            borderRadius: 999,
            background: "#222",
            marginTop: height / 2 - 70,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: t * (width - 128 - 48),
              top: -18,
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 40px ${accent}`,
            }}
          />
        </div>
        <p
          style={{
            color: "white",
            textAlign: "center",
            marginTop: 80,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          Easing.bezier(0.22, 1, 0.36, 1)
        </p>
      </AbsoluteFill>
    );
  }

  // spring default
  const s = spring({
    frame,
    fps,
    config: {
      damping: 14 / intensity,
      stiffness: 100 * intensity,
      mass: 0.8,
    },
  });
  return (
    <AbsoluteFill
      style={{
        background: "#0b0c0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${s}) rotate(${(1 - s) * -12}deg)`,
          width: 240,
          height: 240,
          borderRadius: 40,
          background: `linear-gradient(145deg, ${accent}, #a78bfa)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 26,
          fontWeight: 800,
        }}
      >
        spring()
      </div>
    </AbsoluteFill>
  );
};
