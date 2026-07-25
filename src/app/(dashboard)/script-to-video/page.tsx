import { Suspense } from "react";
import { ScriptToVideoFeature } from "@/features/script-to-video/script-to-video-page";

export default function ScriptToVideoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl p-6 text-sm text-muted-foreground">
          Loading Script to Video…
        </div>
      }
    >
      <ScriptToVideoFeature />
    </Suspense>
  );
}
