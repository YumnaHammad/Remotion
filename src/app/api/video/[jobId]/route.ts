import { NextResponse } from "next/server";
import { mapGoogleVeoError } from "@/lib/google-video";
import { pollVeoOperation } from "@/server/providers/google-veo";
import {
  readVeoJob,
  stageProgress,
  toPublicVeoJob,
  updateVeoJob,
} from "@/server/veo-jobs";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ jobId: string }> };

/**
 * GET /api/video/[jobId]
 * One poll tick: asks Google if the Veo op is done; when yes, downloads MP4
 * into /public/generated-assets and returns a playable relative URL.
 */
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { jobId } = await context.params;
    if (!jobId || jobId.length < 4) {
      return NextResponse.json(
        { ok: false, error: "Invalid job id" },
        { status: 400 }
      );
    }

    const job = await readVeoJob(jobId);
    if (!job) {
      return NextResponse.json(
        { ok: false, error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.status === "completed" || job.status === "failed") {
      return NextResponse.json({ ok: true, job: toPublicVeoJob(job) });
    }

    if (!process.env.GOOGLE_API_KEY?.trim()) {
      await updateVeoJob(jobId, {
        status: "failed",
        stage: "error",
        error: "GOOGLE_API_KEY is not configured",
        message: "Missing Google API key",
        progress: 100,
      });
      const failed = await readVeoJob(jobId);
      return NextResponse.json({
        ok: false,
        job: failed ? toPublicVeoJob(failed) : undefined,
        error: "GOOGLE_API_KEY is not configured",
      });
    }

    const poll = await pollVeoOperation({
      jobId,
      operationSnapshot: job.operationSnapshot,
    });

    if (!poll.done) {
      const updated = await updateVeoJob(jobId, {
        operationSnapshot: poll.operationSnapshot,
        stage: "generating",
        progress: Math.min(75, (job.progress || 20) + 3),
        message: "Still generating with Google Veo…",
        status: "running",
      });
      return NextResponse.json({
        ok: true,
        job: updated ? toPublicVeoJob(updated) : toPublicVeoJob(job),
      });
    }

    if (poll.error) {
      const failed = await updateVeoJob(jobId, {
        status: "failed",
        stage: "error",
        error: poll.error,
        message: poll.error,
        progress: 100,
        operationSnapshot: poll.operationSnapshot,
      });
      return NextResponse.json({
        ok: false,
        job: failed ? toPublicVeoJob(failed) : undefined,
        error: poll.error,
      });
    }

    await updateVeoJob(jobId, {
      stage: "rendering",
      progress: stageProgress("rendering"),
      message: "Saving video…",
      operationSnapshot: poll.operationSnapshot,
      videoUrl: poll.videoUrl,
    });

    const completed = await updateVeoJob(jobId, {
      status: "completed",
      stage: "complete",
      progress: 100,
      message: "Complete",
      videoUrl: poll.videoUrl,
      operationSnapshot: poll.operationSnapshot,
    });

    return NextResponse.json({
      ok: true,
      job: completed ? toPublicVeoJob(completed) : undefined,
    });
  } catch (err) {
    const mapped = mapGoogleVeoError(err);
    console.error("[video/status]", err);
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: 500 }
    );
  }
}
