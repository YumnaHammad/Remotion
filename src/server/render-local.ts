import path from "node:path";
import os from "node:os";
import type { ExportFormat, ExportQuality } from "@/types";
import { qualityToScale } from "@/lib/render-pipeline";

export interface RenderRequest {
  compositionId: string;
  inputProps: Record<string, unknown>;
  format: ExportFormat;
  quality: ExportQuality;
  onProgress?: (progress: number) => void;
}

const codecFor: Record<ExportFormat, "h264" | "vp8" | "gif"> = {
  mp4: "h264",
  webm: "vp8",
  gif: "gif",
};

let cachedServeUrl: string | null = null;

/** Remotion bundler runs outside Next.js — wire up the same `@/` alias as tsconfig. */
function webpackOverride(config: Record<string, unknown>) {
  const resolve = (config.resolve ?? {}) as {
    alias?: Record<string, string | false | string[]>;
  };
  resolve.alias = {
    ...resolve.alias,
    "@": path.resolve(process.cwd(), "src"),
  };
  config.resolve = resolve;
  return config;
}

export async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) return cachedServeUrl;
  const { bundle } = await import("@remotion/bundler");
  cachedServeUrl = await bundle({
    entryPoint: path.resolve(process.cwd(), "src/remotion/index.ts"),
    webpackOverride,
  });
  return cachedServeUrl;
}

/** Local MP4/WebM/GIF render — no optional @remotion/lambda dependency. */
export async function renderLocally(req: RenderRequest): Promise<string> {
  const { selectComposition, renderMedia } = await import("@remotion/renderer");
  const serveUrl = await getServeUrl();

  const composition = await selectComposition({
    serveUrl,
    id: req.compositionId,
    inputProps: req.inputProps,
  });

  const outputLocation = path.join(
    os.tmpdir(),
    `lumen-${Date.now()}.${req.format}`
  );

  await renderMedia({
    serveUrl,
    composition,
    codec: codecFor[req.format],
    outputLocation,
    inputProps: req.inputProps,
    scale: qualityToScale(req.quality, composition.height),
    onProgress: ({ progress }) => req.onProgress?.(Math.round(progress * 100)),
  });

  return outputLocation;
}
