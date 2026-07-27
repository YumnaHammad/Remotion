import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
  type WhisperModel,
} from "@remotion/install-whisper-cpp";
import type { Caption } from "@remotion/captions";

const execFileAsync = promisify(execFile);

const WHISPER_VERSION = process.env.WHISPER_CPP_VERSION ?? "1.5.5";
const WHISPER_MODEL = (process.env.WHISPER_MODEL ?? "base.en") as WhisperModel;

export function getWhisperDir(): string {
  return path.resolve(
    process.env.WHISPER_CPP_DIR ?? path.join(process.cwd(), "whisper.cpp")
  );
}

import os from "node:os";
import { GoogleGenAI } from "@google/genai";

export function getWhisperTmpDir(): string {
  const onServerless = process.env.VERCEL === "1" || process.platform !== "win32";
  if (onServerless) {
    return path.join(os.tmpdir(), "whisper");
  }
  return path.join(process.cwd(), "tmp", "whisper");
}

/** Windows binary path used by @remotion/install-whisper-cpp for 1.5.x */
function getWhisperExecutablePath(whisperDir: string): string {
  if (process.platform === "win32") {
    return path.join(whisperDir, "main.exe");
  }
  return path.join(whisperDir, "main");
}

export function isWhisperInstalled(): boolean {
  const dir = getWhisperDir();
  const exe = getWhisperExecutablePath(dir);
  const modelPath = path.join(dir, `ggml-${WHISPER_MODEL}.bin`);
  return existsSync(exe) && existsSync(modelPath);
}

export async function ensureWhisperInstalled(): Promise<void> {
  const to = getWhisperDir();
  await installWhisperCpp({
    to,
    version: WHISPER_VERSION,
  });
  await downloadWhisperModel({
    model: WHISPER_MODEL,
    folder: to,
  });
}

export async function audioToWav16k(
  inputPath: string,
  outPath: string
): Promise<void> {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await execFileAsync(
    "ffmpeg",
    ["-y", "-i", inputPath, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", outPath],
    { windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
  );
}

export async function transcribeToCaptions(
  inputPath: string
): Promise<Caption[]> {
  if (!isWhisperInstalled()) {
    throw new Error(
      "Whisper.cpp is not installed. Run `npm run whisper:install` first."
    );
  }

  const whisperPath = getWhisperDir();
  const tmpDir = getWhisperTmpDir();
  await fs.mkdir(tmpDir, { recursive: true });

  const wavPath = path.join(
    tmpDir,
    `input-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.wav`
  );

  try {
    await audioToWav16k(inputPath, wavPath);

    const whisperCppOutput = await transcribe({
      model: WHISPER_MODEL,
      whisperPath,
      whisperCppVersion: WHISPER_VERSION,
      inputPath: wavPath,
      tokenLevelTimestamps: true,
      printOutput: false,
    });

    const { captions } = toCaptions({ whisperCppOutput });
    return captions;
  } finally {
    await fs.unlink(wavPath).catch(() => undefined);
  }
}

/** Resolve a project-relative path; rejects path traversal. */
export function resolveSafeInputPath(inputPath: string): string {
  const cwd = process.cwd();
  const resolved = path.resolve(cwd, inputPath);
  if (!resolved.startsWith(cwd + path.sep) && resolved !== cwd) {
    throw new Error("inputPath must be inside the project directory.");
  }
  if (!existsSync(resolved)) {
    throw new Error(`File not found: ${inputPath}`);
  }
  return resolved;
}

function isYoutubeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtu.be") ||
      url.hostname.includes("youtube-nocookie.com")
    );
  } catch {
    return false;
  }
}

export async function downloadSourceToTemp(sourceUrl: string): Promise<string> {
  const tmpDir = getWhisperTmpDir();
  await fs.mkdir(tmpDir, { recursive: true });

  if (isYoutubeUrl(sourceUrl)) {
    const dest = path.join(
      tmpDir,
      `download-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.bin`
    );
    const python = process.env.PYTHON_PATH ?? "python";
    const args = [
      "-m", "yt_dlp",
      "-f", "ba",
      "--no-playlist",
      "-o", dest,
      sourceUrl
    ];
    try {
      await execFileAsync(python, args, { windowsHide: true, timeout: 120000 });
      if (existsSync(dest)) {
        return dest;
      }
      throw new Error("yt-dlp completed but output file was not found.");
    } catch (err: any) {
      console.warn(`[whisper] Local python yt-dlp failed (${err.message}), trying Cobalt fallback...`);
      try {
        await downloadYoutubeAudioViaCobalt(sourceUrl, dest);
        if (existsSync(dest)) {
          return dest;
        }
      } catch (cobaltErr: any) {
        console.error("[whisper] Cobalt fallback also failed:", cobaltErr);
        throw new Error(
          `Failed to download YouTube video audio. Python yt-dlp failed (${err.message}) and Cobalt API fallback failed (${cobaltErr.message}).`
        );
      }
    }
  }

  const url = new URL(sourceUrl);
  const ext = path.extname(url.pathname) || ".bin";
  const dest = path.join(
    tmpDir,
    `download-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  );

  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to download source (${res.status}): ${sourceUrl}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  return dest;
}

async function downloadYoutubeAudioViaCobalt(sourceUrl: string, dest: string): Promise<void> {
  const COBALT_MIRRORS = [
    "https://api.cobalt.tools",
    "https://cobalt.sh123.top",
    "https://cobalt.api.ryzetech.live",
  ];

  let lastError: Error | null = null;

  for (const mirror of COBALT_MIRRORS) {
    try {
      console.log(`[whisper] Trying Cobalt download via mirror: ${mirror}`);
      const endpoint = `${mirror}/api/json`;
      
      // Try newer v10 schema
      let res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: sourceUrl,
          downloadMode: "audio",
          audioFormat: "mp3"
        })
      });

      // If 400 Bad Request, fall back to older v7/v8 schema
      if (res.status === 400) {
        console.warn(`[whisper] Cobalt v10 failed on ${mirror} (400), trying v7/v8 older schema...`);
        res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: sourceUrl,
            isAudioOnly: true,
            aFormat: "mp3"
          })
        });
      }

      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const data = (await res.json()) as { status: string; url?: string; text?: string };
      if (data.status === "error") {
        throw new Error(data.text ?? "Cobalt reports error status");
      }
      if (!data.url) {
        throw new Error("No download URL in response");
      }

      // Download the resolved audio file
      const audioRes = await fetch(data.url);
      if (!audioRes.ok) {
        throw new Error(`Failed to download audio bytes: status ${audioRes.status}`);
      }

      const buf = Buffer.from(await audioRes.arrayBuffer());
      await fs.writeFile(dest, buf);
      console.log(`[whisper] Cobalt download succeeded via: ${mirror}`);
      return; // Succeeded!
    } catch (err: any) {
      console.warn(`[whisper] Cobalt mirror ${mirror} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`All Cobalt API mirrors failed. Last error: ${lastError?.message ?? "unknown"}`);
}

