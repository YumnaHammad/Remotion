import path from "path";
import type { EditRecipe, ResolvedEditRecipe } from "@/types/edit-recipe";
import { resolvedEditRecipeSchema } from "@/server/edit-recipe-schema";
import { syncVoiceoverText } from "@/lib/pipeline/local-breakdown";
import type { PipelineRequestOptions } from "@/server/providers/pipeline-config";
import { resolveMusicUrl, resolveSfxUrl } from "@/server/providers/audio-resolver";
import { fetchStockVideo } from "@/server/providers/stock-video";
import {
  buildCaptionsFromScenes,
  generateVoiceover,
} from "@/server/providers/tts";
import { genId } from "@/lib/project-factory";

export interface ResolveAssetsOptions extends PipelineRequestOptions {
  recipe: EditRecipe;
  jobId?: string;
  accent?: string;
  brandColor?: string;
  fontFamily?: string;
}

export interface ResolveAssetsResult {
  resolved: ResolvedEditRecipe;
  jobId: string;
  modes: {
    voiceover: "local" | "external";
    stock: ("local" | "external")[];
  };
}

export async function resolveEditRecipeAssets(
  options: ResolveAssetsOptions
): Promise<ResolveAssetsResult> {
  const recipe = syncVoiceoverText(options.recipe);
  const jobId = options.jobId ?? genId("gen");
  const assetsDir = path.join(
    process.cwd(),
    "public",
    "generated-assets",
    jobId
  );

  const pipelineOpts: PipelineRequestOptions = {
    source: options.source,
    useExternalApis: options.useExternalApis,
  };

  const voiceoverPath = path.join(assetsDir, "voiceover.mp3");
  const voiceover = await generateVoiceover(
    recipe.voiceoverText,
    voiceoverPath,
    pipelineOpts
  );

  const backgroundMusicUrl = resolveMusicUrl(recipe.backgroundMusicKeyword);

  const stockModes: ("local" | "external")[] = [];
  const resolvedScenes = await Promise.all(
    recipe.scenes.map(async (scene, index) => {
      const stockPath = path.join(assetsDir, `scene-${index}.mp4`);
      const stock = await fetchStockVideo(
        scene.stockVideoKeyword,
        recipe.aspectRatio,
        stockPath,
        index,
        pipelineOpts
      );
      stockModes.push(stock.mode);

      return {
        ...scene,
        stockVideoUrl: stock.url,
        soundEffectUrl: resolveSfxUrl(scene.soundEffect),
      };
    })
  );

  const captions = buildCaptionsFromScenes(resolvedScenes, recipe.fps);

  let finalCaptions = captions.map((c) => ({
    ...c,
    timestampMs:
      typeof c.timestampMs === "number"
        ? c.timestampMs
        : Math.round((c.startMs + c.endMs) / 2),
    confidence: c.confidence ?? null,
  }));
  if (voiceover.url.startsWith("/generated-assets/")) {
    try {
      const abs = path.join(
        process.cwd(),
        "public",
        voiceover.url.replace(/^\//, "")
      );
      const { transcribeMediaToCaptions } = await import(
        "@/server/transcription-service"
      );
      const tx = await transcribeMediaToCaptions(abs);
      if (tx.captions.length) {
        finalCaptions = tx.captions.map((c) => ({
          text: c.text,
          startMs: c.startMs,
          endMs: c.endMs,
          timestampMs:
            typeof c.timestampMs === "number"
              ? c.timestampMs
              : Math.round((c.startMs + c.endMs) / 2),
          confidence: c.confidence ?? null,
        }));
      }
    } catch {
      /* keep scene-estimated captions */
    }
  }

  const resolved = resolvedEditRecipeSchema.parse({
    title: recipe.title,
    aspectRatio: recipe.aspectRatio,
    fps: 30,
    voiceoverUrl: voiceover.url,
    backgroundMusicUrl,
    captions: finalCaptions,
    accent: options.accent ?? "#0b84f3",
    brandColor: options.brandColor ?? "#1e3a5f",
    fontFamily: options.fontFamily,
    scenes: resolvedScenes,
  }) as ResolvedEditRecipe;

  return {
    resolved,
    jobId,
    modes: {
      voiceover: voiceover.mode === "sapi" ? "local" : voiceover.mode,
      stock: stockModes,
    },
  };
}
