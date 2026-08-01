import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
} from "@remotion/captions";
import type { TransformProps, TextStyle } from "@/types";

export type CaptionTheme = "default" | "neon" | "minimal" | "karaoke";

/** Default bottom padding for captions (composition px). Used by canvas overlay too. */
export const CAPTION_BOTTOM_PAD = 140;

const SAMPLE_CAPTIONS: Caption[] = [
  { text: "Create", startMs: 0, endMs: 500, timestampMs: 250, confidence: 1 },
  { text: "stunning", startMs: 500, endMs: 1100, timestampMs: 800, confidence: 1 },
  { text: "videos", startMs: 1100, endMs: 1600, timestampMs: 1350, confidence: 1 },
  { text: "with", startMs: 1600, endMs: 1900, timestampMs: 1750, confidence: 1 },
  { text: "Lumen", startMs: 1900, endMs: 2500, timestampMs: 2200, confidence: 1 },
  { text: "AI", startMs: 2500, endMs: 3200, timestampMs: 2850, confidence: 1 },
];

const DEFAULT_TRANSFORM: TransformProps = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  opacity: 1,
  blur: 0,
};

export const CaptionRenderer: React.FC<{
  captions?: Caption[] | null;
  theme?: CaptionTheme;
  combineMs?: number;
  useSampleFallback?: boolean;
  transform?: TransformProps;
  textStyle?: TextStyle;
}> = ({
  captions: captionsProp,
  theme = "neon",
  combineMs = 1200,
  useSampleFallback = true,
  transform = DEFAULT_TRANSFORM,
  textStyle,
}) => {
  const captions =
    captionsProp && captionsProp.length > 0
      ? captionsProp
      : useSampleFallback
        ? SAMPLE_CAPTIONS
        : null;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!captions) return null;
  const nowMs = (frame / fps) * 1000;

  // 1. Find the active sentence caption item
  const activeCaption = captions.find(
    (c) => nowMs >= c.startMs && nowMs < c.endMs
  );
  if (!activeCaption) return null;

  // 2. Parse active sentence into words and calculate timings
  const words = activeCaption.text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  const sentenceDuration = activeCaption.endMs - activeCaption.startMs;
  const wordDuration = sentenceDuration / words.length;

  const wordsWithTiming = words.map((word, index) => {
    const startMs = activeCaption.startMs + index * wordDuration;
    const endMs = startMs + wordDuration;
    return {
      text: word,
      startMs,
      endMs,
      active: nowMs >= startMs && nowMs < endMs,
      passed: nowMs >= endMs,
    };
  });

  // 3. Group words into lines of max 5 words
  const WORDS_PER_LINE = 5;
  const wordPages: typeof wordsWithTiming[] = [];
  for (let i = 0; i < wordsWithTiming.length; i += WORDS_PER_LINE) {
    wordPages.push(wordsWithTiming.slice(i, i + WORDS_PER_LINE));
  }

  // 4. Find the active page of words
  const activePage =
    wordPages.find((page) =>
      page.some((word) => nowMs >= word.startMs && nowMs < word.endMs)
    ) || wordPages[0]!;

  const bg =
    theme === "neon"
      ? "rgba(10,10,18,0.78)"
      : theme === "minimal"
        ? "transparent"
        : "rgba(0,0,0,0.65)";

  const { x, y, scale, rotation, opacity, blur } = transform;
  const fontFam = textStyle?.fontFamily ?? "Inter";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: CAPTION_BOTTOM_PAD,
        pointerEvents: "none",
        fontFamily: fontFam,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px 18px",
          maxWidth: "80%",
          background: bg,
          padding: theme === "minimal" ? 0 : "12px 24px",
          borderRadius: 16,
          boxShadow: theme === "minimal" ? "none" : "0 10px 30px rgba(0,0,0,0.35)",
          border: theme === "minimal" ? "none" : "1px solid rgba(255,255,255,0.08)",
          opacity,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          fontFamily: fontFam,
        }}
      >
        {activePage.map((word, i) => (
          <span
            key={`${word.text}-${i}`}
            style={{
              fontSize: textStyle?.fontSize ?? 34,
              fontWeight: textStyle?.fontWeight ?? 800,
              letterSpacing: "-0.015em",
              transform: word.active ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.08s ease-out",
              color: word.active
                ? (textStyle?.color ?? (theme === "neon" ? "#fbbf24" : "#22d3ee"))
                : word.passed
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,255,255,0.4)",
              textShadow:
                theme === "neon" && word.active
                  ? `0 0 16px ${textStyle?.color ?? "rgba(251,191,36,0.5)"}`
                  : "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {word.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const CaptionDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#0a0a12" }}>
    <CaptionRenderer />
  </AbsoluteFill>
);
