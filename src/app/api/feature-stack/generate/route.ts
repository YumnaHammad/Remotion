import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { generateVoiceover } from "@/server/providers/tts";
import { resolveMusicUrl } from "@/server/providers/audio-resolver";
import { generateVisemesFromAudio } from "@/server/lipsync";
import { transcribeMediaToCaptions } from "@/server/transcription-service";
import { resolveUseExternalApis } from "@/server/providers/pipeline-config";
import { captionsToVisemes } from "@/lib/visemes";
import { defaultCityCameraPath } from "@/lib/camera-path";
import type {
  CharacterMapVideoProps,
  LandmarkFrame,
} from "@/types/feature-stack";
import { characterMapDuration } from "@/remotion/compositions/character-map-schema";
import { genId } from "@/lib/project-factory";
import { resolveStoryLook } from "@/lib/story-look";

export const runtime = "nodejs";
export const maxDuration = 300;

const ScriptBody = z.object({
  route: z.enum(["script"]).optional(),
  script: z.string().min(1).max(8000),
  title: z.string().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("9:16"),
  accent: z.string().optional(),
  brandColor: z.string().optional(),
  useExternalApis: z.boolean().optional(),
  showMap: z.boolean().optional(),
  showCharacter: z.boolean().optional(),
  mapSeed: z.number().optional(),
  riveSrc: z.string().optional(),
  characterPrompt: z.string().max(500).optional(),
  worldPrompt: z.string().max(500).optional(),
});

const ReferenceBody = z.object({
  route: z.enum(["reference"]),
  title: z.string().optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("9:16"),
  accent: z.string().optional(),
  brandColor: z.string().optional(),
  /** Client-extracted MediaPipe frames */
  landmarks: z.array(z.any()).optional(),
  /** Optional audio/video URL already uploaded under /generated-assets or public */
  mediaUrl: z.string().optional(),
  showMap: z.boolean().optional(),
  showCharacter: z.boolean().optional(),
  mapSeed: z.number().optional(),
  riveSrc: z.string().optional(),
  characterPrompt: z.string().max(500).optional(),
  worldPrompt: z.string().max(500).optional(),
});

function wordsFromScript(script: string, _fps: number) {
  const words = script
    .replace(/\[[^\]]+\]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  const msPerWord = 280;
  let t = 0;
  return words.map((text) => {
    const startMs = t;
    const endMs = t + msPerWord;
    t = endMs + 40;
    return {
      text,
      startMs,
      endMs,
      timestampMs: Math.round((startMs + endMs) / 2),
      confidence: 1 as number | null,
    };
  });
}

type StackCaption = NonNullable<CharacterMapVideoProps["captions"]>[number];

