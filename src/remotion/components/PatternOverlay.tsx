import { AbsoluteFill } from "remotion";
import type { PatternType } from "@/types/editing-tools";

const PATTERN_CSS: Record<PatternType, string> = {
  dots: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
  grid: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
  lines: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 2px, transparent 2px, transparent 12px)",
  waves: "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 24px)",
  noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
  checker: "conic-gradient(rgba(255,255,255,0.06) 90deg, transparent 90deg 180deg, rgba(255,255,255,0.06) 180deg 270deg, transparent 270deg)",
  diagonal: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 4px, transparent 4px, transparent 16px)",
};

export function PatternOverlay({
  pattern = "dots",
  opacity = 0.5,
}: {
  pattern?: PatternType;
  opacity?: number;
}) {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: PATTERN_CSS[pattern],
        backgroundSize:
          pattern === "dots"
            ? "16px 16px"
            : pattern === "grid"
              ? "24px 24px"
              : "auto",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}
