import type { Caption } from "@remotion/captions";
import {
  isFasterWhisperAvailable,
  resolveTranscriptionEngine,
  transcribeStructuredWithFasterWhisper,
  type FasterWhisperOptions,
  type StructuredTranscript,
  type TranscriptionEngine,
} from "@/server/faster-whisper";
import {
  isWhisperInstalled,
  transcribeToCaptions as transcribeWithWhisperCpp,
  openaiWhisperTranscribe,
} from "@/server/whisper";

export type { StructuredTranscript, TranscriptionEngine };

export async function getTranscriptionStatus(): Promise<{
  whisperCpp: boolean;
  fasterWhisper: boolean;
  defaultEngine: TranscriptionEngine;
}> {
  return {
    whisperCpp: isWhisperInstalled(),
    fasterWhisper: await isFasterWhisperAvailable(),
    defaultEngine: resolveTranscriptionEngine(),
  };
}

/** Wrap plain captions in the structured-transcript shape (whisper.cpp path). */
function structureFromCaptions(captions: Caption[], engine: TranscriptionEngine = "whisper-cpp"): StructuredTranscript {
  return {
    engine,
    model: null,
    media: null,
    language: null,
    languageProbability: null,
    text: captions.map((c) => c.text).join(" "),
    segments: [],
    captions,
  };
}

/**
 * Transcribe an audio or video file into a structured transcript
 * (full text, timed segments with word-level timestamps, detected language,
 * and Remotion-compatible captions). Standalone entry point for the
 * automation pipeline and AI modules.
 */
export async function transcribeMediaStructured(
  inputPath: string,
  engine?: TranscriptionEngine,
  options: FasterWhisperOptions = {}
): Promise<StructuredTranscript> {
  const selected = resolveTranscriptionEngine(engine);

  if (selected === "faster-whisper") {
    if (await isFasterWhisperAvailable()) {
      try {
        return await transcribeStructuredWithFasterWhisper(inputPath, options);
      } catch (err) {
        console.warn("[transcribe] Local faster-whisper run failed, trying OpenAI fallback...", err);
      }
    }
    if (isWhisperInstalled()) {
      try {
        return structureFromCaptions(await transcribeWithWhisperCpp(inputPath));
      } catch (err) {
        console.warn("[transcribe] Local whisper.cpp run failed, trying OpenAI fallback...", err);
      }
    }
    try {
      const captions = await openaiWhisperTranscribe(inputPath);
      return structureFromCaptions(captions, "faster-whisper");
    } catch (openaiErr: any) {
      throw new Error(
        `All transcription engines failed. Local faster-whisper and whisper-cpp are not installed, and OpenAI cloud fallback failed: ${openaiErr.message}`
      );
    }
  }

  if (!isWhisperInstalled()) {
    if (await isFasterWhisperAvailable()) {
      try {
        return await transcribeStructuredWithFasterWhisper(inputPath, options);
      } catch (err) {
        console.warn("[transcribe] Local faster-whisper failed, trying OpenAI fallback...", err);
      }
    }
    try {
      const captions = await openaiWhisperTranscribe(inputPath);
      return structureFromCaptions(captions, "whisper-cpp");
    } catch (openaiErr: any) {
      throw new Error(
        `All transcription engines failed. whisper.cpp is not installed, and OpenAI cloud fallback failed: ${openaiErr.message}`
      );
    }
  }

  try {
    return structureFromCaptions(await transcribeWithWhisperCpp(inputPath));
  } catch (err) {
    console.warn("[transcribe] Local whisper.cpp failed, trying OpenAI fallback...", err);
    try {
      const captions = await openaiWhisperTranscribe(inputPath);
      return structureFromCaptions(captions, "whisper-cpp");
    } catch (openaiErr: any) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Local whisper.cpp failed (${msg}) and OpenAI cloud fallback failed: ${openaiErr.message}`
      );
    }
  }
}

export async function transcribeMediaToCaptions(
  inputPath: string,
  engine?: TranscriptionEngine
): Promise<{ captions: Caption[]; engine: TranscriptionEngine }> {
  const result = await transcribeMediaStructured(inputPath, engine);
  return { captions: result.captions, engine: result.engine };
}
