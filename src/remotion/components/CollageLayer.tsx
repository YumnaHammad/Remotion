import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import type { Layer } from "@/types";
import { useAnimatedStyle } from "./AnimatedText";
import { filtersToCss } from "./filters";
import {
  collageGridStyle,
  enhanceToCss,
  maskToStyle,
  stabilizeTransform,
} from "@/lib/media-tools";
import { SAMPLE_IMAGE } from "@/data/mock";

/**
 * Multi-cell collage layout rendered as one Remotion layer.
 */
export function CollageLayer({ layer }: { layer: Layer }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const animated = useAnimatedStyle(
    layer.animation,
    layer.animationDuration,
    layer.transform
  );
  const maskStyle = maskToStyle(layer.mask);
  const enhanceCss = enhanceToCss(layer.enhance);
  const baseFilter = filtersToCss(layer.filters, layer.transform.blur);
  const filter = [baseFilter, enhanceCss].filter(Boolean).join(" ");
  const stab = stabilizeTransform(frame, layer.stabilize);

  const sources =
    layer.collageSources?.length ?
      layer.collageSources
    : Array.from(
        { length: layer.collageCells ?? 4 },
        () => ({ src: layer.src ?? SAMPLE_IMAGE, fit: "cover" as const })
      );

  const layout = layer.collageLayout ?? "grid-2x2";
  const grid = collageGridStyle(layout, sources.length);
  const isPip = layout === "pip";

  return (
    <AbsoluteFill
      style={{
        opacity: animated.opacity,
        transform: [animated.transform, stab].filter(Boolean).join(" "),
        filter: filter || undefined,
        mixBlendMode: layer.blendMode ?? "normal",
        ...maskStyle,
      }}
    >
      {isPip ? (
        <AbsoluteFill>
          <Img
            src={sources[0]?.src ?? SAMPLE_IMAGE}
            style={{ width, height, objectFit: sources[0]?.fit ?? "cover" }}
          />
          {sources[1] && (
            <div
              style={{
                position: "absolute",
                right: width * 0.06,
                bottom: height * 0.08,
                width: width * 0.28,
                height: height * 0.28,
                borderRadius: 16,
                overflow: "hidden",
                border: "3px solid rgba(255,255,255,0.85)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              }}
            >
              <Img
                src={sources[1].src}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: sources[1].fit ?? "cover",
                }}
              />
            </div>
          )}
        </AbsoluteFill>
      ) : (
        <div
          style={{
            display: "grid",
            width: "100%",
            height: "100%",
            gap: 6,
            padding: 6,
            boxSizing: "border-box",
            gridTemplateColumns: grid.gridTemplateColumns,
            gridTemplateRows: grid.gridTemplateRows,
            background: "#0a0a0c",
          }}
        >
          {sources.map((cell, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 8,
                minHeight: 0,
                minWidth: 0,
              }}
            >
              <Img
                src={cell.src || SAMPLE_IMAGE}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: cell.fit ?? "cover",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
}
