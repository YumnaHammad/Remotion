/**
 * Google Veo provider — server only.
 *
 * Flow:
 * 1. startVeoGeneration() → Google long-running operation (returns quickly)
 * 2. pollVeoOperation() → check done; when finished, download MP4 into public/
 * 3. Client polls our /api/video/status — we never hold an HTTP request open for minutes
 *
 * To switch providers later, keep calling the same job store + status shape from
 * another module (e.g. OpenAI Sora) and leave the Script-to-Video UI unchanged.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import {
  VEO_MODEL,
  mapGoogleVeoError,
  sanitizeVeoPrompt,
  toVeoAspectRatio,
  type VeoAspectRatio,
} from "@/lib/google-video";

function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY?.trim();
  if (!key) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }
  return key;
}

function getModel(): string {
  return process.env.VEO_MODEL?.trim() || VEO_MODEL;
}

function createClient() {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

export interface StartVeoResult {
  /** Opaque Google operation name for polling */
  operationName: string;
  /** Serialized operation blob for getVideosOperation */
  operationSnapshot: Record<string, unknown>;
}

export async function startVeoGeneration(opts: {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
}): Promise<StartVeoResult> {
  const prompt = sanitizeVeoPrompt(opts.prompt);
  if (prompt.length < 3) {
    throw new Error("Prompt is too short");
  }

  const aspectRatio: VeoAspectRatio = toVeoAspectRatio(opts.aspectRatio);
  const ai = createClient();

  try {
    const operation = await ai.models.generateVideos({
      model: getModel(),
      prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio,
      },
    });

    const name =
      typeof operation.name === "string" && operation.name
        ? operation.name
        : `veo-op-${Date.now()}`;

    return {
      operationName: name,
      operationSnapshot: operation as unknown as Record<string, unknown>,
    };
  } catch (err) {
    const mapped = mapGoogleVeoError(err);
    throw new Error(mapped.message);
  }
}

export interface PollVeoResult {
  done: boolean;
  /** Relative URL under /generated-assets when complete */
  videoUrl?: string;
  error?: string;
  operationSnapshot: Record<string, unknown>;
}

/**
 * One poll tick against Google. Downloads the file when done so the browser
 * can play a same-origin URL without the API key.
 */
export async function pollVeoOperation(opts: {
  jobId: string;
  operationSnapshot: Record<string, unknown>;
}): Promise<PollVeoResult> {
  const ai = createClient();

  try {
    let operation = await ai.operations.getVideosOperation({
      operation: opts.operationSnapshot as never,
    });

    const snapshot = operation as unknown as Record<string, unknown>;

    if (!operation.done) {
      return { done: false, operationSnapshot: snapshot };
    }

    if (operation.error) {
      const msg =
        typeof operation.error === "object" &&
        operation.error &&
        "message" in operation.error
          ? String((operation.error as { message?: string }).message)
          : "Veo generation failed";
      return {
        done: true,
        error: mapGoogleVeoError(msg).message,
        operationSnapshot: snapshot,
      };
    }

    const generated = operation.response?.generatedVideos;
    const first = generated?.[0];
    const remoteUri = first?.video?.uri;
    if (!remoteUri) {
      return {
        done: true,
        error: "Veo finished but returned no video file.",
        operationSnapshot: snapshot,
      };
    }

    const videoUrl = await downloadVeoVideoToPublic({
      jobId: opts.jobId,
      remoteUri,
      apiKey: getApiKey(),
    });

    return {
      done: true,
      videoUrl,
      operationSnapshot: snapshot,
    };
  } catch (err) {
    const mapped = mapGoogleVeoError(err);
    return {
      done: true,
      error: mapped.message,
      operationSnapshot: opts.operationSnapshot,
    };
  }
}

async function downloadVeoVideoToPublic(opts: {
  jobId: string;
  remoteUri: string;
  apiKey: string;
}): Promise<string> {
  const dir = path.join(
    process.cwd(),
    "public",
    "generated-assets",
    opts.jobId
  );
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, "veo.mp4");

  // Gemini file download URLs require the API key
  const url = new URL(opts.remoteUri);
  if (!url.searchParams.has("key")) {
    url.searchParams.set("key", opts.apiKey);
  }

  const res = await fetch(url.toString(), {
    headers: { "x-goog-api-key": opts.apiKey },
  });

  if (!res.ok) {
    throw new Error(`Failed to download Veo video (${res.status})`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 1000) {
    throw new Error("Downloaded Veo file looks empty");
  }
  await fs.writeFile(filePath, buffer);

  return `/generated-assets/${opts.jobId}/veo.mp4`;
}
