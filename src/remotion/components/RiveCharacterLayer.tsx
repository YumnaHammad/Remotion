"use client";

import React, { useEffect } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { CartoonCharacter } from "./CartoonCharacter";
import type { LandmarkFrame, VisemeCue } from "@/types/feature-stack";
import { visemeAtMs, visemeMouthOpen } from "@/lib/visemes";

export interface RiveCharacterLayerProps {
  riveSrc?: string;
  stateMachine?: string;
  visemes?: VisemeCue[];
  landmarks?: LandmarkFrame[];
  accent?: string;
  brandColor?: string;
  skin?: string;
  hair?: string;
  scale?: number;
}

/**
 * Rive character when a .riv URL is provided; otherwise procedural cartoon.
 * Drives mouthOpen / smile inputs from visemes or MediaPipe controls.
 */
export const RiveCharacterLayer: React.FC<RiveCharacterLayerProps> = ({
  riveSrc,
  stateMachine = "State Machine 1",
  visemes,
  landmarks,
  accent,
  brandColor,
  skin,
  hair,
  scale,
}) => {
  if (!riveSrc) {
    return (
      <CartoonCharacter
        visemes={visemes}
        landmarks={landmarks}
        accent={accent}
        shirt={brandColor}
        skin={skin}
        hair={hair}
        scale={scale}
      />
    );
  }

  return (
    <RiveDrivenCharacter
      riveSrc={riveSrc}
      stateMachine={stateMachine}
      visemes={visemes}
      landmarks={landmarks}
      accent={accent}
      brandColor={brandColor}
    />
  );
};

function RiveDrivenCharacter({
  riveSrc,
  stateMachine,
  visemes = [],
  landmarks,
  accent,
  brandColor,
}: Required<Pick<RiveCharacterLayerProps, "riveSrc">> &
  RiveCharacterLayerProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = React.useState(() =>
    delayRender("Loading Rive character")
  );

  const { rive, RiveComponent } = useRive({
    src: riveSrc,
    stateMachines: stateMachine,
    autoplay: true,
    onLoad: () => continueRender(handle),
    onLoadError: () => continueRender(handle),
  });

  const mouthInput = useStateMachineInput(rive, stateMachine, "mouthOpen");
  const smileInput = useStateMachineInput(rive, stateMachine, "smile");

  useEffect(() => {
    const timeMs = (frame / fps) * 1000;
    const puppet = landmarks?.length
      ? landmarks.reduce((best, lm) =>
          Math.abs(lm.frame - frame) < Math.abs(best.frame - frame) ? lm : best
        ).controls
      : undefined;

    const open =
      puppet?.mouthOpen ??
      visemeMouthOpen(visemeAtMs(visemes, timeMs));
    if (mouthInput) mouthInput.value = open;
    if (smileInput) smileInput.value = puppet?.smile ?? 0;
  }, [frame, fps, visemes, landmarks, mouthInput, smileInput]);

  if (!rive) {
    return (
      <CartoonCharacter
        visemes={visemes}
        landmarks={landmarks}
        accent={accent}
        shirt={brandColor}
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "45%", height: "55%" }}>
        <RiveComponent />
      </div>
    </AbsoluteFill>
  );
}
