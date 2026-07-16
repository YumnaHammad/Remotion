import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Render pipeline API (architecture stub).
 *
 * Flow:
 *   Project State → Remotion Composition → Frame Generation
 *   → BullMQ Queue → FFmpeg / Remotion Lambda → R2/Supabase → Download
 */
export const runtime = "nodejs";

const RenderSchema = z.object({
  projectId: z.string(),
  compositionId: z.string().default("Main"),
  format: z.enum(["mp4", "webm", "gif"]).default("mp4"),
  quality: z.enum(["720p", "1080p", "2k", "4k"]).default("1080p"),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5"]).optional(),
  mode: z.enum(["local", "lambda"]).default("local"),
});

export async function POST(req: Request) {
  try {
    const body = RenderSchema.parse(await req.json());

    const jobId = `job_${Date.now()}`;

    // A worker (BullMQ) consumes this job and calls src/server/render-service.ts:
    //   mode "local"  → renderLocally()  (bundle + renderMedia + FFmpeg)
    //   mode "lambda" → renderOnLambda() (renderMediaOnLambda + getRenderProgress)
    return NextResponse.json({
      ok: true,
      jobId,
      status: "queued",
      mode: body.mode,
      service:
        body.mode === "lambda"
          ? "renderOnLambda"
          : "renderLocally",
      pipeline: [
        "validate_project",
        "bundle_remotion",
        "select_composition",
        "enqueue_bullmq",
        "render_frames",
        "ffmpeg_mux",
        "upload_storage",
        "notify_client",
      ],
      input: body,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid request",
      },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  return NextResponse.json({
    jobId,
    status: "rendering",
    progress: 42,
    estimatedSeconds: 90,
  });
}
