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

export function getWhisperTmpDir(): string {
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
      throw new Error(`Failed to download YouTube video audio: ${err.message}`);
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
