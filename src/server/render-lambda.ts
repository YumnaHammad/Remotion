import type { RenderRequest } from "./render-local";

const codecFor = {
  mp4: "h264",
  webm: "vp8",
  gif: "gif",
} as const;

/** Dynamic import — @remotion/lambda is an optional peer, not installed by default. */
async function loadLambda() {
  const specifier = "@remotion/lambda/client";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await import(/* webpackIgnore: true */ specifier)) as any;
}

/**
 * Optional cloud render — install @remotion/lambda and set AWS env vars.
 * Not used by the default export flow.
 */
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