function normalizeCaptions(
  captions: Array<{
    text: string;
    startMs: number;
    endMs: number;
    timestampMs?: number | null;
    confidence?: number | null;
  }>
): StackCaption[] {
  return captions.map((c) => ({
    text: c.text,
    startMs: c.startMs,
    endMs: c.endMs,
    timestampMs:
      typeof c.timestampMs === "number"
        ? c.timestampMs
        : Math.round((c.startMs + c.endMs) / 2),
    confidence: c.confidence ?? null,
  }));
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let landmarks: LandmarkFrame[] = [];
    let bodyJson: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const route = String(form.get("route") ?? "reference");
      const landmarksRaw = form.get("landmarks");
      if (typeof landmarksRaw === "string") {
        landmarks = JSON.parse(landmarksRaw) as LandmarkFrame[];
      }
      const file = form.get("file");
      let mediaUrl: string | undefined;
      if (file instanceof File) {
        const jobId = genId("ref");
        const dir = path.join(process.cwd(), "public", "generated-assets", jobId);
        await fs.mkdir(dir, { recursive: true });
        const ext = path.extname(file.name) || ".mp4";
        const dest = path.join(dir, `reference${ext}`);
        await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
        mediaUrl = `/generated-assets/${jobId}/reference${ext}`;
      }
      bodyJson = {
        route,
        title: form.get("title") || "Reference Puppet",
        aspectRatio: form.get("aspectRatio") || "9:16",
        accent: form.get("accent") || undefined,
        brandColor: form.get("brandColor") || undefined,
        mediaUrl,
        landmarks,
        showMap: form.get("showMap") !== "0",
        showCharacter: form.get("showCharacter") !== "0",
        mapSeed: form.get("mapSeed")
          ? Number(form.get("mapSeed"))
          : undefined,
        riveSrc: (form.get("riveSrc") as string) || undefined,
      };
    } else {
      bodyJson = (await req.json()) as Record<string, unknown>;
    }

    const route =
      bodyJson.route === "reference" ? "reference" : "script";

    if (route === "script") {
      const body = ScriptBody.parse({ ...bodyJson, route: "script" as const });
      const jobId = genId("feat");
      const assetsDir = path.join(
        process.cwd(),
        "public",
        "generated-assets",
        jobId
      );
      await fs.mkdir(assetsDir, { recursive: true });

      const voiceoverPath = path.join(assetsDir, "voiceover.mp3");
      const useExternal = resolveUseExternalApis({
        useExternalApis: body.useExternalApis,
      });
      const vo = await generateVoiceover(body.script, voiceoverPath, {
        useExternalApis: useExternal,
      });

      let captions: StackCaption[] = wordsFromScript(body.script, 30);
      let visemes = captionsToVisemes(captions);
      let engine = "caption-map";

      // Prefer Whisper timing on real audio when available
      try {
        const absVo = path.join(
          process.cwd(),
          "public",
          vo.url.replace(/^\//, "")
        );
        const audioFile = vo.url.startsWith("http") ? null : absVo;
        if (audioFile) {
          const tx = await transcribeMediaToCaptions(audioFile);
          if (tx.captions.length) {
            captions = normalizeCaptions(tx.captions);
            const lips = await generateVisemesFromAudio(audioFile, tx.captions);
            visemes = lips.visemes;
            engine = lips.engine;
          }
        }
      } catch {
        captions = wordsFromScript(body.script, 30);
        visemes = captionsToVisemes(captions);
      }

      const durationHintFrames = Math.max(
        90,
        Math.ceil((Math.max(...captions.map((c) => c.endMs), 1000) / 1000) * 30) +
          45
      );

      const look = resolveStoryLook({
        characterPrompt: body.characterPrompt,
        worldPrompt: body.worldPrompt,
        script: body.script,
        accent: body.accent,
        brandColor: body.brandColor,
      });

      const props: CharacterMapVideoProps = {
        title: body.title ?? "Script Story",
        accent: look.character.accent,
        brandColor: look.character.shirt,
        aspectRatio: body.aspectRatio,
        voiceoverUrl: vo.url,
        backgroundMusicUrl: resolveMusicUrl("cinematic"),
        captions,
        visemes,
        route: "script",
        showMap: body.showMap ?? true,
        showCharacter: body.showCharacter ?? true,
        mapSeed: look.map.seed,
        riveSrc: body.riveSrc,
        cameraPath: defaultCityCameraPath(durationHintFrames),
        durationHintFrames,
        characterLook: look.character,
        mapLook: look.map,
      };

      return NextResponse.json({
        ok: true,
        compositionId: "CharacterMapVideo",
        jobId,
        lipsyncEngine: engine,
        voiceMode: vo.mode,
        props,
        durationInFrames: characterMapDuration(props),
      });
    }

    const body = ReferenceBody.parse({
      ...bodyJson,
      route: "reference" as const,
    });
    landmarks = (body.landmarks as LandmarkFrame[]) ?? landmarks;

    let captions: StackCaption[] = wordsFromScript(
      "Your story, retargeted onto the character.",
      30
    );
    let visemes = captionsToVisemes(captions);
    let voiceoverUrl: string | undefined = body.mediaUrl;

    if (body.mediaUrl && !body.mediaUrl.startsWith("http")) {
      const abs = path.join(
        process.cwd(),
        "public",
        body.mediaUrl.replace(/^\//, "")
      );
      try {
        const tx = await transcribeMediaToCaptions(abs);
        if (tx.captions.length) {
          captions = normalizeCaptions(tx.captions);
          const lips = await generateVisemesFromAudio(abs, tx.captions);
          visemes = lips.visemes;
        }
      } catch (err) {
        console.warn("[feature-stack] ref transcribe:", err);
      }
    }

    // If puppet landmarks drive mouth, still keep visemes as fallback
    const lastFrame = landmarks.reduce((m, l) => Math.max(m, l.frame), 0);
    const durationHintFrames = Math.max(
      90,
      lastFrame + 30,
      Math.ceil(
        (Math.max(...captions.map((c) => c.endMs), 3000) / 1000) * 30
      ) + 30
    );

    const look = resolveStoryLook({
      characterPrompt: body.characterPrompt,
      worldPrompt: body.worldPrompt,
      script: "Your story, retargeted onto the character.",
      accent: body.accent,
      brandColor: body.brandColor,
    });

    const props: CharacterMapVideoProps = {
      title: body.title ?? "Reference Puppet",
      accent: look.character.accent,
      brandColor: look.character.shirt,
      aspectRatio: body.aspectRatio,
      voiceoverUrl,
      backgroundMusicUrl: resolveMusicUrl("ambient"),
      captions,
      visemes,
      landmarks,
      route: "reference",
      showMap: body.showMap ?? true,
      showCharacter: body.showCharacter ?? true,
      mapSeed: look.map.seed,
      riveSrc: body.riveSrc,
      cameraPath: defaultCityCameraPath(durationHintFrames),
      durationHintFrames,
      characterLook: look.character,
      mapLook: look.map,
    };

    return NextResponse.json({
      ok: true,
      compositionId: "CharacterMapVideo",
      props,
      durationInFrames: characterMapDuration(props),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Feature stack generate failed";
    console.error("[feature-stack]", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
