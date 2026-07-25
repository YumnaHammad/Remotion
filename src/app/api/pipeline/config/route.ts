import { NextResponse } from "next/server";
import {
  isExternalPipelineEnabled,
  serverExternalAvailable,
} from "@/server/providers/pipeline-config";

export const runtime = "nodejs";

/** Report which server-side pipeline capabilities are available. */
export async function GET() {
  const keys = serverExternalAvailable();
  return NextResponse.json({
    ok: true,
    envExternalEnabled: isExternalPipelineEnabled(),
    capabilities: {
      llm: keys.llm,
      tts: keys.tts,
      stock: keys.stock,
      render: process.env.REMOTION_RENDER !== "0",
      fasterWhisper: await import("@/server/faster-whisper").then((m) =>
        m.isFasterWhisperAvailable()
      ),
      whisperCpp: await import("@/server/whisper").then((m) =>
        m.isWhisperInstalled()
      ),
    },
  });
}
