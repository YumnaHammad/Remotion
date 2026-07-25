import { NextResponse } from "next/server";
import { z } from "zod";
import { genId } from "@/lib/project-factory";
import {
  mapGoogleVeoError,
  sanitizeVeoPrompt,
  toVeoAspectRatio,
} from "@/lib/google-video";
import { startVeoGeneration } from "@/server/providers/google-veo";
import {
  createVeoJob,
  stageProgress,
  toPublicVeoJob,
  updateVeoJob,
} from "@/server/veo-jobs";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  prompt: z.string().min(3).max(4000),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
  quality: z.enum(["standard", "high"]).optional(),
});

/**
 * POST /api/video/generate
 * Starts a Google Veo long-running job and returns a Framekit jobId immediately.
 * Poll GET /api/video/[jobId] until status === completed | failed.
 */
export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_API_KEY?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "GOOGLE_API_KEY is not set. Add it to .env.local on the server.",
          code: "missing_api_key",
        },
        { status: 503 }
      );
    }

    const json = await req.json();
    const body = BodySchema.parse(json);
    const prompt = sanitizeVeoPrompt(body.prompt);
    const aspectRatio = body.aspectRatio ?? "16:9";
    const jobId = genId("veo");

    // Stage: preparing / sending (server-side before Google returns)
    await createVeoJob({
      jobId,
      prompt,
      aspectRatio,
      operationName: "pending",
      operationSnapshot: {},
    });
    await updateVeoJob(jobId, {
      stage: "sending",
      progress: stageProgress("sending"),
      message: "Sending prompt to Google Veo…",
    });

    let started;
    try {
      started = await startVeoGeneration({
        prompt,
        aspectRatio: toVeoAspectRatio(aspectRatio),
      });
    } catch (err) {
      const mapped = mapGoogleVeoError(err);
      await updateVeoJob(jobId, {
        status: "failed",
        stage: "error",
        error: mapped.message,
        message: mapped.message,
        progress: 100,
      });
      return NextResponse.json(
        { ok: false, error: mapped.message, code: mapped.code, jobId },
        { status: 500 }
      );
    }

    const job = await updateVeoJob(jobId, {
      operationName: started.operationName,
      operationSnapshot: started.operationSnapshot,
      stage: "generating",
      progress: stageProgress("generating"),
      message: "Google Veo is generating your video…",
      status: "running",
    });

    return NextResponse.json({
      ok: true,
      jobId,
      job: job ? toPublicVeoJob(job) : undefined,
      /**
       * Poll this endpoint — do not wait here for minutes.
       * Provider can be swapped later without changing this contract.
       */
      statusUrl: `/api/video/${jobId}`,
      provider: "google-veo",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid request", code: "validation" },
        { status: 400 }
      );
    }
    const mapped = mapGoogleVeoError(err);
    console.error("[video/generate]", err);
    return NextResponse.json(
      { ok: false, error: mapped.message, code: mapped.code },
      { status: 500 }
    );
  }
}
