"use client";

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { VisemeCode, VisemeCue, LandmarkFrame } from "@/types/feature-stack";
import { visemeAtMs, visemeMouthOpen } from "@/lib/visemes";

const MOUTH_PATHS: Record<VisemeCode, string> = {
  X: "M 40 78 Q 50 80 60 78",
  A: "M 38 76 Q 50 78 62 76 Q 50 82 38 76",
  B: "M 36 74 Q 50 86 64 74 Q 50 92 36 74",
  C: "M 34 72 Q 50 92 66 72 Q 50 98 34 72",
  D: "M 32 70 Q 50 102 68 70 Q 50 108 32 70",
  E: "M 34 68 Q 50 96 66 68 Q 50 100 34 68",
  F: "M 38 74 L 62 74 L 62 78 L 38 78 Z",
};

function controlsFromLandmarks(
  landmarks: LandmarkFrame[] | undefined,
  frame: number
): LandmarkFrame["controls"] | undefined {
  if (!landmarks?.length) return undefined;
  let best = landmarks[0];
  let bestDist = Math.abs(best.frame - frame);
  for (const lm of landmarks) {
    const d = Math.abs(lm.frame - frame);
    if (d < bestDist) {
      best = lm;
      bestDist = d;
    }
  }
  return best.controls;
}

export interface CartoonCharacterProps {
  visemes?: VisemeCue[];
  landmarks?: LandmarkFrame[];
  accent?: string;
  skin?: string;
  shirt?: string;
  hair?: string;
  /** Bottom-aligned character scale */
  scale?: number;
}

/**
 * Procedural 2D cartoon actor with lip-sync + MediaPipe puppet controls.
 * Works offline without a .riv file; RiveCharacterLayer wraps this when no Rive asset.
 */
export const CartoonCharacter: React.FC<CartoonCharacterProps> = ({
  visemes = [],
  landmarks,
  accent = "#0b84f3",
  skin = "#f5d0b0",
  shirt = "#1e3a5f",
  hair = "#1a1a2e",
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeMs = (frame / fps) * 1000;

  const puppet = controlsFromLandmarks(landmarks, frame);
  const viseme = visemeAtMs(visemes, timeMs);
  const mouthOpen = puppet?.mouthOpen ?? visemeMouthOpen(viseme);
  const smile = puppet?.smile ?? 0;
  const brow = puppet?.browRaise ?? 0;
  const yaw = (puppet?.headYaw ?? 0) * 18;
  const pitch = (puppet?.headPitch ?? 0) * 10;
  const blink = frame % 90 < 4 ? 0.08 : 1;
  const armL = puppet?.armLeft ?? 0.15 + Math.sin(frame / 40) * 0.05;
  const armR = puppet?.armRight ?? 0.15 + Math.cos(frame / 38) * 0.05;

  const mouthCode: VisemeCode =
    mouthOpen > 0.7 ? "D" : mouthOpen > 0.5 ? "E" : mouthOpen > 0.3 ? "C" : mouthOpen > 0.1 ? "B" : viseme === "A" || viseme === "F" ? viseme : "X";

  const mouthPath = useMemo(() => MOUTH_PATHS[mouthCode], [mouthCode]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "4%",
      }}
    >
      <svg
        width={280 * scale}
        height={420 * scale}
        viewBox="0 0 100 150"
        style={{
          transform: `rotateY(${yaw}deg) rotateX(${-pitch}deg)`,
          transformOrigin: "50% 40%",
          filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.35))",
        }}
      >
        {/* Legs */}
        <rect x="38" y="118" width="10" height="28" rx="4" fill="#2a2f45" />
        <rect x="52" y="118" width="10" height="28" rx="4" fill="#2a2f45" />
        {/* Body */}
        <rect x="30" y="78" width="40" height="42" rx="12" fill={shirt} />
        <circle cx="50" cy="78" r="8" fill={accent} opacity={0.9} />
        {/* Arms */}
        <g transform={`rotate(${-25 - armL * 50} 32 82)`}>
          <rect x="18" y="78" width="16" height="8" rx="4" fill={skin} />
        </g>
        <g transform={`rotate(${25 + armR * 50} 68 82)`}>
          <rect x="66" y="78" width="16" height="8" rx="4" fill={skin} />
        </g>
        {/* Head */}
        <ellipse cx="50" cy="48" rx="28" ry="30" fill={skin} />
        {/* Hair */}
        <path
          d="M 24 42 Q 50 8 76 42 Q 70 28 50 26 Q 30 28 24 42"
          fill={hair}
        />
        {/* Brows */}
        <path
          d={`M 32 ${36 - brow * 4} Q 40 ${34 - brow * 6} 46 ${36 - brow * 4}`}
          stroke="#1a1a2e"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 54 ${36 - brow * 4} Q 60 ${34 - brow * 6} 68 ${36 - brow * 4}`}
          stroke="#1a1a2e"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Eyes */}
        <ellipse cx="38" cy="48" rx="5" ry={5 * blink} fill="#1a1a2e" />
        <ellipse cx="62" cy="48" rx="5" ry={5 * blink} fill="#1a1a2e" />
        <circle cx="39.5" cy={47 * blink + 48 * (1 - blink)} r={1.5 * blink} fill="#fff" />
        <circle cx="63.5" cy={47 * blink + 48 * (1 - blink)} r={1.5 * blink} fill="#fff" />
        {/* Cheeks */}
        <ellipse cx="30" cy="58" rx="4" ry="2.5" fill="#f8a0a0" opacity={0.35 + smile * 0.3} />
        <ellipse cx="70" cy="58" rx="4" ry="2.5" fill="#f8a0a0" opacity={0.35 + smile * 0.3} />
        {/* Mouth */}
        <path
          d={mouthPath}
          stroke="#5c3a2e"
          strokeWidth="2.2"
          fill={mouthOpen > 0.15 ? "#3a1f1a" : "none"}
          strokeLinecap="round"
          transform={smile > 0.3 ? "translate(0 -1)" : undefined}
        />
      </svg>
    </AbsoluteFill>
  );
};
