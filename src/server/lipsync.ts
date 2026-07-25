import type { Caption } from "@remotion/captions";
import { captionsToVisemes } from "@/lib/visemes";
import type { VisemeCue } from "@/types/feature-stack";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

const execFileAsync = promisify(execFile);

export function getRhubarbPath(): string | null {
  const env = process.env.RHUBARB_PATH;
  if (env && existsSync(env)) return env;
  const local = path.join(process.cwd(), "bin", "rhubarb", process.platform === "win32" ? "rhubarb.exe" : "rhubarb");
  if (existsSync(local)) return local;
  return null;
}

export function isRhubarbAvailable(): boolean {
  return getRhubarbPath() !== null;
}

/**
 * Parse Rhubarb JSON output into VisemeCue[].
 * Rhubarb mouth cues: A–H,X → we map H→B, G→E for Preston set.
 */
function parseRhubarbJson(raw: string): VisemeCue[] {
  const data = JSON.parse(raw) as {
    mouthCues?: Array<{ start: number; end: number; value: string }>;
  };
  const map: Record<string, VisemeCue["value"]> = {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
    F: "F",
    G: "E",
    H: "B",
    X: "X",
  };
  return (data.mouthCues ?? []).map((c) => ({
    value: map[c.value] ?? "X",
    startMs: Math.round(c.start * 1000),
    endMs: Math.round(c.end * 1000),
  }));
}

export async function generateVisemesFromCaptions(
  captions: Caption[]
): Promise<VisemeCue[]> {
  return captionsToVisemes(
    captions.map((c) => ({
      text: c.text,
      startMs: c.startMs,
      endMs: c.endMs,
    }))
  );
}

/** Prefer Rhubarb when installed; otherwise caption→viseme map. */
export async function generateVisemesFromAudio(
  audioPath: string,
  captionsFallback?: Caption[]
): Promise<{ visemes: VisemeCue[]; engine: "rhubarb" | "caption-map" }> {
  const rhubarb = getRhubarbPath();
  if (rhubarb) {
    try {
      const outJson = path.join(
        path.dirname(audioPath),
        `visemes-${Date.now()}.json`
      );
      await execFileAsync(
        rhubarb,
        ["-f", "json", "-o", outJson, audioPath],
        { windowsHide: true, timeout: 300000 }
      );
      const raw = await fs.readFile(outJson, "utf8");
      await fs.unlink(outJson).catch(() => undefined);
      return { visemes: parseRhubarbJson(raw), engine: "rhubarb" };
    } catch (err) {
      console.warn("[lipsync] Rhubarb failed, falling back:", err);
    }
  }

  if (captionsFallback?.length) {
    return {
      visemes: await generateVisemesFromCaptions(captionsFallback),
      engine: "caption-map",
    };
  }

  return {
    visemes: [{ value: "X", startMs: 0, endMs: 1000 }],
    engine: "caption-map",
  };
}
