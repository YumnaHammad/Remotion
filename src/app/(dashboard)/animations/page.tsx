"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { LabShell } from "@/components/studio/lab-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AnimationLab,
  type AnimMode,
} from "@/remotion/labs/AnimationLab";

const MODES: AnimMode[] = [
  "spring",
  "ease",
  "typewriter",
  "counter",
  "parallax",
  "shake",
];

const CODE: Record<AnimMode, string> = {
  spring: `const scale = spring({
  frame,
  fps,
  config: { damping: 12, stiffness: 120 },
});`,
  ease: `interpolate(frame, [0, 90], [0, 1], {
  easing: Easing.bezier(0.22, 1, 0.36, 1),
});`,
  typewriter: `const chars = Math.floor(
  interpolate(frame, [0, 60], [0, text.length])
);`,
  counter: `interpolate(frame, [0, 90], [0, 10000], {
  easing: Easing.out(Easing.cubic),
});`,
  parallax: `const near = interpolate(frame, [0, 120], [0, -200]);
const far = interpolate(frame, [0, 120], [0, -80]);`,
  shake: `const x = Math.sin(frame * 1.7) * amplitude;
const y = Math.cos(frame * 2.1) * amplitude;`,
};

export default function AnimationsPage() {
  const [mode, setMode] = useState<AnimMode>("spring");
  const [intensity, setIntensity] = useState(1);

  return (
    <LabShell
      title="Animation Lab"
      description="Interactive playground for spring, interpolate, Easing, typewriter, counter, parallax, and camera shake."
      icon={Wand2}
      component={AnimationLab}
      inputProps={{
        mode,
        intensity,
        accent: "#0b84f3",
        text: "Make videos programmatically with Remotion",
      }}
      durationInFrames={120}
      code={CODE[mode]}
      controls={
        <>
          <div className="space-y-1.5">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as AnimMode)}>
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
          <div className="space-y-1.5">
            <Label>Intensity · {intensity.toFixed(2)}</Label>
            <Slider
              value={[intensity]}
              min={0.4}
              max={2}
              step={0.05}
              onValueChange={([v]) => setIntensity(v)}
            />
          </div>
        </>
      }
    />
  );
}
