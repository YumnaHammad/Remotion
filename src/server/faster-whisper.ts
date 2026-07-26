import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import type { Caption } from "@remotion/captions";

const execFileAsync = promisify(execFile);

export type TranscriptionEngine = "whisper-cpp" | "faster-whisper";

export interface TranscriptWord {
  text: string;
  startMs: number;
  endMs: number;
  confidence: number | null;
}

export interface TranscriptSegment {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
  words: TranscriptWord[];
  avgLogprob: number | null;
  noSpeechProb: number | null;
}

export interface StructuredTranscript {
  engine: TranscriptionEngine;
  model: string | null;
  media: {
    path: string;
    kind: "audio" | "video";
    durationMs: number;
  } | null;
  language: string | null;
  languageProbability: number | null;
  text: string;
  segments: TranscriptSegment[];
  captions: Caption[];
}

export interface FasterWhisperOptions {
  /** ISO language code; omit for automatic detection. */
  language?: string;
  model?: string;
}

export function getDefaultTranscriptionEngine(): TranscriptionEngine {
  const env = process.env.TRANSCRIPTION_ENGINE;
  if (env === "faster-whisper" || env === "whisper-cpp") return env;
  return "faster-whisper";
}

export function resolveTranscriptionEngine(
  requested?: TranscriptionEngine
): TranscriptionEngine {
  return requested ?? getDefaultTranscriptionEngine();
}

function getPythonPath(): string {
  return process.env.PYTHON_PATH ?? "python";
}

function getFasterWhisperScript(): string {
  return path.join(process.cwd(), "scripts", "transcribe-faster-whisper.py");
}

export async function isFasterWhisperAvailable(): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync(
      getPythonPath(),
      ["-c", "import faster_whisper"],
      { windowsHide: true, timeout: 15000 }
    );
    void stdout;
    return true;
  } catch {
    return false;
  }
}

/**
 * Run the standalone faster-whisper service on an audio or video file.
 * Video containers have their audio track extracted in-process (PyAV), so no
 * ffmpeg binary is required on the rendering server.
 */
export async function transcribeStructuredWithFasterWhisper(
  inputPath: string,
  options: FasterWhisperOptions = {}
): Promise<StructuredTranscript> {
  const script = getFasterWhisperScript();
  const model =
    options.model ?? process.env.FASTER_WHISPER_MODEL ?? "base";
  const device = process.env.FASTER_WHISPER_DEVICE ?? "cpu";
  const computeType = process.env.FASTER_WHISPER_COMPUTE_TYPE ?? "int8";

  const args = [
    script,
    inputPath,
    "--model",
    model,
    "--device",
    device,
    "--compute-type",
    computeType,
  ];
  if (options.language) {
    args.push("--language", options.language);
  }

  const { stdout } = await execFileAsync(getPythonPath(), args, {
    windowsHide: true,
    maxBuffer: 100 * 1024 * 1024,
    timeout: 600000,
  });

  const parsed = JSON.parse(stdout) as {
    ok?: boolean;
    error?: string;
    model?: string;
    media?: StructuredTranscript["media"];
    language?: string;
    languageProbability?: number;
    text?: string;
    segments?: TranscriptSegment[];
    captions?: Caption[];
  };

  if (!parsed.ok || !parsed.captions) {
    throw new Error(parsed.error ?? "faster-whisper returned no captions");
  }

  return {
    engine: "faster-whisper",
    model: parsed.model ?? model,
    media: parsed.media ?? null,
    language: parsed.language ?? null,
    languageProbability: parsed.languageProbability ?? null,
    text: parsed.text ?? "",
    segments: parsed.segments ?? [],
    captions: parsed.captions.map((c) => ({
      ...c,
      confidence: c.confidence ?? null,
    })),
  };
}

export async function transcribeWithFasterWhisper(
  inputPath: string
): Promise<Caption[]> {
  const result = await transcribeStructuredWithFasterWhisper(inputPath);
  return result.captions;
}
