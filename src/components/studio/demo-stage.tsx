"use client";

import { useMemo } from "react";
import { Player } from "@remotion/player";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface DemoStageProps<T extends Record<string, unknown>> {
  component: ComponentType<T>;
  inputProps?: T;
  durationInFrames: number;
  fps?: number;
  compositionWidth: number;
  compositionHeight: number;
  className?: string;
  controls?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
}

/**
 * Premium framed Remotion <Player> for showcase/lab previews. Keeps the
 * composition aspect ratio while filling the available width.
 */
export function DemoStage<T extends Record<string, unknown>>({
  component,
  inputProps,
  durationInFrames,
  fps = 30,
  compositionWidth,
  compositionHeight,
  className,
  controls = true,
  loop = true,
  autoPlay = true,
}: DemoStageProps<T>) {
  // Player requires a stable object reference to avoid remounting each render.
  const props = useMemo(
    () => inputProps ?? ({} as T),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(inputProps ?? {})]
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_center,#12141c_0%,#050608_75%)] shadow-2xl shadow-black/50 ring-1 ring-white/5",
        className
      )}
      style={{ aspectRatio: `${compositionWidth} / ${compositionHeight}` }}
    >
      <Player
        component={component as ComponentType<Record<string, unknown>>}
        inputProps={props}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={compositionWidth}
        compositionHeight={compositionHeight}
        style={{ width: "100%", height: "100%" }}
        controls={controls}
        loop={loop}
        autoPlay={autoPlay}
        clickToPlay
        acknowledgeRemotionLicense
      />
    </div>
  );
}
