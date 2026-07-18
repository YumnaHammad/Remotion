import { NextResponse } from "next/server";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const maxDuration = 300;

const RenderSchema = z.object({
  projectId: z.string(),
  compositionId: z.string().default("ProductAd"),
  inputProps: z.record(z.string(), z.unknown()).optional(),
  format: z.enum(["mp4", "webm", "gif"]).default("mp4"),
  quality: z.enum(["720p", "1080p", "2k", "4k"]).default("1080p"),
  mode: z.enum(["local", "lambda"]).default("local"),
});

/** In-memory job progress for polling (demo / single-instance). */
const jobs = new Map<
  string,
  { progress: number; status: string; outputUrl?: string; error?: string }
>();

export async function POST(req: Request) {
  try {
    const body = RenderSchema.parse(await req.json());
    const jobId = `job_${Date.now()}`;

    jobs.set(jobId, { progress: 5, status: "queued" });

    // Attempt local render when not on serverless (has ffmpeg + writable out/)
    const canRenderLocally =
      process.env.REMOTION_RENDER === "1" ||
      process.env.NODE_ENV === "development";

    if (canRenderLocally && body.mode === "local") {
      if (body.compositionId === "LongFormVideo") {
        const scenes = body.inputProps?.scenes;
        if (!Array.isArray(scenes) || scenes.length === 0) {
          return NextResponse.json(
            {
              ok: false,
              error:
                "Long-form export requires at least one scene. Open the editor and save your project first.",
            },
            { status: 400 }
          );
        }
      }

      jobs.set(jobId, { progress: 10, status: "rendering" });

      try {
        const { renderLocally } = await import("@/server/render-local");
        const outDir = path.join(process.cwd(), "public", "exports");
        await fs.mkdir(outDir, { recursive: true });
        const publicPath = path.join(outDir, `${body.projectId}.${body.format}`);

        jobs.set(jobId, { progress: 30, status: "rendering" });

        const tmpPath = await renderLocally({
          compositionId: body.compositionId,
          inputProps: body.inputProps ?? {},
          format: body.format,
          quality: body.quality,
        });

        await fs.copyFile(tmpPath, publicPath);
        await fs.access(publicPath);

        const outputUrl = `/exports/${body.projectId}.${body.format}`;
        jobs.set(jobId, { progress: 100, status: "completed", outputUrl });

        return NextResponse.json({
          ok: true,
          jobId,
          status: "completed",
          progress: 100,
          outputUrl,
        });
      } catch (renderErr) {
        const msg =
          renderErr instanceof Error ? renderErr.message : "Render failed";
        console.error("[render]", msg, renderErr);
        jobs.set(jobId, { progress: 0, status: "failed", error: msg });
        return NextResponse.json(
          { ok: false, jobId, status: "failed", error: msg },
          { status: 500 }
        );
      }
    }

    jobs.set(jobId, { progress: 0, status: "queued" });

    return NextResponse.json({
      ok: true,
      jobId,
      status: "queued",
      mode: body.mode,
      message:
        "Local rendering is disabled. Run with REMOTION_RENDER=1 for MP4 export.",
      input: {
        projectId: body.projectId,
        compositionId: body.compositionId,
      },
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
  const job = jobId ? jobs.get(jobId) : undefined;

  return NextResponse.json({
    jobId,
    status: job?.status ?? "rendering",
    progress: job?.progress ?? 42,
    outputUrl: job?.outputUrl,
    error: job?.error,
  });
}
