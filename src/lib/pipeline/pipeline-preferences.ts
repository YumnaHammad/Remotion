/** Where script-to-video processing runs. */
export type PipelineSource = "client" | "server";

/** Which asset/breakdown providers are used (especially on server). */
export type PipelineMode = "local" | "external";

export interface PipelinePreferences {
  /** Client = in-browser; Server = API routes */
  source: PipelineSource;
  /** When server-side: use external APIs if available */
  useExternalApis: boolean;
}

export const DEFAULT_PIPELINE_PREFERENCES: PipelinePreferences = {
  source: "client",
  useExternalApis: false,
};

export const PIPELINE_STORAGE_KEY = "framekit-pipeline-preferences";

export function loadPipelinePreferences(): PipelinePreferences {
  if (typeof window === "undefined") return DEFAULT_PIPELINE_PREFERENCES;
  try {
    const raw = localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (!raw) return DEFAULT_PIPELINE_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<PipelinePreferences>;
    return {
      source: parsed.source === "server" ? "server" : "client",
      useExternalApis: Boolean(parsed.useExternalApis),
    };
  } catch {
    return DEFAULT_PIPELINE_PREFERENCES;
  }
}

export function savePipelinePreferences(prefs: PipelinePreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(prefs));
}
