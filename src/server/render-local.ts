import type { WebpackOverrideFn } from "@remotion/bundler";
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

/** Remotion bundler runs outside Next.js — wire up aliases and dedupe zod. */
const webpackOverride: WebpackOverrideFn = (config) => {
  config.resolve ??= {};
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(process.cwd(), "src"),
    zod: path.resolve(process.cwd(), "node_modules/zod"),
  };
  config.cache = false;
  return config;
};

export async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) return cachedServeUrl;
  const { bundle } = await import("@remotion/bundler");
  cachedServeUrl = await bundle({
    entryPoint: path.resolve(process.cwd(), "src/remotion/index-export.ts"),
    webpackOverride,
    enableCaching: false,
  });
  return cachedServeUrl;
}

export function canRenderInThisEnvironment(): boolean {
  if (process.env.REMOTION_RENDER === "0") return false;
  return (
    process.env.REMOTION_RENDER === "1" ||
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL === "1"
  );
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
    `framekit-${Date.now()}.${req.format}`
  );

  const scale = Math.max(
    1,
    Math.round(qualityToScale(req.quality, composition.height))
  );

  await renderMedia({
    serveUrl,
    composition,
    codec: codecFor[req.format],
    outputLocation,
    inputProps: req.inputProps,
    scale,
    onProgress: ({ progress }) => req.onProgress?.(Math.round(progress * 100)),
  });

  return outputLocation;
}
