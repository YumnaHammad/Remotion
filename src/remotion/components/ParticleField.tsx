import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export function ParticleField({ density = 20 }: { density?: number }) {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: density }, (_, i) => {
    const x = ((i * 137.5) % 100);
    const baseY = ((i * 89.3) % 100);
    const drift = interpolate(frame + i * 3, [0, 120], [0, 30], {
      extrapolateRight: "extend",
    });
    const y = (baseY + drift) % 110 - 5;
    const size = 2 + (i % 4);
    const opacity = 0.15 + (i % 5) * 0.08;

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: i % 3 === 0 ? "#818cf8" : i % 3 === 1 ? "#22d3ee" : "#f472b6",
          opacity,
        }}
      />
    );
  });

  return <AbsoluteFill style={{ pointerEvents: "none" }}>{particles}</AbsoluteFill>;
}
