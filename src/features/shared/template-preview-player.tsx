"use client";

import { Player } from "@remotion/player";
import { getCompositionComponent } from "@/templates/composition-map";
import { getCompositionDimensions } from "@/templates/catalog";

export interface TemplatePreviewPlayerProps {
  compositionId: string;
  inputProps: Record<string, unknown>;
  className?: string;
  durationInFrames?: number;
  width?: number;
  height?: number;
  fps?: number;
  playerRef?: React.RefObject<any>;
}

/** Inner player — loaded client-only via next/dynamic to avoid Turbopack SSR issues. */
export function TemplatePreviewPlayer({
  compositionId,
  inputProps,
  className,
  durationInFrames: durationOverride,
  width: widthOverride,
  height: heightOverride,
  fps: fpsOverride,
  playerRef,
}: TemplatePreviewPlayerProps) {
  const Component = getCompositionComponent(compositionId);
  const dims = getCompositionDimensions(compositionId);
  const durationInFrames = durationOverride ?? dims.durationInFrames;
  const width = widthOverride ?? dims.width;
  const height = heightOverride ?? dims.height;
  const fps = fpsOverride ?? dims.fps;

  return (
    <div
      className={className}
      style={{
        aspectRatio: `${width} / ${height}`,
        maxHeight: "100%",
        maxWidth: "100%",
        width: height > width ? "auto" : "100%",
        height: height > width ? "100%" : "auto",
      }}
    >
      <Player
        ref={playerRef}
        component={Component}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={fps}
        style={{ width: "100%", height: "100%" }}
        controls
        loop
        acknowledgeRemotionLicense
        errorFallback={({ error }) => (
          <div className="flex h-full items-center justify-center bg-black p-4 text-center text-sm text-red-300">
            Preview error: {error.message}
          </div>
        )}
      />
    </div>
  );
}
