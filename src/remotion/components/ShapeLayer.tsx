import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Arrow,
  Circle,
  Ellipse,
  Heart,
  Pie,
  Polygon,
  Rect,
  Star,
  Triangle,
} from "@remotion/shapes";
import type { Layer } from "@/types";
import { useAnimatedStyle } from "./AnimatedText";
import { filtersToCss } from "./filters";

/**
 * Renders vector shapes via @remotion/shapes with animation + filters.
 */
export function ShapeLayer({ layer }: { layer: Layer }) {
  const frame = useCurrentFrame();
  const animated = useAnimatedStyle(
    layer.animation,
    layer.animationDuration,
    layer.transform
  );

  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.04, 1]);
  const size = 220 * pulse;
  const fill = layer.fill ?? "#6366f1";
  const stroke = layer.stroke;
  const strokeWidth = layer.strokeWidth ?? 0;

  const common = { fill, stroke, strokeWidth };

  const shape = (() => {
    switch (layer.shape) {
      case "circle":
        return <Circle radius={size / 2} {...common} />;
      case "ellipse":
        return <Ellipse rx={size / 2} ry={size / 3} {...common} />;
      case "triangle":
        return <Triangle length={size} direction="up" {...common} />;
      case "star":
        return <Star innerRadius={size / 4} outerRadius={size / 2} points={5} {...common} />;
      case "polygon":
        return <Polygon points={6} radius={size / 2} {...common} />;
      case "heart":
        return <Heart height={size} {...common} />;
      case "pie":
        return <Pie radius={size / 2} progress={interpolate(frame % 90, [0, 90], [0, 1])} {...common} />;
      case "arrow":
        return <Arrow direction="right" length={size} {...common} />;
      case "rect":
      default:
        return <Rect width={size * 1.4} height={size} cornerRadius={20} {...common} />;
    }
  })();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: animated.opacity,
        transform: animated.transform,
        filter: filtersToCss(layer.filters, layer.transform.blur),
      }}
    >
      {shape}
    </AbsoluteFill>
  );
}
