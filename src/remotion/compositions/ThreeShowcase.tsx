import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";

function FloatingCard({
  position,
  color,
  speed,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const frame = useCurrentFrame();
  const y = position[1] + Math.sin(frame / speed) * 0.3;
  const rot = frame / 40;

  return (
    <mesh position={[position[0], y, position[2]]} rotation={[rot * 0.3, rot, 0]}>
      <boxGeometry args={[1.2, 1.6, 0.08]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
    </mesh>
  );
}

function Scene3D() {
  const frame = useCurrentFrame();

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#818cf8" />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color="#22d3ee" />
      <FloatingCard position={[-1.8, 0, 0]} color="#6366f1" speed={18} />
      <FloatingCard position={[0, 0.2, -0.5]} color="#22d3ee" speed={22} />
      <FloatingCard position={[1.8, -0.1, 0.2]} color="#f472b6" speed={16} />
      <mesh rotation={[frame / 60, frame / 80, 0]}>
        <torusGeometry args={[2.4, 0.02, 16, 100]} />
        <meshStandardMaterial color="#334155" emissive="#1e293b" />
      </mesh>
    </>
  );
}

export const ThreeShowcase: React.FC<{ title?: string }> = ({
  title = "3D Showcase",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const camZ = interpolate(frame, [0, 90], [6, 4], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#05060a" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, camZ], fov: 50 }}>
        <Scene3D />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 80,
          opacity,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, color: "#fff" }}>{title}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
