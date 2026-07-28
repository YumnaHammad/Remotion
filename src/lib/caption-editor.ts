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

export function formatCentisecondTimestamp(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}]`;
}

export function captionsToTimestampedScript(captions: TimedCaption[] | undefined): string {
  if (!captions?.length) return "";
  
  const segments: { startMs: number; text: string }[] = [];
  let currentWords: string[] = [];
  let currentStart = captions[0]!.startMs;
  
  for (let i = 0; i < captions.length; i++) {
    const c = captions[i]!;
    currentWords.push(c.text);
    const hasPunctuation = /[.!?]/.test(c.text);
    const next = captions[i + 1];
    const hasGap = next ? (next.startMs - c.endMs > 600) : false;
    
    if (currentWords.length >= 8 || hasPunctuation || hasGap || i === captions.length - 1) {
      segments.push({
        startMs: currentStart,
        text: currentWords.join(" "),
      });
      currentWords = [];
      if (next) {
        currentStart = next.startMs;
      }
    }
  }
  
  return segments
    .map((seg) => `${formatCentisecondTimestamp(seg.startMs)} ${seg.text}`)
    .join("\n");
}

export function timestampedScriptToCaptions(script: string, defaultMsPerWord = 320): TimedCaption[] {
  const regex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/;
  const lines = script.split("\n");
  const segments: { startMs: number; text: string }[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const match = regex.exec(trimmed);
    if (match) {
      const minutes = parseInt(match[1]!, 10);
      const seconds = parseInt(match[2]!, 10);
      let ms = 0;
      if (match[3]) {
        if (match[3].length === 2) {
          ms = parseInt(match[3]!, 10) * 10;
        } else {
          ms = parseInt(match[3]!, 10);
        }
      }
      const startMs = (minutes * 60 + seconds) * 1000 + ms;
      const text = trimmed.replace(regex, "").trim();
      segments.push({ startMs, text });
    } else {
      if (segments.length > 0) {
        segments[segments.length - 1]!.text += " " + trimmed;
      } else {
        segments.push({ startMs: 0, text: trimmed });
      }
    }
  }
  
  segments.sort((a, b) => a.startMs - b.startMs);
  if (!segments.length) return [];
  
  const captions: TimedCaption[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const nextSeg = segments[i + 1];
    
    const words = seg.text.split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    
    const segStart = seg.startMs;
    let segEnd = segStart + words.length * defaultMsPerWord;
    if (nextSeg) {
      segEnd = Math.min(nextSeg.startMs - 40, segStart + words.length * defaultMsPerWord);
      if (segEnd <= segStart) {
        segEnd = nextSeg.startMs - 10;
      }
    }
    
    const duration = segEnd - segStart;
    const wordDuration = duration / words.length;
    
    words.forEach((word, index) => {
      const wordStart = Math.round(segStart + index * wordDuration);
      const wordEnd = Math.round(wordStart + wordDuration - 10);
      captions.push({
        text: word,
        startMs: wordStart,
        endMs: wordEnd,
        timestampMs: Math.round((wordStart + wordEnd) / 2),
        confidence: 1,
      });
    });
  }
  return captions;
}
