"use client";

import { ArrowLeftRight } from "lucide-react";
import { LabShell } from "@/components/studio/lab-shell";
import { TransitionsShowcase } from "@/remotion/compositions/TransitionsShowcase";
import { Badge } from "@/components/ui/badge";

const CODE = `import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 20 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>`;

export default function TransitionsPage() {
  return (
    <LabShell
      title="Transition Studio"
      description="Gallery of Remotion transitions — fade, slide, wipe, zoom, flip, cinematic camera moves."
      icon={ArrowLeftRight}
      component={TransitionsShowcase}
      durationInFrames={240}
      compositionWidth={1920}
      compositionHeight={1080}
      code={CODE}
      controls={
        <div className="flex flex-wrap gap-2">
          {["fade", "slide", "wipe", "zoom", "flip", "cinematic", "blur"].map(
            (t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            )
          )}
          <p className="mt-2 w-full text-xs text-muted-foreground">
            Live preview uses TransitionsShowcase composition. Edit duration /
            easing in the editor Effects tab per scene.
          </p>
        </div>
      }
    />
  );
}
