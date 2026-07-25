/**
 * Google Veo (Gemini video) — shared types & helpers.
 *
 * Provider switch: Script-to-Video can use Veo (`provider: "veo"`) or the
 * existing Remotion AutomatedVideo pipeline (`provider: "remotion"`).
 * Only the backend talks to Google; the browser never sees GOOGLE_API_KEY.
 */

export const VEO_MODEL = "veo-3.1-generate-preview";

export type VeoAspectRatio = "16:9" | "9:16";

export type VeoJobStage =
  | "preparing"
  | "sending"
  | "generating"
  | "rendering"
  | "finalizing"
  | "complete"
  | "error";

export type VeoJobStatus = "queued" | "running" | "completed" | "failed";

export interface VeoGenerateRequest {
  prompt: string;
  aspectRatio?: VeoAspectRatio | "1:1";
  /** Soft quality hint — mapped to model config when supported */
  quality?: "standard" | "high";
}

export interface VeoJobPublic {
  jobId: string;
  status: VeoJobStatus;
  stage: VeoJobStage;
  progress: number;
  message: string;
  videoUrl?: string;
  operationName?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export const VEO_STAGE_LABELS: Record<VeoJobStage, string> = {
  preparing: "Preparing prompt",
  sending: "Sending to Veo",
  generating: "Generating video",
  rendering: "Saving video",
  finalizing: "Finalizing",
  complete: "Complete",
  error: "Failed",
};

/** Map Framekit aspect ratios to Veo-supported values (Veo: 16:9 | 9:16). */
export function toVeoAspectRatio(
  ratio: "16:9" | "9:16" | "1:1" | undefined
): VeoAspectRatio {
  if (ratio === "9:16") return "9:16";
  return "16:9";
}

export function sanitizeVeoPrompt(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 4000);
}

export function mapGoogleVeoError(err: unknown): {
  code: string;
  message: string;
} {
  const text =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const lower = text.toLowerCase();

  if (/api.?key|invalid.?key|unauthenticated|401|403/.test(lower)) {
    return {
      code: "invalid_api_key",
      message: "Google API key is missing or invalid. Check GOOGLE_API_KEY.",
    };
  }
  if (/quota|rate.?limit|resource.?exhausted|429/.test(lower)) {
    return {
      code: "quota_exceeded",
      message: "Google Veo quota exceeded. Try again later or check billing.",
    };
  }
  if (/timeout|timed.?out|deadline/.test(lower)) {
    return {
      code: "timeout",
      message: "Video generation timed out. Please try again.",
    };
  }
  if (/network|fetch failed|econnrefused|enotfound/.test(lower)) {
    return {
      code: "network",
      message: "Network error talking to Google. Check your connection.",
    };
  }
  return {
    code: "generation_failed",
    message: "Video generation failed. Please try a different prompt.",
  };
}
