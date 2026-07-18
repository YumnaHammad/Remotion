"use client";

import { Player } from "@remotion/player";
import { getCompositionComponent } from "@/templates/composition-map";
import { getCompositionDimensions } from "@/templates/catalog";

interface TemplatePreviewPlayerProps {
  compositionId: string;
  inputProps: Record<string, unknown>;
  className?: string;
  durationInFrames?: number;
}

/** Inner player — loaded client-only via next/dynamic to avoid Turbopack SSR issues. */
export function TemplatePreviewPlayer({
  compositionId,
  inputProps,
  className,
  durationInFrames: durationOverride,
}: TemplatePreviewPlayerProps) {
  const Component = getCompositionComponent(compositionId);
  const dims = getCompositionDimensions(compositionId);
  const durationInFrames = durationOverride ?? dims.durationInFrames;

  return (
    <div
      className={className}
      style={{
        aspectRatio: `${dims.width} / ${dims.height}`,
        maxHeight: "100%",
        maxWidth: "100%",
        width: dims.height > dims.width ? "auto" : "100%",
        height: dims.height > dims.width ? "100%" : "auto",
      }}
    >
      <Player
        component={Component}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        compositionWidth={dims.width}
        compositionHeight={dims.height}
        fps={dims.fps}
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
