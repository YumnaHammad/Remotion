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
      description="TikTok / karaoke captions via @remotion/captions, with local faster-whisper or whisper.cpp transcription."
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
          <li>
            faster-whisper:{" "}
            <code className="text-xs">npm run faster-whisper:install</code>
          </li>
          <li>
            whisper.cpp fallback:{" "}
            <code className="text-xs">npm run whisper:install</code>
          </li>
          <li>Toggle engine in the editor Text tab before Transcribe audio</li>
        </ul>
      }
    />
  );
}
