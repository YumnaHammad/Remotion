import { NextResponse } from "next/server";
import { z } from "zod";
import { runFullGeneration } from "@/server/breakdown-service";
import { toPipelineOptions } from "@/lib/pipeline/pipeline-request-schema";
import {
  aspectRatioToDimensions,
  editRecipeDuration,
} from "@/types/edit-recipe";

export const runtime = "nodejs";
export const maxDuration = 180;

const BodySchema = z.object({
  script: z.string().min(10, "Script must be at least 10 characters"),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  accent: z.string().optional(),
  brandColor: z.string().optional(),
  fontFamily: z.string().optional(),
  source: z.enum(["client", "server"]).optional(),
  useExternalApis: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const result = await runFullGeneration({
      ...body,
      ...toPipelineOptions(body),
    });

    const dims = aspectRatioToDimensions(result.resolved.aspectRatio);
    const durationInFrames = editRecipeDuration(result.resolved);

    const inputProps = {
      title: result.resolved.title,
      accent: result.resolved.accent,
      brandColor: result.resolved.brandColor,
      aspectRatio: result.resolved.aspectRatio,
      fontFamily: result.resolved.fontFamily,
      voiceoverUrl: result.resolved.voiceoverUrl,
      backgroundMusicUrl: result.resolved.backgroundMusicUrl,
      captions: result.resolved.captions,
      scenes: result.resolved.scenes,
    };

    return NextResponse.json({
      ok: true,
      recipe: result.recipe,
      resolved: result.resolved,
      jobId: result.jobId,
      breakdownMode: result.breakdownMode,
      assetModes: result.assetModes,
      compositionId: "AutomatedVideo",
      durationInFrames,
      fps: 30,
      width: dims.width,
      height: dims.height,
      aspectRatio: result.resolved.aspectRatio,
      inputProps,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
