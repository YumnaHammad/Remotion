"use client";

import { Captions } from "lucide-react";
import { LabShell } from "@/components/studio/lab-shell";
import { CaptionDemo } from "@/remotion/compositions/Captions";

const CODE = `import { createTikTokStyleCaptions } from '@remotion/captions';

const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200,
});

const page = pages.find(
  (p) => nowMs >= p.startMs && nowMs < p.startMs + p.durationMs
);

{page.tokens.map((token) => (
  <span style={{
    color: nowMs >= token.fromMs ? '#fbbf24' : '#fff',
    transform: active ? 'scale(1.1)' : 'scale(1)',
  }}>
    {token.text}
  </span>
))}`;

export default function CaptionsPage() {
  return (
    <LabShell
      title="Caption Studio"
      description="TikTok / karaoke captions with word highlighting via @remotion/captions."
      icon={Captions}
      component={CaptionDemo}
      durationInFrames={150}
      compositionWidth={1080}
      compositionHeight={1920}
      code={CODE}
      controls={
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Token-level highlight timing</li>
          <li>Themes: neon · karaoke · minimal · default</li>
          <li>Add caption layers from the editor Text tab</li>
          <li>SRT import/export ready for pipeline extension</li>
        </ul>
      }
    />
  );
}
