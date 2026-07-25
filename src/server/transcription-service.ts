import type { Caption } from "@remotion/captions";
import {
  isFasterWhisperAvailable,
  resolveTranscriptionEngine,
  transcribeWithFasterWhisper,
  type TranscriptionEngine,
} from "@/server/faster-whisper";
import {
  isWhisperInstalled,
  transcribeToCaptions as transcribeWithWhisperCpp,
} from "@/server/whisper";

export type { TranscriptionEngine };

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

export async function transcribeMediaToCaptions(
  inputPath: string,
  engine?: TranscriptionEngine
): Promise<{ captions: Caption[]; engine: TranscriptionEngine }> {
  const selected = resolveTranscriptionEngine(engine);

  if (selected === "faster-whisper") {
    const available = await isFasterWhisperAvailable();
    if (!available) {
      if (isWhisperInstalled()) {
        const captions = await transcribeWithWhisperCpp(inputPath);
        return { captions, engine: "whisper-cpp" };
      }
      throw new Error(
        "faster-whisper is not installed. Run: pip install faster-whisper (or npm run whisper:install for whisper.cpp fallback)"
      );
    }
    const captions = await transcribeWithFasterWhisper(inputPath);
    return { captions, engine: "faster-whisper" };
  }

  if (!isWhisperInstalled()) {
    const fwAvailable = await isFasterWhisperAvailable();
    if (fwAvailable) {
      const captions = await transcribeWithFasterWhisper(inputPath);
      return { captions, engine: "faster-whisper" };
    }
    throw new Error(
      "Whisper.cpp is not installed. Run `npm run whisper:install` or install faster-whisper with pip."
    );
  }

  const captions = await transcribeWithWhisperCpp(inputPath);
  return { captions, engine: "whisper-cpp" };
}
