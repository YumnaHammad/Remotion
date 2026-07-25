import { NextResponse } from "next/server";
import { z } from "zod";
import { runBreakdown } from "@/server/breakdown-service";
import { toPipelineOptions } from "@/lib/pipeline/pipeline-request-schema";

export const runtime = "nodejs";

const BodySchema = z.object({
  script: z.string().min(10, "Script must be at least 10 characters"),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
  source: z.enum(["client", "server"]).optional(),
  useExternalApis: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const { recipe, mode } = await runBreakdown(
      body.script,
      body.aspectRatio,
      toPipelineOptions(body)
    );

    return NextResponse.json({
      ok: true,
      recipe,
      mode,
      source: body.source ?? "server",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Breakdown failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
