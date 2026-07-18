import { Suspense } from "react";
import { AudioLibraryFeature } from "@/features/audio/audio-library-page";

export default function AudioPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading audio library…</div>}>
      <AudioLibraryFeature />
    </Suspense>
  );
}
