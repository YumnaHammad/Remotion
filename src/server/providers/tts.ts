import { execFile } from "node:child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "node:util";
import {
  LOCAL_VOICEOVER_URL,
  buildCaptionsFromScenes,
} from "@/lib/pipeline/local-breakdown";
import {
  resolveUseExternalApis,
  type PipelineRequestOptions,
} from "./pipeline-config";

export { buildCaptionsFromScenes };

const execFileAsync = promisify(execFile);
const DEFAULT_VOICE = "alloy";

function publicUrlFor(outputPath: string): string {
  const filename = path.basename(outputPath);
  const jobDir = path.basename(path.dirname(outputPath));
  return `/generated-assets/${jobDir}/${filename}`;
}

async function externalVoiceover(
  text: string,
  outputPath: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const voice = process.env.TTS_VOICE ?? DEFAULT_VOICE;
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text.slice(0, 4096),
      voice,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS failed (${res.status}): ${err.slice(0, 200)}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
  return publicUrlFor(outputPath);
}

/**
 * Local Windows TTS via System.Speech → WAV (no API key).
 * Returns null on non-Windows or if SAPI fails.
 */
async function windowsSapiVoiceover(
  text: string,
  outputPath: string
): Promise<string | null> {
  if (process.platform !== "win32" || !text.trim()) return null;

  const wavPath = outputPath.replace(/\.mp3$/i, ".wav");
  await fs.mkdir(path.dirname(wavPath), { recursive: true });

  const script = path.join(process.cwd(), "scripts", "sapi-tts.ps1");
  try {
    await execFileAsync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        script,
        "-Text",
        text.slice(0, 4000),
        "-OutputPath",
        wavPath,
      ],
      { windowsHide: true, timeout: 120_000, maxBuffer: 2 * 1024 * 1024 }
    );
    const stat = await fs.stat(wavPath);
    if (stat.size < 100) return null;
    return publicUrlFor(wavPath);
  } catch (err) {
    console.warn("[tts] Windows SAPI failed", err);
    return null;
  }
}

export async function generateVoiceover(
  text: string,
  outputPath: string,
  options?: PipelineRequestOptions
): Promise<{ url: string; mode: "local" | "external" | "sapi" }> {
  const useExternal = resolveUseExternalApis(options);
  const trimmed = text.trim();

  if (useExternal && process.env.OPENAI_API_KEY && trimmed) {
    try {
      const url = await externalVoiceover(trimmed, outputPath);
      return { url, mode: "external" };
    } catch (err) {
      console.warn("[tts] OpenAI TTS failed, trying local", err);
    }
  }

  if (trimmed) {
    const sapiUrl = await windowsSapiVoiceover(trimmed, outputPath);
    if (sapiUrl) return { url: sapiUrl, mode: "sapi" };
  }

  return { url: LOCAL_VOICEOVER_URL, mode: "local" };
}
