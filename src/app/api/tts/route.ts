import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { generateVoiceover } from "@/server/providers/tts";
import { genId } from "@/lib/project-factory";

export const runtime = "nodejs";
export const maxDuration = 120;

const BodySchema = z.object({
  text: z.string().min(1).max(8000),
  /** Force cloud TTS when key is present */
  useExternalApis: z.boolean().optional(),
  voice: z.string().optional(),
});

/**
 * Generate a voiceover MP3 from caption / script text.
 * Uses OpenAI TTS when OPENAI_API_KEY is set; otherwise returns a local sample URL.
 */
export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const jobId = genId("tts");
    const dir = path.join(process.cwd(), "public", "generated-assets", jobId);
    await fs.mkdir(dir, { recursive: true });
    const outputPath = path.join(dir, "voiceover.mp3");

    if (body.voice) {
      process.env.TTS_VOICE = body.voice;
    }

    const result = await generateVoiceover(body.text, outputPath, {
      useExternalApis: body.useExternalApis ?? true,
    });

    const finalFile = result.url.endsWith(".wav")
      ? outputPath.replace(/\.mp3$/i, ".wav")
      : outputPath;

    let captions: any[] = [];
    try {
      const { transcribeMediaToCaptions } = await import(
        "@/server/transcription-service"
      );
      const tx = await transcribeMediaToCaptions(finalFile);
      if (tx.captions.length) {
        captions = tx.captions;
      }
    } catch (err) {
      console.error("[tts] Transcription failed for voiceover", err);
    }

    return NextResponse.json({
      ok: true,
      url: result.url,
      mode: result.mode,
      jobId,
      captions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS failed";
    console.error("[tts]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    cloudTts: Boolean(process.env.OPENAI_API_KEY),
    localSapi: process.platform === "win32",
    voices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
  });
}
