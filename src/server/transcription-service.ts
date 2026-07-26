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
function structureFromCaptions(captions: Caption[]): StructuredTranscript {
  return {
    engine: "whisper-cpp",
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
      return transcribeStructuredWithFasterWhisper(inputPath, options);
    }
    if (isWhisperInstalled()) {
      return structureFromCaptions(await transcribeWithWhisperCpp(inputPath));
    }
    throw new Error(
      "faster-whisper is not installed. Run: pip install faster-whisper (or npm run whisper:install for whisper.cpp fallback)"
    );
  }

  if (!isWhisperInstalled()) {
    if (await isFasterWhisperAvailable()) {
      return transcribeStructuredWithFasterWhisper(inputPath, options);
    }
    throw new Error(
      "Whisper.cpp is not installed. Run `npm run whisper:install` or install faster-whisper with pip."
    );
  }

  return structureFromCaptions(await transcribeWithWhisperCpp(inputPath));
}

export async function transcribeMediaToCaptions(
  inputPath: string,
  engine?: TranscriptionEngine
): Promise<{ captions: Caption[]; engine: TranscriptionEngine }> {
  const result = await transcribeMediaStructured(inputPath, engine);
  return { captions: result.captions, engine: result.engine };
}
