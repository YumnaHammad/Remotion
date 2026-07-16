import { AbsoluteFill, useCurrentFrame } from "remotion";
import { noise2D, noise3D } from "@remotion/noise";
import { filtersToCss } from "./filters";
import type { Layer } from "@/types";

/**
 * Procedural animated gradient mesh driven by @remotion/noise.
 */
export function NoiseBackground({ layer }: { layer?: Layer }) {
  const frame = useCurrentFrame();
  const color = layer?.fill ?? "#6366f1";

  const dots = Array.from({ length: 48 }, (_, i) => {
    const x = noise3D("x", i * 0.3, frame * 0.01, 0) * 50 + 50;
    const y = noise3D("y", i * 0.3, frame * 0.01, 1) * 50 + 50;
    const s = (noise2D("s", i, frame * 0.02) + 1) * 6 + 2;
    const o = (noise2D("o", i * 2, frame * 0.015) + 1) * 0.25;
    return (
      <circle
        key={i}
        cx={`${x}%`}
        cy={`${y}%`}
        r={s}
        fill={color}
        opacity={o}
      />
    );
  });

  return (
    <AbsoluteFill
      style={{
        opacity: layer?.transform.opacity ?? 1,
        filter: filtersToCss(layer?.filters),
      }}
    >
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {dots}
      </svg>
    </AbsoluteFill>
  );
}
