import path from "node:path";
import os from "node:os";
import type { ExportFormat, ExportQuality } from "@/types";
import { qualityToScale } from "@/lib/render-pipeline";

/**
 * Server-side render service.
 *
 * Local path : @remotion/bundler → @remotion/renderer (FFmpeg baked in)
 * Cloud path : @remotion/lambda (renderMediaOnLambda + getRenderProgress)
 *
 * Packages are imported dynamically so the Next.js client bundle never pulls
 * in native binaries; this module only runs inside Node route handlers / jobs.
 */

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

/** Bundle the Remotion project once and cache the serve URL. */
let cachedServeUrl: string | null = null;

export async function getServeUrl(): Promise<string> {
  if (cachedServeUrl) return cachedServeUrl;
  const { bundle } = await import("@remotion/bundler");
  cachedServeUrl = await bundle({
    entryPoint: path.resolve(process.cwd(), "src/remotion/index.ts"),
    // webpackOverride wiring point for aliases if needed
    webpackOverride: (config) => config,
  });
  return cachedServeUrl;
}

/** Render locally with @remotion/renderer. Returns the output file path. */
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
    scale: qualityToScale(req.quality),
    onProgress: ({ progress }) => req.onProgress?.(Math.round(progress * 100)),
  });

  return outputLocation;
}

/**
 * Cloud render via Remotion Lambda. Requires `@remotion/lambda` to be installed
 * plus a deployed function + site. Imported through a variable specifier so the
 * package stays an optional peer dependency and never enters the build graph.
 * Env: REMOTION_AWS_REGION, REMOTION_FUNCTION_NAME, REMOTION_SERVE_URL.
 */
async function loadLambda() {
  const specifier = "@remotion/lambda/client";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await import(/* @vite-ignore */ specifier)) as any;
}

export async function renderOnLambda(req: RenderRequest) {
  const { renderMediaOnLambda } = await loadLambda();
  const region = process.env.REMOTION_AWS_REGION ?? "us-east-1";
  const functionName = process.env.REMOTION_FUNCTION_NAME;
  const serveUrl = process.env.REMOTION_SERVE_URL;

  const { renderId, bucketName } = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: req.compositionId,
    inputProps: req.inputProps,
    codec: codecFor[req.format],
    downloadBehavior: { type: "download", fileName: `lumen.${req.format}` },
  });

  return { renderId, bucketName, region, functionName };
}

export async function pollLambda(
  renderId: string,
  bucketName: string,
  functionName: string,
  region = "us-east-1"
) {
  const { getRenderProgress } = await loadLambda();
  return getRenderProgress({ renderId, bucketName, functionName, region });
}
