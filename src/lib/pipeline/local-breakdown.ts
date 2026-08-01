import type { EditRecipe, EditRecipeAspectRatio } from "@/types/edit-recipe";
import { genId } from "@/lib/project-factory";

const SFX_PATTERN = /\[([^\]]+)\]/g;

const SFX_KEYWORD_MAP: Record<string, string> = {
  whoosh: "whoosh",
  swoosh: "whoosh",
  ding: "ding",
  bell: "ding",
  pop: "pop",
  click: "pop",
  page: "page",
};

function mapSfxTag(tag: string): string | undefined {
  const lower = tag.toLowerCase();
  for (const [key, value] of Object.entries(SFX_KEYWORD_MAP)) {
    if (lower.includes(key)) return value;
  }
  return undefined;
}

function cleanNarration(text: string): string {
  return text
    .replace(SFX_PATTERN, "")
    .replace(/\s+([.!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isPunctuationOnly(text: string): boolean {
  return text.length > 0 && !/[a-zA-Z0-9]/.test(text);
}

/** Rebuild voiceover narration from edited scene subtitles. */
export function syncVoiceoverText(recipe: EditRecipe): EditRecipe {
  return {
    ...recipe,
    voiceoverText: recipe.scenes.map((s) => s.subtitleText.trim()).join(" "),
  };
}

/**
 * Helper to group individual word captions into coherent sentence segments
 * when segments are not returned by the transcription engine.
 */
export function groupCaptionsIntoSegments(captions: any[]): any[] {
  if (!captions || !captions.length) return [];
  const segments = [];
  let currentWords: any[] = [];
  let currentStart = captions[0].startMs ?? Math.round(captions[0].start * 1000) ?? 0;

  for (let i = 0; i < captions.length; i++) {
    const c = captions[i];
    const wordText = c.text;
    const startMs = c.startMs ?? Math.round(c.start * 1000) ?? 0;
    const endMs = c.endMs ?? Math.round(c.end * 1000) ?? 0;

    currentWords.push({ text: wordText, startMs, endMs });

    const hasPunctuation = /[.!?]/.test(wordText);
    const nextWord = captions[i + 1];
    const nextStartMs = nextWord ? (nextWord.startMs ?? Math.round(nextWord.start * 1000) ?? 0) : null;
    const hasGap = nextStartMs !== null && (nextStartMs - endMs > 600);

    if (currentWords.length >= 8 || hasPunctuation || hasGap || i === captions.length - 1) {
      const segText = currentWords.map((w) => w.text).join(" ");
      segments.push({
        id: segments.length,
        startMs: currentStart,
        endMs,
        text: segText,
        words: [...currentWords],
      });
      currentWords = [];
      if (nextWord) {
        currentStart = nextStartMs;
      }
    }
  }

  return segments;
}

interface ScriptSegment {
  startMs: number;
  text: string;
}

/** Parse timestamp tags out of scripts like [01:23.45] text */
export function parseTimestampedScript(script: string): ScriptSegment[] {
  const lines = script.split("\n");
  const segments: ScriptSegment[] = [];
  const regex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/;

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
  return segments;
}

/**
 * Client-safe script breakdown — runs in browser or on server without API keys.
 */
export function localBreakdown(
  script: string,
  aspectRatio: EditRecipeAspectRatio = "16:9"
): EditRecipe {
  const parsedSegments = parseTimestampedScript(script);
  const hasTimestamps = parsedSegments.some(seg => seg.startMs > 0) || (parsedSegments.length > 0 && script.match(/\[\d{1,2}:\d{2}/));

  if (hasTimestamps) {
    const fps = 30;
    const scenes = parsedSegments.map((seg, i) => {
      const startFrame = Math.round((seg.startMs / 1000) * fps);
      let durationInFrames = 0;
      if (i < parsedSegments.length - 1) {
        const nextStartFrame = Math.round((parsedSegments[i + 1]!.startMs / 1000) * fps);
        durationInFrames = Math.max(15, nextStartFrame - startFrame);
      } else {
        const wordCount = seg.text.split(/\s+/).filter(Boolean).length;
        const durationSec = Math.max(3, Math.min(12, wordCount / 2.2));
        durationInFrames = Math.round(durationSec * fps);
      }

      let cleanText = seg.text;
      let sfx: string | undefined;
      const sfxMatch = SFX_PATTERN.exec(seg.text);
      if (sfxMatch) {
        sfx = mapSfxTag(sfxMatch[1]);
        cleanText = seg.text.replace(SFX_PATTERN, "").replace(/\s+/g, " ").trim();
      }

      return {
        id: genId("scene"),
        startFrame,
        durationInFrames,
        subtitleText: cleanText,
        stockVideoKeyword: guessStockKeyword(cleanText, i),
        soundEffect: sfx,
        animationStyle: i % 2 === 0 ? ("fade" as const) : ("zoom" as const),
        transition: i < parsedSegments.length - 1 ? ("fade-out" as const) : undefined,
      };
    });

    const voiceoverText = parsedSegments.map((seg) => seg.text.replace(SFX_PATTERN, "").trim()).join(" ");
    const title = voiceoverText.split(/[.!?]/)[0]?.slice(0, 60).trim() || "Script Video";

    return {
      title,
      aspectRatio,
      fps,
      voiceoverText,
      backgroundMusicKeyword: guessMusicKeyword(voiceoverText),
      scenes,
    };
  }

  type Chunk = { text: string; sfx?: string };
  const chunks: Chunk[] = [];
  let pendingSfx: string | undefined;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
 
  const regex = new RegExp(SFX_PATTERN.source, "g");
  const pushSentences = (raw: string, sfx?: string) => {
    const sentences = raw
      .split(/(?<=[.!?])\s+/)
      .map((s) => cleanNarration(s))
      .filter((s) => s.length > 0 && !isPunctuationOnly(s));
 
    sentences.forEach((sentence, i) => {
      const isLast = i === sentences.length - 1;
      chunks.push({ text: sentence, sfx: isLast ? sfx : undefined });
    });
  };
 
  while ((match = regex.exec(script)) !== null) {
    const before = script.slice(lastIndex, match.index);
    if (before.trim()) {
      pushSentences(before, pendingSfx);
      pendingSfx = undefined;
    }
    const sfx = mapSfxTag(match[1]);
    if (sfx) {
      if (chunks.length) chunks[chunks.length - 1]!.sfx = sfx;
      else pendingSfx = sfx;
    }
    lastIndex = match.index + match[0].length;
  }
 
  const tail = script.slice(lastIndex);
  if (tail.trim()) pushSentences(tail, pendingSfx);
  else if (pendingSfx && chunks.length) {
    chunks[chunks.length - 1]!.sfx = pendingSfx;
  }
 
  if (chunks.length === 0) {
    chunks.push({
      text: cleanNarration(script) || "Your story begins here.",
    });
  }
 
  const voiceoverText = chunks.map((c) => c.text).join(" ");
  const title =
    voiceoverText.split(/[.!?]/)[0]?.slice(0, 60).trim() || "Script Video";
 
  const wordsPerSecond = 2.2;
  let startFrame = 0;
  const scenes = chunks.map((seg, i) => {
    const wordCount = seg.text.split(/\s+/).filter(Boolean).length;
    const durationSec = Math.max(2.5, Math.min(12, wordCount / wordsPerSecond));
    const durationInFrames = Math.round(durationSec * 30);
    const scene = {
      id: genId("scene"),
      startFrame,
      durationInFrames,
      subtitleText: seg.text,
      stockVideoKeyword: guessStockKeyword(seg.text, i),
      soundEffect: seg.sfx,
      animationStyle: i % 2 === 0 ? ("fade" as const) : ("zoom" as const),
      transition: i < chunks.length - 1 ? ("fade-out" as const) : undefined,
    };
    startFrame += durationInFrames;
    return scene;
  });
 
  return {
    title,
    aspectRatio,
    fps: 30,
    voiceoverText,
    backgroundMusicKeyword: guessMusicKeyword(voiceoverText),
    scenes,
  };
}

function guessStockKeyword(text: string, index: number): string {
  const lower = text.toLowerCase();
  if (/playground|play\s*ground|children|kids|child|swing|sandbox/.test(lower))
    return "playground children park";
  if (/park|picnic|grass|outdoor play/.test(lower)) return "park outdoor";
  if (/beach|ocean|sea|coast|summer/.test(lower)) return "beach ocean";
  if (/desert|sand dune|canyon/.test(lower)) return "desert sand";
  if (/space|planet|galaxy|3d|sci-?fi/.test(lower)) return "space galaxy";
  if (/night|neon|evening lights/.test(lower)) return "night city neon";
  if (/forest|mountain|nature|landscape/.test(lower)) return "nature landscape";
  if (/food|restaurant|cooking|meal|cafe/.test(lower)) return "food restaurant";
  if (/fitness|gym|workout|sport|run/.test(lower)) return "fitness sport";
  if (/business|founder|company|corporate|office/.test(lower))
    return "business office";
  if (/breakthrough|idea|lightbulb|innovation|creative/.test(lower))
    return "creative idea";
  if (/sad|lost|collapse|fail|lonely/.test(lower)) return "sad quiet";
  if (/success|win|celebrate|growth|party/.test(lower))
    return "success celebration";
  if (/tech|software|startup|saas|computer|code/.test(lower))
    return "tech workspace";
  if (/city|tower|urban|skyline|downtown/.test(lower)) return "city skyline";
  const defaults = [
    "city skyline",
    "nature landscape",
    "office team",
    "abstract motion",
  ];
  return defaults[index % defaults.length]!;
}

function guessMusicKeyword(text: string): string {
  const lower = text.toLowerCase();
  if (/epic|dramatic|cinematic|trailer/.test(lower)) return "cinematic dramatic";
  if (/fun|social|viral|trend/.test(lower)) return "social lofi";
  if (/calm|podcast|story/.test(lower)) return "podcast calm";
  return "corporate upbeat";
}

export function buildCaptionsFromScenes(
  scenes: {
    startFrame: number;
    durationInFrames: number;
    subtitleText: string;
  }[],
  fps = 30
) {
  return scenes.map((scene) => {
    const startMs = Math.round((scene.startFrame / fps) * 1000);
    const endMs = Math.round(
      ((scene.startFrame + scene.durationInFrames) / fps) * 1000
    );
    return {
      text: scene.subtitleText,
      startMs,
      endMs,
      timestampMs: Math.round((startMs + endMs) / 2),
      confidence: 1 as number | null,
    };
  });
}

export const LOCAL_VOICEOVER_URL = "https://remotion.media/dialogue.wav";
