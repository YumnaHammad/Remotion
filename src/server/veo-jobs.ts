/**
 * Lightweight Veo job store (filesystem JSON under public/generated-assets).
 * Survives serverless cold starts better than pure memory for local/dev;
 * swap for Redis/DB when scaling.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { VeoJobPublic, VeoJobStage, VeoJobStatus } from "@/lib/google-video";

export interface VeoJobRecord extends VeoJobPublic {
  prompt: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  operationSnapshot: Record<string, unknown>;
}

function jobDir(jobId: string) {
  return path.join(process.cwd(), "public", "generated-assets", jobId);
}

function metaPath(jobId: string) {
  return path.join(jobDir(jobId), "veo-job.json");
}

export async function createVeoJob( partial: {
  jobId: string;
  prompt: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  operationName: string;
  operationSnapshot: Record<string, unknown>;
}): Promise<VeoJobRecord> {
  const now = new Date().toISOString();
  const record: VeoJobRecord = {
    jobId: partial.jobId,
    prompt: partial.prompt,
    aspectRatio: partial.aspectRatio,
    status: "running",
    stage: "generating",
    progress: 15,
    message: "Generating video with Google Veo…",
    operationName: partial.operationName,
    operationSnapshot: partial.operationSnapshot,
    createdAt: now,
    updatedAt: now,
  };
  await fs.mkdir(jobDir(partial.jobId), { recursive: true });
  await fs.writeFile(metaPath(partial.jobId), JSON.stringify(record, null, 2));
  return record;
}

export async function readVeoJob(jobId: string): Promise<VeoJobRecord | null> {
  try {
    const raw = await fs.readFile(metaPath(jobId), "utf8");
    return JSON.parse(raw) as VeoJobRecord;
  } catch {
    return null;
  }
}

export async function updateVeoJob(
  jobId: string,
  patch: Partial<VeoJobRecord>
): Promise<VeoJobRecord | null> {
  const current = await readVeoJob(jobId);
  if (!current) return null;
  const next: VeoJobRecord = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(metaPath(jobId), JSON.stringify(next, null, 2));
  return next;
}

export function toPublicVeoJob(job: VeoJobRecord): VeoJobPublic {
  return {
    jobId: job.jobId,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    message: job.message,
    videoUrl: job.videoUrl,
    operationName: job.operationName,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export function stageProgress(stage: VeoJobStage): number {
  switch (stage) {
    case "preparing":
      return 5;
    case "sending":
      return 12;
    case "generating":
      return 45;
    case "rendering":
      return 80;
    case "finalizing":
      return 92;
    case "complete":
      return 100;
    case "error":
      return 100;
    default:
      return 10;
  }
}

export type { VeoJobStatus };
