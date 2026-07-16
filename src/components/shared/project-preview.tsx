"use client";

import { Thumbnail } from "@remotion/player";
import { MainComposition } from "@/remotion/compositions/MainComposition";
import { GRADIENTS } from "@/data/mock";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

/**
 * Live Remotion frame preview for a project card. Renders a single frame via
 * <Thumbnail> (cheap) and falls back to the gradient thumbnail on error or
 * when the project has no renderable layers.
 */
export function ProjectPreview({
  project,
  frame,
  className,
  children,
}: {
  project: Project;
  frame?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const { width, height, fps, durationInFrames } = project.settings;
  const showThumb = project.layers.length > 0;
  const at = frame ?? Math.min(Math.floor(durationInFrames / 3), durationInFrames - 1);

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl aspect-video", className)}
      style={{
        background:
          GRADIENTS[project.thumbnail ?? "gradient-1"] ?? GRADIENTS["gradient-1"],
      }}
    >
      {showThumb && (
        <div className="absolute inset-0">
          <Thumbnail
            component={MainComposition}
            inputProps={{ project }}
            durationInFrames={durationInFrames}
            compositionWidth={width}
            compositionHeight={height}
            fps={fps}
            frameToDisplay={at}
            style={{ width: "100%", height: "100%" }}
            errorFallback={() => null}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
      {children}
    </div>
  );
}
