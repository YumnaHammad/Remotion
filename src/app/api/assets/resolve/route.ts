import { NextResponse } from "next/server";
import { z } from "zod";
import { editRecipeSchema } from "@/server/edit-recipe-schema";
import { resolveEditRecipeAssets } from "@/server/asset-resolver";
import { toPipelineOptions } from "@/lib/pipeline/pipeline-request-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const BodySchema = z.object({
  recipe: editRecipeSchema,
  accent: z.string().optional(),
  brandColor: z.string().optional(),
  fontFamily: z.string().optional(),
  jobId: z.string().optional(),
  source: z.enum(["client", "server"]).optional(),
  useExternalApis: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const result = await resolveEditRecipeAssets({
      recipe: body.recipe,
      jobId: body.jobId,
      accent: body.accent,
      brandColor: body.brandColor,
      fontFamily: body.fontFamily,
      ...toPipelineOptions(body),
    });

    return NextResponse.json({
      ok: true,
      resolved: result.resolved,
      jobId: result.jobId,
      modes: result.modes,
      source: body.source ?? "server",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Asset resolution failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
