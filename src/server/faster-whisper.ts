import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import type { Caption } from "@remotion/captions";

const execFileAsync = promisify(execFile);

export type TranscriptionEngine = "whisper-cpp" | "faster-whisper";

export function getDefaultTranscriptionEngine(): TranscriptionEngine {
  const env = process.env.TRANSCRIPTION_ENGINE;
  if (env === "faster-whisper" || env === "whisper-cpp") return env;
  return "faster-whisper";
}

export function resolveTranscriptionEngine(
  requested?: TranscriptionEngine
): TranscriptionEngine {
  return requested ?? getDefaultTranscriptionEngine();
}

function getPythonPath(): string {
  return process.env.PYTHON_PATH ?? "python";
}

function getFasterWhisperScript(): string {
  return path.join(process.cwd(), "scripts", "transcribe-faster-whisper.py");
}

export async function isFasterWhisperAvailable(): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync(
      getPythonPath(),
      ["-c", "import faster_whisper"],
      { windowsHide: true, timeout: 15000 }
    );
    void stdout;
    return true;
  } catch {
    return false;
  }
}

export async function transcribeWithFasterWhisper(
  inputPath: string
): Promise<Caption[]> {
  const script = getFasterWhisperScript();
  const model = process.env.FASTER_WHISPER_MODEL ?? "base.en";
  const device = process.env.FASTER_WHISPER_DEVICE ?? "cpu";
  const computeType = process.env.FASTER_WHISPER_COMPUTE_TYPE ?? "int8";

  const { stdout } = await execFileAsync(
    getPythonPath(),
    [
      script,
      inputPath,
      "--model",
      model,
      "--device",
      device,
      "--compute-type",
      computeType,
    ],
    {
      windowsHide: true,
      maxBuffer: 50 * 1024 * 1024,
      timeout: 600000,
    }
  );

  const parsed = JSON.parse(stdout) as {
    ok?: boolean;
    error?: string;
    captions?: Caption[];
  };

  if (!parsed.ok || !parsed.captions) {
    throw new Error(parsed.error ?? "faster-whisper returned no captions");
  }

  return parsed.captions.map((c) => ({
    ...c,
    confidence: c.confidence ?? null,
  }));
}
