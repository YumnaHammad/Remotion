/**
 * Stable sample media URLs for preview + Remotion render.
 * Prefer remotion.media hosts that return 200 (lofi.mp3 / silence.wav are 404).
 * Video “sample” is a themed still — Remotion’s video.mp4 is a color-bar test clip.
 */
import { LOCAL_STOCK_LIBRARY } from "@/lib/pipeline/local-stock";

export const SAMPLE_VIDEO_URL =
  LOCAL_STOCK_LIBRARY.find((c) => c.id === "stock-city")?.url ??
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=80";
export const SAMPLE_AUDIO_URL = "https://remotion.media/audio.mp3";
export const SAMPLE_VOICEOVER_URL = "https://remotion.media/dialogue.wav";
export const SAMPLE_MUSIC_URL = "https://remotion.media/audio.mp3";
export const SAMPLE_IMAGE_URL = SAMPLE_VIDEO_URL;

/** Broken legacy URLs → working replacements (for projects already saved). */
const BROKEN_MEDIA_REWRITES: Record<string, string> = {
  "https://remotion.media/lofi.mp3": SAMPLE_MUSIC_URL,
  "https://remotion.media/silence.wav": SAMPLE_VOICEOVER_URL,
  "https://remotion.media/video.mp4": SAMPLE_VIDEO_URL,
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4":
    SAMPLE_VIDEO_URL,
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4":
    SAMPLE_VIDEO_URL,
};

export function rewriteBrokenMediaUrl(
  url: string | undefined
): string | undefined {
  if (!url) return url;
  if (BROKEN_MEDIA_REWRITES[url]) return BROKEN_MEDIA_REWRITES[url];

  // Pattern matches for saved projects / renamed assets
  if (url.includes("lofi.mp3")) return SAMPLE_MUSIC_URL;
  if (url.includes("silence.wav")) return SAMPLE_VOICEOVER_URL;
  if (url.includes("remotion.media/video.mp4")) return SAMPLE_VIDEO_URL;
  if (url.includes("BigBuckBunny")) return SAMPLE_VIDEO_URL;
  if (url.includes("gtv-videos-bucket")) return SAMPLE_VIDEO_URL;

  return url;
}

/** Rewrite broken media srcs on every layer in a project. */
export function migrateProjectMediaUrls<
  T extends { layers: Array<{ src?: string }> },
>(project: T): T {
  let changed = false;
  const layers = project.layers.map((layer) => {
    if (!layer.src) return layer;
    const next = rewriteBrokenMediaUrl(layer.src);
    if (!next || next === layer.src) return layer;
    changed = true;
    return { ...layer, src: next };
  });
  return changed ? { ...project, layers } : project;
}
