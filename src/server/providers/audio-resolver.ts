import { AUDIO_LIBRARY } from "@/data/audio-library";

const SFX_ALIASES: Record<string, string> = {
  whoosh: "sfx-whoosh",
  swoosh: "sfx-whoosh",
  swish: "sfx-whoosh",
  ding: "sfx-ding",
  bell: "sfx-ding",
  chime: "sfx-ding",
  pop: "sfx-pop",
  click: "sfx-pop",
  page: "sfx-page",
  turn: "sfx-page",
};

const MUSIC_KEYWORDS: Record<string, string[]> = {
  corporate: ["corporate", "business", "professional", "focus", "upbeat office"],
  cinematic: ["cinematic", "epic", "dramatic", "film", "trailer"],
  social: ["social", "lofi", "pop", "tiktok", "reels", "upbeat"],
  podcast: ["podcast", "calm", "conversation", "warm", "talk"],
};

/** Resolve an SFX keyword to a preview URL from the local audio library. */
export function resolveSfxUrl(keyword: string | undefined): string | undefined {
  if (!keyword?.trim()) return undefined;
  const lower = keyword.toLowerCase().replace(/\.(mp3|wav)$/i, "");

  for (const [alias, trackId] of Object.entries(SFX_ALIASES)) {
    if (lower.includes(alias)) {
      const track = AUDIO_LIBRARY.find((t) => t.id === trackId);
      if (track) return track.previewUrl;
    }
  }

  const direct = AUDIO_LIBRARY.find(
    (t) =>
      t.category === "sfx" &&
      (t.name.toLowerCase().includes(lower) || t.id.includes(lower))
  );
  return direct?.previewUrl;
}

/** Pick background music from keyword using the static audio library. */
export function resolveMusicUrl(keyword: string | undefined): string | undefined {
  if (!keyword?.trim()) {
    return AUDIO_LIBRARY.find((t) => t.id === "corp-focus")?.previewUrl;
  }

  const lower = keyword.toLowerCase();
  let bestCategory: keyof typeof MUSIC_KEYWORDS = "corporate";
  let bestScore = 0;

  for (const [category, words] of Object.entries(MUSIC_KEYWORDS)) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as keyof typeof MUSIC_KEYWORDS;
    }
  }

  const tracks = AUDIO_LIBRARY.filter((t) => t.category === bestCategory);
  return tracks[0]?.previewUrl ?? AUDIO_LIBRARY[0]?.previewUrl;
}
