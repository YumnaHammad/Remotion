import type { TimedCaption } from "@/types";

/** Default ms per word when timing is estimated from plain text. */
const DEFAULT_MS_PER_WORD = 320;
const GAP_MS = 40;

/**
 * Split free-form script into TimedCaption[] with estimated word timings.
 * Accepts either space-separated text or one word/phrase per line.
 */
export function scriptToTimedCaptions(
  script: string,
  options?: { msPerWord?: number; startMs?: number }
): TimedCaption[] {
  const msPerWord = options?.msPerWord ?? DEFAULT_MS_PER_WORD;
  const startMs = options?.startMs ?? 0;
  const lines = script
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const tokens: string[] =
    lines.length > 1 && lines.every((l) => l.split(/\s+/).length <= 4)
      ? lines.flatMap((l) => l.split(/\s+/).filter(Boolean))
      : script
          .replace(/\s+/g, " ")
          .trim()
          .split(" ")
          .map((w) => w.trim())
          .filter(Boolean);

  let t = startMs;
  return tokens.map((text) => {
    const dur = Math.max(180, Math.round(msPerWord * (0.7 + text.length / 12)));
    const start = t;
    const end = t + dur;
    t = end + GAP_MS;
    return {
      text,
      startMs: start,
      endMs: end,
      timestampMs: Math.round((start + end) / 2),
      confidence: 1,
    };
  });
}

export function captionsToScript(captions: TimedCaption[] | undefined): string {
  if (!captions?.length) return "";
  return captions.map((c) => c.text).join(" ");
}

export function captionsDurationMs(captions: TimedCaption[]): number {
  if (!captions.length) return 0;
  return Math.max(...captions.map((c) => c.endMs));
}

export function captionsPlainText(captions: TimedCaption[]): string {
  return captions.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
}

/** Speak captions in the browser (no API key). Returns a cancel fn. */
export function speakCaptionsInBrowser(
  captions: TimedCaption[],
  options?: { rate?: number; onEnd?: () => void }
): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    options?.onEnd?.();
    return () => undefined;
  }
  window.speechSynthesis.cancel();
  const text = captionsPlainText(captions);
  if (!text) {
    options?.onEnd?.();
    return () => undefined;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = options?.rate ?? 1;
  utter.onend = () => options?.onEnd?.();
  utter.onerror = () => options?.onEnd?.();
  window.speechSynthesis.speak(utter);
  return () => {
    window.speechSynthesis.cancel();
  };
}
