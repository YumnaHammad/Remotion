"use client";

import { Box } from "lucide-react";
import { LabShell } from "@/components/studio/lab-shell";
import { ThreeShowcase } from "@/remotion/compositions/ThreeShowcase";

const CODE = `import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { width, height } = useVideoConfig();

<ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 5] }}>
  <ambientLight intensity={0.6} />
  <directionalLight position={[4, 4, 2]} />
  <mesh rotation={[frame * 0.02, frame * 0.03, 0]}>
    <boxGeometry args={[1.4, 1.4, 1.4]} />
    <meshStandardMaterial color="#0b84f3" />
  </mesh>
</ThreeCanvas>`;

export default function ThreeStudioPage() {
  return (
    <LabShell
      title="3D Studio"
      description="@remotion/three — floating cards, rotating products, lighting, camera paths."
      icon={Box}
      component={ThreeShowcase}
      inputProps={{ title: "3D Product Orbit" }}
      durationInFrames={120}
      compositionWidth={1920}
      compositionHeight={1080}
      code={CODE}
      controls={
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>ThreeCanvas synced to Remotion frame</li>
          <li>React Three Fiber materials & lights</li>
          <li>Orbit / product reveal patterns</li>
          <li>Registered as ThreeShowcase composition</li>
        </ul>
      }
    />
  );
}
