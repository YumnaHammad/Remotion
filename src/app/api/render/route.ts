import { NextResponse } from "next/server";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import {
  canRenderInThisEnvironment,
  renderLocally,
} from "@/server/render-local";
import { prepareRenderInputProps } from "@/server/sanitize-render-props";

export const runtime = "nodejs";
export const maxDuration = 300;

const RenderSchema = z.object({
  projectId: z.string(),
  compositionId: z.string().default("ProductAd"),
  inputProps: z.record(z.string(), z.unknown()).optional(),
  format: z.enum(["mp4", "webm", "gif"]).default("mp4"),
  quality: z.enum(["720p", "1080p", "2k", "4k"]).default("1080p"),
  mode: z.enum(["local", "lambda"]).default("local"),
  /** Return the MP4 bytes in the POST response (reliable on Vercel serverless). */
  directDownload: z.boolean().default(false),
});

const MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  gif: "image/gif",
};

/** In-memory job progress for polling (single dev instance). */
const jobs = new Map<
  string,
  { progress: number; status: string; outputUrl?: string; error?: string }
>();

function exportFilename(projectId: string, format: string) {
  return `${projectId}.${format}`;
}

function exportApiUrl(projectId: string, format: string) {
  return `/api/exports/${exportFilename(projectId, format)}`;
}

export async function POST(req: Request) {
  try {
    const body = RenderSchema.parse(await req.json());
    const jobId = `job_${Date.now()}`;

    jobs.set(jobId, { progress: 5, status: "queued" });

    if (!canRenderInThisEnvironment() || body.mode !== "local") {
      jobs.set(jobId, { progress: 0, status: "queued" });
      return NextResponse.json(
        {
          ok: false,
          jobId,
          status: "unavailable",
          error:
            "Video export is disabled on this server. Set REMOTION_RENDER=1 in your environment.",
        },
        { status: 503 }
      );
    }

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

    const inputProps = prepareRenderInputProps(
      body.compositionId,
      body.inputProps
    );

    jobs.set(jobId, { progress: 10, status: "rendering" });

    try {
      const tmpPath = await renderLocally({
        compositionId: body.compositionId,
        inputProps,
        format: body.format,
        quality: body.quality,
        onProgress: (progress) => {
          jobs.set(jobId, {
            progress: Math.max(10, Math.min(99, progress)),
            status: "rendering",
          });
        },
      });

      const fileBuffer = await fs.readFile(tmpPath);
      await fs.unlink(tmpPath).catch(() => undefined);

      const onVercel = process.env.VERCEL === "1";
      let outputUrl = exportApiUrl(body.projectId, body.format);

      if (!onVercel && !body.directDownload) {
        const outDir = path.join(process.cwd(), "public", "exports");
        await fs.mkdir(outDir, { recursive: true });
        const publicPath = path.join(
          outDir,
          exportFilename(body.projectId, body.format)
        );
        await fs.writeFile(publicPath, fileBuffer);
        outputUrl = exportApiUrl(body.projectId, body.format);
      }

      jobs.set(jobId, { progress: 100, status: "completed", outputUrl });

      if (body.directDownload) {
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": MIME[body.format] ?? "application/octet-stream",
            "Content-Disposition": `attachment; filename="${body.projectId}.${body.format}"`,
            "X-Export-Job-Id": jobId,
            "X-Export-Output-Url": outputUrl,
            "Cache-Control": "no-store",
          },
        });
      }

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
    status: job?.status ?? "unknown",
    progress: job?.progress ?? 0,
    outputUrl: job?.outputUrl,
    error: job?.error,
  });
}
