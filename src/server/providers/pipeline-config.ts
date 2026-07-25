import type { PipelineMode, PipelineSource } from "@/lib/pipeline/pipeline-preferences";

export type { PipelineMode, PipelineSource };

export interface PipelineRequestOptions {
  /** client = local logic; server = may use external APIs */
  source?: PipelineSource;
  /** Server-only: attempt OpenAI / Pexels / TTS when keys exist */
  useExternalApis?: boolean;
}

/** Env default for server external APIs (global fallback). */
export function isExternalPipelineEnabled(): boolean {
  return process.env.ENABLE_EXTERNAL_AI === "1";
}

export function resolveUseExternalApis(
  options?: PipelineRequestOptions
): boolean {
  if (options?.source === "client") return false;
  if (typeof options?.useExternalApis === "boolean") {
    return options.useExternalApis;
  }
  return isExternalPipelineEnabled();
}

export function resolvePipelineMode(
  options?: PipelineRequestOptions
): PipelineMode {
  return resolveUseExternalApis(options) ? "external" : "local";
}

export function serverExternalAvailable(): {
  llm: boolean;
  tts: boolean;
  stock: boolean;
} {
  return {
    llm: Boolean(process.env.OPENAI_API_KEY),
    tts: Boolean(process.env.OPENAI_API_KEY),
    stock: Boolean(process.env.PEXELS_API_KEY),
  };
}
