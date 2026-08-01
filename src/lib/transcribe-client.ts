import type { TimedCaption } from "@/types";

export type TranscriptionEngine = "whisper-cpp" | "faster-whisper";

export type TranscribeResult =
  | { ok: true; captions: TimedCaption[]; engine?: TranscriptionEngine; text?: string }
  | { ok: false; error: string };

const ENGINE_STORAGE_KEY = "framekit-transcription-engine";

export function loadTranscriptionEngine(): TranscriptionEngine {
  if (typeof window === "undefined") return "faster-whisper";
  const stored = localStorage.getItem(ENGINE_STORAGE_KEY);
  if (stored === "whisper-cpp" || stored === "faster-whisper") return stored;
  return "faster-whisper";
}

export function saveTranscriptionEngine(engine: TranscriptionEngine): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENGINE_STORAGE_KEY, engine);
}

async function parseResponse(res: Response): Promise<TranscribeResult> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const data = await res.json() as {
        ok?: boolean;
        captions?: TimedCaption[];
        engine?: TranscriptionEngine;
        text?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.captions) {
        return {
          ok: false,
          error: data.error ?? `Transcription failed (${res.status})`,
        };
      }
      return { ok: true, captions: data.captions, engine: data.engine, text: data.text };
    } catch {
      return { ok: false, error: `Invalid JSON response from server (${res.status})` };
    }
  } else {
    const text = await res.text();
    if (res.status === 413) {
      return {
        ok: false,
        error: "File is too large for Vercel serverless functions (max upload is 4.5 MB). Please use a YouTube/Direct URL, or run the project locally.",
      };
    }
    return {
      ok: false,
      error: text.slice(0, 120) || `Server returned error status ${res.status}`,
    };
  }
}

export async function transcribeFromSourceUrl(
  sourceUrl: string,
  engine?: TranscriptionEngine
): Promise<TranscribeResult> {
  let absoluteUrl = sourceUrl;
  if (typeof window !== "undefined" && sourceUrl.startsWith("/")) {
    absoluteUrl = window.location.origin + sourceUrl;
  }
  try {
    const res = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceUrl: absoluteUrl,
        engine: engine ?? loadTranscriptionEngine(),
      }),
    });
    return await parseResponse(res);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Transcription failed",
    };
  }
}

/** Upload a File for transcription. */
export async function transcribeFromFile(
  file: File,
  engine?: TranscriptionEngine
): Promise<TranscribeResult> {
  try {
    const form = new FormData();
    form.append("file", file);
    form.append("engine", engine ?? loadTranscriptionEngine());
    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: form,
    });
    return await parseResponse(res);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Transcription failed",
    };
  }
}

/** Duration of captions in frames at given fps (min 30 frames). */
export function captionsDurationInFrames(
  captions: TimedCaption[],
  fps: number
): number {
  if (!captions.length) return 90;
  const endMs = Math.max(...captions.map((c) => c.endMs));
  return Math.max(30, Math.ceil((endMs / 1000) * fps));
}

export async function fetchTranscriptionStatus(): Promise<{
  whisperCpp: boolean;
  fasterWhisper: boolean;
  defaultEngine: TranscriptionEngine;
} | null> {
  try {
    const res = await fetch("/api/transcribe");
    if (!res.ok) return null;
    return (await res.json()) as {
      whisperCpp: boolean;
      fasterWhisper: boolean;
      defaultEngine: TranscriptionEngine;
    };
  } catch {
    return null;
  }
}
