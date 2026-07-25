/**
 * Client helper for Script-to-Video → Google Veo.
 * Starts a job, then polls /api/video/[jobId] until complete/failed.
 */

import {
  VEO_STAGE_LABELS,
  type VeoJobPublic,
  type VeoJobStage,
} from "@/lib/google-video";

export interface VeoGenerateClientOptions {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  quality?: "standard" | "high";
  /** Called as the job advances through stages */
  onProgress?: (job: VeoJobPublic, label: string) => void;
  /** Abort polling */
  signal?: AbortSignal;
  pollIntervalMs?: number;
  maxPolls?: number;
}

export async function generateVideoWithVeo(
  options: VeoGenerateClientOptions
): Promise<VeoJobPublic> {
  const {
    prompt,
    aspectRatio = "16:9",
    quality = "standard",
    onProgress,
    signal,
    pollIntervalMs = 8000,
    maxPolls = 90,
  } = options;

  onProgress?.(
    {
      jobId: "",
      status: "queued",
      stage: "preparing",
      progress: 5,
      message: VEO_STAGE_LABELS.preparing,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    VEO_STAGE_LABELS.preparing
  );

  const startRes = await fetch("/api/video/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, quality }),
    signal,
  });

  const startData = (await startRes.json()) as {
    ok?: boolean;
    jobId?: string;
    job?: VeoJobPublic;
    error?: string;
    code?: string;
  };

  if (!startRes.ok || !startData.ok || !startData.jobId) {
    throw new Error(startData.error ?? "Could not start Veo generation");
  }

  let job = startData.job ?? {
    jobId: startData.jobId,
    status: "running" as const,
    stage: "sending" as VeoJobStage,
    progress: 12,
    message: VEO_STAGE_LABELS.sending,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  onProgress?.(job, VEO_STAGE_LABELS[job.stage]);

  for (let i = 0; i < maxPolls; i++) {
    if (signal?.aborted) {
      throw new Error("Cancelled");
    }

    await sleep(pollIntervalMs, signal);

    const statusRes = await fetch(`/api/video/${startData.jobId}`, {
      signal,
    });
    const statusData = (await statusRes.json()) as {
      ok?: boolean;
      job?: VeoJobPublic;
      error?: string;
    };

    if (statusData.job) {
      job = statusData.job;
      onProgress?.(job, VEO_STAGE_LABELS[job.stage] ?? job.message);
    }

    if (job.status === "completed" && job.videoUrl) {
      return job;
    }
    if (job.status === "failed") {
      throw new Error(job.error ?? statusData.error ?? "Veo generation failed");
    }
  }

  throw new Error("Video generation timed out. Please try again.");
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Cancelled"));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new Error("Cancelled"));
      },
      { once: true }
    );
  });
}
