"use client";

import dynamic from "next/dynamic";

/** Client-only Remotion preview — avoids Turbopack bundling esbuild during SSR. */
export const TemplatePreview = dynamic(
  () =>
    import("./template-preview-player").then((m) => m.TemplatePreviewPlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black/80 text-sm text-muted-foreground">
        Loading preview…
      </div>
    ),
  }
);
