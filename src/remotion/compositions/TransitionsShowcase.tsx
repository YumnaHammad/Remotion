import React from "react";
import { AbsoluteFill, Sequence, Series, useVideoConfig } from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { Project } from "@/types";
import { AnimatedText } from "../components/AnimatedText";
import { ParticleField } from "../components/ParticleField";

/**
 * Demo composition showcasing @remotion/transitions package.
 */
export const TransitionsShowcase: React.FC<{ project?: Project }> = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ width, height, backgroundColor: "#050508" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={60}>
          <AbsoluteFill
            style={{
              background: "linear-gradient(135deg,#0f172a,#312e81)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ParticleField density={16} />
            <div style={{ fontSize: 72, fontWeight: 900, color: "#fff" }}>
              Fade In
            </div>
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={60}>
          <AbsoluteFill
            style={{
              background: "linear-gradient(135deg,#042f2e,#0e7490)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 72, fontWeight: 900, color: "#fff" }}>
              Slide
            </div>
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={60}>
          <AbsoluteFill
            style={{
              background: "linear-gradient(135deg,#1a0a14,#831843)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 72, fontWeight: 900, color: "#fff" }}>
              Wipe
            </div>
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        <TransitionSeries.Sequence durationInFrames={60}>
          <AbsoluteFill
            style={{
              background: "#0a0a0f",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AnimatedText
              text="LUMEN"
              animation="split-text"
              animationDuration={30}
              transform={{
                x: 0,
                y: 0,
                scale: 1,
                rotation: 0,
                opacity: 1,
                blur: 0,
              }}
              style={{
                fontFamily: "Inter",
                fontSize: 96,
                fontWeight: 900,
                color: "#fff",
                align: "center",
                lineHeight: 1,
                letterSpacing: -2,
                gradient: "linear-gradient(135deg,#fff,#a5b4fc)",
              }}
            />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

/** Nested sequences example: Intro → Middle → Outro */
export const NestedSequences: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#05060a" }}>
      <Series>
        <Series.Sequence durationInFrames={45} name="Intro">
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              background: "#111827",
            }}
          >
            <div style={{ color: "#fff", fontSize: 48, fontWeight: 800 }}>
              Intro
            </div>
          </AbsoluteFill>
        </Series.Sequence>
        <Series.Sequence durationInFrames={60} name="Middle">
          <Sequence from={10} durationInFrames={40} name="Delayed CTA">
            <AbsoluteFill
              style={{ justifyContent: "center", alignItems: "center" }}
            >
              <div style={{ color: "#22d3ee", fontSize: 56, fontWeight: 800 }}>
                Middle · Delayed
              </div>
            </AbsoluteFill>
          </Sequence>
        </Series.Sequence>
        <Series.Sequence durationInFrames={45} name="Outro">
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              background: "#1e1b4b",
            }}
          >
            <div style={{ color: "#fff", fontSize: 48, fontWeight: 800 }}>
              Outro
            </div>
          </AbsoluteFill>
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
