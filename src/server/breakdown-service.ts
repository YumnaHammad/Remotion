import type { EditRecipeAspectRatio } from "@/types/edit-recipe";
import type { PipelineRequestOptions } from "@/server/providers/pipeline-config";
import { breakdownScript } from "@/server/providers/llm";
import { resolveEditRecipeAssets } from "@/server/asset-resolver";

export async function runBreakdown(
  script: string,
  aspectRatio: EditRecipeAspectRatio = "16:9",
  options?: PipelineRequestOptions
) {
  return breakdownScript(script, aspectRatio, options);
}

export async function runFullGeneration(
  options: {
    script: string;
    aspectRatio?: EditRecipeAspectRatio;
    accent?: string;
    brandColor?: string;
    fontFamily?: string;
  } & PipelineRequestOptions
) {
  const { recipe, mode: breakdownMode } = await breakdownScript(
    options.script,
    options.aspectRatio ?? "16:9",
    options
  );

  const { resolved, jobId, modes } = await resolveEditRecipeAssets({
    recipe,
    accent: options.accent,
    brandColor: options.brandColor,
    fontFamily: options.fontFamily,
    source: options.source,
    useExternalApis: options.useExternalApis,
  });

  return {
    recipe,
    resolved,
    jobId,
    breakdownMode,
    assetModes: modes,
  };
}
