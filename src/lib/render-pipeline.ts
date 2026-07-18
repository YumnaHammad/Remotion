/**
 * Rendering pipeline architecture
 *
 * User Input → Project State (Zustand) → Remotion Composition
 * → Frame Generation → BullMQ Queue → FFmpeg / Remotion Lambda
 * → MP4/WebM/GIF → Cloudflare R2 / Supabase → Export Center
 */

export type PipelineStage =
  | "validate"
  | "compose"
  | "enqueue"
  | "render_frames"
  | "ffmpeg"
  | "upload"
  | "complete"
  | "failed";

export interface PipelineJob {
  id: string;
  projectId: string;
  stage: PipelineStage;
  progress: number;
  format: "mp4" | "webm" | "gif";
  quality: "720p" | "1080p" | "2k" | "4k";
  outputKey?: string;
  error?: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  "validate",
  "compose",
  "enqueue",
  "render_frames",
  "ffmpeg",
  "upload",
  "complete",
];

export function stageLabel(stage: PipelineStage) {
  const labels: Record<PipelineStage, string> = {
    validate: "Validating project",
    compose: "Building composition",
    enqueue: "Queued for workers",
    render_frames: "Rendering frames",
    ffmpeg: "FFmpeg processing",
    upload: "Uploading to storage",
    complete: "Ready to download",
    failed: "Failed",
  };
  return labels[stage];
}

/** Maps quality preset to Remotion scale relative to composition height. */
export function qualityToScale(
  quality: PipelineJob["quality"],
  compositionHeight = 1080
) {
  const targetHeight = {
    "720p": 720,
    "1080p": 1080,
    "2k": 1440,
    "4k": 2160,
  }[quality];
  return targetHeight / compositionHeight;
}
