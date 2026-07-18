"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { LabShell } from "@/components/studio/lab-shell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PrimitivesLab,
  type PrimitiveMode,
} from "@/remotion/labs/PrimitivesLab";

const MODES: PrimitiveMode[] = [
  "sequence",
  "series",
  "loop",
  "freeze",
  "interpolate",
  "spring",
];

const CODE: Record<PrimitiveMode, string> = {
  sequence: `<Sequence from={0} durationInFrames={40}>
  <Scene />
</Sequence>`,
  series: `<Series>
  <Series.Sequence durationInFrames={40}>
    <A />
  </Series.Sequence>
  <Series.Sequence durationInFrames={40}>
    <B />
  </Series.Sequence>
</Series>`,
  loop: `<Loop durationInFrames={30}>
  <Pulse />
</Loop>`,
  freeze: `<Freeze frame={45}>
  <MovingScene />
</Freeze>`,
  interpolate: `const x = interpolate(frame, [0, 90], [-400, 400], {
  extrapolateRight: 'clamp',
});`,
  spring: `const scale = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 120 },
});`,
};

export default function PrimitivesPage() {
  const [mode, setMode] = useState<PrimitiveMode>("sequence");

  return (
    <LabShell
      title="Primitives Lab"
      description="Live demos of Remotion core building blocks — Sequence, Series, Loop, Freeze, interpolate, spring."
      icon={Layers}
      component={PrimitivesLab}
      inputProps={{ mode, accent: "#0b84f3" }}
      durationInFrames={120}
      code={CODE[mode]}
      controls={
        <div className="space-y-1.5">
          <Label>Primitive</Label>
          <Select
            value={mode}
            onValueChange={(v) => setMode(v as PrimitiveMode)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    />
  );
}
