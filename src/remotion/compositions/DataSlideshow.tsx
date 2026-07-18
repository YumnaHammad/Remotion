import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { DataVideoSchemaProps } from "./data-slideshow-schema";

const DEFAULT_FONT = "Inter, system-ui, sans-serif";

const FRAMES_PER_SLIDE = 60;

/**
 * Renders one slide per data row — ideal for reports, product lists, stats.
 * Columns: first column = headline, second = body (falls back gracefully).
 */
export const DataSlideshow: React.FC<Partial<DataVideoSchemaProps>> = (raw) => {
  const props = {
    title: "Data Report",
    subtitle: "Your spreadsheet, animated",
    accent: "#0b84f3",
    brandColor: "#6366f1",
    rows: [] as DataVideoSchemaProps["rows"],
    columns: [] as string[],
    fontFamily: DEFAULT_FONT,
    ...raw,
  };

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const font = props.fontFamily ?? DEFAULT_FONT;
  const rows = props.rows.slice(0, 8);
  const headlineCol = props.columns[0] ?? "title";
  const bodyCol = props.columns[1] ?? props.columns[0];

  const introOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${props.brandColor}22, #0a0a0f)`,
        fontFamily: font,
      }}
    >
      {/* Title card */}
      <Sequence from={0} durationInFrames={FRAMES_PER_SLIDE}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 80,
            opacity: introOpacity,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 800, color: "#fff", textAlign: "center" }}>
            {props.title}
          </div>
          <div style={{ fontSize: 28, color: props.accent, marginTop: 20, textAlign: "center" }}>
            {props.subtitle}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* One slide per row */}
      {rows.map((row, i) => {
        const from = FRAMES_PER_SLIDE + i * FRAMES_PER_SLIDE;
        const headline = String(row[headlineCol] ?? `Row ${i + 1}`);
        const body = bodyCol ? String(row[bodyCol] ?? "") : "";
        const slideFrame = frame - from;
        const scale = spring({
          frame: Math.max(0, slideFrame),
          fps,
          config: { damping: 14 },
        });

        return (
          <Sequence key={i} from={from} durationInFrames={FRAMES_PER_SLIDE}>
            <AbsoluteFill
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: 100,
              }}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  textAlign: "center",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {headline}
                </div>
                {body && (
                  <div
                    style={{
                      fontSize: 28,
                      color: "#94a3b8",
                      marginTop: 24,
                      lineHeight: 1.5,
                    }}
                  >
                    {body}
                  </div>
                )}
                <div
                  style={{
                    marginTop: 32,
                    height: 4,
                    width: 120,
                    marginLeft: "auto",
                    marginRight: "auto",
                    borderRadius: 2,
                    background: props.accent,
                  }}
                />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
