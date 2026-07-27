import {
  resolveMusicUrl,
  resolveSfxUrl,
} from "@/server/providers/audio-resolver";
import type { EditRecipe, ResolvedEditRecipe } from "@/types/edit-recipe";
import {
  LOCAL_VOICEOVER_URL,
  buildCaptionsFromScenes,
  syncVoiceoverText,
} from "@/lib/pipeline/local-breakdown";
import { pickLocalStockUrl } from "@/lib/pipeline/local-stock";

/** Client-safe asset resolution — no network, no API keys. */
export function resolveEditRecipeLocal(
  recipe: EditRecipe,
  options: {
    accent?: string;
    brandColor?: string;
    fontFamily?: string;
  } = {}
): ResolvedEditRecipe {
  const synced = syncVoiceoverText(recipe);

  const resolvedScenes = synced.scenes.map((scene, index) => ({
    ...scene,
    stockVideoUrl: pickLocalStockUrl(scene.stockVideoKeyword, index),
    soundEffectUrl: resolveSfxUrl(scene.soundEffect),
  }));

  return {
    title: synced.title,
    aspectRatio: synced.aspectRatio,
    fps: 30,
    voiceoverUrl: "",
    backgroundMusicUrl: resolveMusicUrl(synced.backgroundMusicKeyword),
    captions: buildCaptionsFromScenes(resolvedScenes, synced.fps),
    accent: options.accent ?? "#0b84f3",
    brandColor: options.brandColor ?? "#1e3a5f",
    fontFamily: options.fontFamily,
    scenes: resolvedScenes,
  };
}

export function buildAutomatedVideoInputProps(
  resolved: ResolvedEditRecipe,
  options?: { showCaptions?: boolean; voiceoverUrl?: string; captions?: any[] }
): Record<string, unknown> {
  const showCaptions = options?.showCaptions ?? true;
  return {
    title: resolved.title,
    accent: resolved.accent,
    brandColor: resolved.brandColor,
    aspectRatio: resolved.aspectRatio,
    fontFamily: resolved.fontFamily,
    backgroundMusicUrl: resolved.backgroundMusicUrl,
    scenes: resolved.scenes,
    showCaptions,
    ...(showCaptions
      ? {
          captions: options?.captions ?? resolved.captions,
          voiceoverUrl: options?.voiceoverUrl ?? resolved.voiceoverUrl,
        }
      : {
          captions: undefined,
          voiceoverUrl: undefined,
        }),
  };
}

/** Speak the recipe text when captions are enabled (Windows TTS / OpenAI). */
export async function fetchCaptionVoiceover(
  text: string
): Promise<{ url: string; captions?: any[] } | null> {
  const cleaned = text.replace(/\[[^\]]+\]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleaned.slice(0, 4000), useExternalApis: true }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      url?: string;
      captions?: any[];
    };
    if (res.ok && data.ok && data.url) {
      return { url: data.url, captions: data.captions };
    }
  } catch {
    /* ignore */
  }
  return null;
}
