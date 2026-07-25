import type { VisemeCode, VisemeCue } from "@/types/feature-stack";

/** Map rough phoneme / letter groups → Preston Blair mouth shapes. */
const LETTER_TO_VISEME: Record<string, VisemeCode> = {
  a: "D",
  e: "C",
  i: "C",
  o: "E",
  u: "E",
  y: "C",
  b: "A",
  m: "A",
  p: "A",
  f: "F",
  v: "F",
  w: "F",
  r: "B",
  l: "B",
  th: "B",
  s: "B",
  z: "B",
  t: "B",
  d: "B",
  n: "B",
  k: "B",
  g: "B",
  c: "B",
  q: "B",
  j: "B",
  x: "B",
  h: "C",
};

function wordToViseme(word: string): VisemeCode {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return "X";
  if (clean.startsWith("th")) return LETTER_TO_VISEME.th;
  const first = clean[0];
  return LETTER_TO_VISEME[first] ?? "B";
}

export interface TimedWord {
  text: string;
  startMs: number;
  endMs: number;
}

/**
 * Build a viseme timeline from word-level captions (Whisper / TTS timing).
 * Inserts rest (X) gaps between words.
 */
export function captionsToVisemes(words: TimedWord[]): VisemeCue[] {
  if (!words.length) return [{ value: "X", startMs: 0, endMs: 1000 }];

  const cues: VisemeCue[] = [];
  let cursor = 0;

  for (const word of words) {
    if (word.startMs > cursor + 40) {
      cues.push({ value: "X", startMs: cursor, endMs: word.startMs });
    }
    const viseme = wordToViseme(word.text);
    const mid = word.startMs + (word.endMs - word.startMs) * 0.35;
    // Closed → open shape for the bulk of the word
    if (viseme === "A" || viseme === "F") {
      cues.push({ value: viseme, startMs: word.startMs, endMs: word.endMs });
    } else {
      cues.push({
        value: "B",
        startMs: word.startMs,
        endMs: Math.min(mid, word.endMs),
      });
      if (mid < word.endMs) {
        cues.push({ value: viseme, startMs: mid, endMs: word.endMs });
      }
    }
    cursor = word.endMs;
  }

  cues.push({ value: "X", startMs: cursor, endMs: cursor + 400 });
  return mergeAdjacent(cues);
}

function mergeAdjacent(cues: VisemeCue[]): VisemeCue[] {
  if (!cues.length) return cues;
  const out: VisemeCue[] = [{ ...cues[0] }];
  for (let i = 1; i < cues.length; i++) {
    const prev = out[out.length - 1];
    const cur = cues[i];
    if (cur.value === prev.value && cur.startMs <= prev.endMs + 5) {
      prev.endMs = Math.max(prev.endMs, cur.endMs);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

/** Resolve active viseme at a Remotion time in ms. */
export function visemeAtMs(cues: VisemeCue[], timeMs: number): VisemeCode {
  for (const cue of cues) {
    if (timeMs >= cue.startMs && timeMs < cue.endMs) return cue.value;
  }
  return "X";
}

/** Mouth open amount 0–1 derived from viseme (for procedural character). */
export function visemeMouthOpen(code: VisemeCode): number {
  switch (code) {
    case "A":
      return 0.05;
    case "B":
      return 0.25;
    case "C":
      return 0.45;
    case "D":
      return 0.85;
    case "E":
      return 0.65;
    case "F":
      return 0.2;
    case "X":
    default:
      return 0;
  }
}