async function geminiWhisperTranscribe(inputPath: string): Promise<Caption[]> {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const fileBuffer = await fs.readFile(inputPath);
  const base64Data = fileBuffer.toString("base64");

  const ext = path.extname(inputPath).toLowerCase();
  let mimeType = "audio/mp3";
  if (ext === ".wav") mimeType = "audio/wav";
  else if (ext === ".m4a") mimeType = "audio/m4a";
  else if (ext === ".ogg") mimeType = "audio/ogg";
  else if (ext === ".webm") mimeType = "audio/webm";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          {
            text: "Transcribe the audio exactly. Output the words with their millisecond timestamps in a compact pipe-delimited format. Each line must be exactly: word|startMs|endMs. Example:\nhello|100|400\nworld|400|800\nOutput ONLY the lines of text. Do not wrap in markdown blocks, do not write anything else.",
          },
        ],
      },
    ],
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty transcription response.");
  }

  const captions: Caption[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.startsWith("```")) continue;

    const parts = cleanLine.split("|");
    if (parts.length >= 3) {
      const word = parts[0]!.trim();
      const startMs = parseInt(parts[1]!.trim(), 10);
      const endMs = parseInt(parts[2]!.trim(), 10);

      if (word && !isNaN(startMs) && !isNaN(endMs)) {
        captions.push({
          text: word,
          startMs,
          endMs,
          timestampMs: Math.round((startMs + endMs) / 2),
          confidence: 1,
        });
      }
    }
  }

  if (captions.length === 0) {
    throw new Error("Gemini transcript did not return any word-level timings in the expected format.");
  }

  return captions;
}

export async function openaiWhisperTranscribe(inputPath: string): Promise<Caption[]> {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasGoogle = Boolean(process.env.GOOGLE_API_KEY);

  if (!hasOpenAI && !hasGoogle) {
    throw new Error("Neither OPENAI_API_KEY nor GOOGLE_API_KEY is set in environment variables.");
  }

  if (hasOpenAI) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const fileBuffer = await fs.readFile(inputPath);
      const filename = path.basename(inputPath);
      const ext = path.extname(filename).toLowerCase();
      const supported = [".flac", ".mp3", ".mp4", ".mpeg", ".mpga", ".m4a", ".ogg", ".wav", ".webm"];
      const finalFilename = supported.includes(ext) ? filename : "audio.wav";

      const formData = new FormData();
      const fileBlob = new Blob([fileBuffer], { type: "audio/mpeg" });
      formData.append("file", fileBlob, finalFilename);
      formData.append("model", "whisper-1");
      formData.append("response_format", "verbose_json");
      formData.append("timestamp_granularities[]", "word");

      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = (await res.json()) as {
          text: string;
          words?: { word: string; start: number; end: number }[];
        };

        if (data.words && data.words.length > 0) {
          return data.words.map((w) => ({
            text: w.word,
            startMs: Math.round(w.start * 1000),
            endMs: Math.round(w.end * 1000),
            timestampMs: Math.round(((w.start + w.end) / 2) * 1000),
            confidence: 1,
          }));
        }
        return [
          {
            text: data.text,
            startMs: 0,
            endMs: 15000,
            timestampMs: 7500,
            confidence: 1,
          },
        ];
      }
      const errText = await res.text();
      console.warn(`[whisper] OpenAI cloud transcription failed (${res.status}): ${errText}, trying Gemini fallback...`);
    } catch (err) {
      console.warn("[whisper] OpenAI cloud transcription threw error, trying Gemini fallback...", err);
    }
  }

  if (hasGoogle) {
    return await geminiWhisperTranscribe(inputPath);
  }

  throw new Error("Both OpenAI and Gemini cloud transcription fallbacks failed.");
}
