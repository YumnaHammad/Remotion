import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  downloadSourceToTemp,
  getWhisperTmpDir,
  resolveSafeInputPath,
} from "@/server/whisper";
import {
  getTranscriptionStatus,
  transcribeMediaToCaptions,
} from "@/server/transcription-service";

export const runtime = "nodejs";
export const maxDuration = 300;

const JsonBodySchema = z.object({
  inputPath: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  engine: z.enum(["whisper-cpp", "faster-whisper"]).optional(),
});

async function cleanup(filePath: string | null) {
  if (!filePath) return;
  await fs.unlink(filePath).catch(() => undefined);
}

export async function GET() {
  const status = await getTranscriptionStatus();
  return NextResponse.json({ ok: true, ...status });
}

export async function POST(req: Request) {
  let tempFile: string | null = null;

  try {
    const contentType = req.headers.get("content-type") ?? "";
    let mediaPath: string;
    let engine: "whisper-cpp" | "faster-whisper" | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const engineField = form.get("engine");
      if (engineField === "whisper-cpp" || engineField === "faster-whisper") {
        engine = engineField;
      }
      if (!(file instanceof File)) {
        return NextResponse.json(
          { ok: false, error: "multipart field `file` is required." },
          { status: 400 }
        );
      }

      const tmpDir = getWhisperTmpDir();
      await fs.mkdir(tmpDir, { recursive: true });
      const ext = path.extname(file.name) || ".bin";
      tempFile = path.join(
        tmpDir,
        `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
      );
      const buf = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(tempFile, buf);
      mediaPath = tempFile;
    } else {
      const body = JsonBodySchema.parse(await req.json());
      engine = body.engine;
      if (body.inputPath) {
        mediaPath = resolveSafeInputPath(body.inputPath);
      } else if (body.sourceUrl) {
        tempFile = await downloadSourceToTemp(body.sourceUrl);
        mediaPath = tempFile;
      } else {
        return NextResponse.json(
          {
            ok: false,
            error: "Provide multipart `file`, or JSON `inputPath` / `sourceUrl`.",
          },
          { status: 400 }
        );
      }
    }

    const result = await transcribeMediaToCaptions(mediaPath, engine);
    return NextResponse.json({
      ok: true,
      captions: result.captions,
      engine: result.engine,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error("[transcribe]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  } finally {
    await cleanup(tempFile);
  }
}
