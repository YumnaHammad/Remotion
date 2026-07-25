import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  generateVisemesFromAudio,
  generateVisemesFromCaptions,
  isRhubarbAvailable,
} from "@/server/lipsync";
import {
  downloadSourceToTemp,
  getWhisperTmpDir,
  resolveSafeInputPath,
} from "@/server/whisper";
import { transcribeMediaToCaptions } from "@/server/transcription-service";
import type { Caption } from "@remotion/captions";

export const runtime = "nodejs";
export const maxDuration = 300;

const BodySchema = z.object({
  inputPath: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  captions: z
    .array(
      z.object({
        text: z.string(),
        startMs: z.number(),
        endMs: z.number(),
        timestampMs: z.number().optional(),
        confidence: z.number().nullable().optional(),
      })
    )
    .optional(),
  /** When true and audio provided, also run transcription if captions missing */
  transcribeIfNeeded: z.boolean().optional(),
});

async function cleanup(filePath: string | null) {
  if (!filePath) return;
  await fs.unlink(filePath).catch(() => undefined);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    rhubarb: isRhubarbAvailable(),
    engines: ["rhubarb", "caption-map"],
  });
}

export async function POST(req: Request) {
  let tempFile: string | null = null;
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let audioPath: string | null = null;
    let captions: Caption[] | undefined;
    let transcribeIfNeeded = true;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const captionsField = form.get("captions");
      if (typeof captionsField === "string") {
        captions = JSON.parse(captionsField) as Caption[];
      }
      if (file instanceof File) {
        const tmpDir = getWhisperTmpDir();
        await fs.mkdir(tmpDir, { recursive: true });
        const ext = path.extname(file.name) || ".wav";
        tempFile = path.join(
          tmpDir,
          `lipsync-${Date.now()}${ext}`
        );
        await fs.writeFile(tempFile, Buffer.from(await file.arrayBuffer()));
        audioPath = tempFile;
      }
    } else {
      const body = BodySchema.parse(await req.json());
      transcribeIfNeeded = body.transcribeIfNeeded ?? true;
      captions = body.captions as Caption[] | undefined;
      if (body.inputPath) {
        audioPath = resolveSafeInputPath(body.inputPath);
      } else if (body.sourceUrl) {
        tempFile = await downloadSourceToTemp(body.sourceUrl);
        audioPath = tempFile;
      }
    }

    if (!audioPath && !captions?.length) {
      return NextResponse.json(
        {
          ok: false,
          error: "Provide audio (file / inputPath / sourceUrl) or captions.",
        },
        { status: 400 }
      );
    }

    if (audioPath && (!captions?.length) && transcribeIfNeeded) {
      try {
        const tx = await transcribeMediaToCaptions(audioPath);
        captions = tx.captions;
      } catch (err) {
        console.warn("[lipsync] transcription skipped:", err);
      }
    }

    if (audioPath) {
      const result = await generateVisemesFromAudio(audioPath, captions);
      return NextResponse.json({
        ok: true,
        visemes: result.visemes,
        engine: result.engine,
        captions: captions ?? [],
      });
    }

    const visemes = await generateVisemesFromCaptions(captions!);
    return NextResponse.json({
      ok: true,
      visemes,
      engine: "caption-map",
      captions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lipsync failed";
    console.error("[lipsync]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  } finally {
    await cleanup(tempFile);
  }
}
