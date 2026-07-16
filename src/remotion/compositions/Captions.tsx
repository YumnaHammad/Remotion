import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
} from "@remotion/captions";

export type CaptionTheme = "default" | "neon" | "minimal" | "karaoke";

const SAMPLE_CAPTIONS: Caption[] = [
  { text: "Create", startMs: 0, endMs: 500, timestampMs: 250, confidence: 1 },
  { text: "stunning", startMs: 500, endMs: 1100, timestampMs: 800, confidence: 1 },
  { text: "videos", startMs: 1100, endMs: 1600, timestampMs: 1350, confidence: 1 },
  { text: "with", startMs: 1600, endMs: 1900, timestampMs: 1750, confidence: 1 },
  { text: "Lumen", startMs: 1900, endMs: 2500, timestampMs: 2200, confidence: 1 },
  { text: "AI", startMs: 2500, endMs: 3200, timestampMs: 2850, confidence: 1 },
];

export const CaptionRenderer: React.FC<{
  captions?: Caption[];
  theme?: CaptionTheme;
  combineMs?: number;
}> = ({ captions = SAMPLE_CAPTIONS, theme = "neon", combineMs = 1200 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: combineMs,
      }),
    [captions, combineMs]
  );

  const page = pages.find(
    (p) => nowMs >= p.startMs && nowMs < p.startMs + p.durationMs
  );
  if (!page) return null;

  const bg =
    theme === "neon"
      ? "rgba(99,102,241,0.85)"
      : theme === "minimal"
        ? "transparent"
        : theme === "karaoke"
          ? "rgba(0,0,0,0.8)"
          : "rgba(0,0,0,0.65)";

  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 140 }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          maxWidth: "82%",
          background: bg,
          padding: theme === "minimal" ? 0 : "16px 28px",
          borderRadius: 18,
        }}
      >
        {page.tokens.map((token, i) => {
          const active = nowMs >= token.fromMs && nowMs < token.toMs;
          const passed = nowMs >= token.toMs;
          return (
            <span
              key={`${token.text}-${i}`}
              style={{
                fontSize: 46,
                fontWeight: 800,
                transform: active ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.1s",
                color: active
                  ? theme === "neon"
                    ? "#fbbf24"
                    : "#22d3ee"
                  : passed
                    ? "#ffffff"
                    : "rgba(255,255,255,0.45)",
                textShadow:
                  theme === "neon" && active
                    ? "0 0 24px #fbbf24"
                    : "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a0a12" }}>
    <CaptionRenderer />
  </AbsoluteFill>
);
