import type { EditRecipe, EditRecipeAspectRatio } from "@/types/edit-recipe";
import { editRecipeSchema } from "@/server/edit-recipe-schema";
import { genId } from "@/lib/project-factory";
import {
  localBreakdown,
  syncVoiceoverText,
} from "@/lib/pipeline/local-breakdown";
import {
  resolveUseExternalApis,
  type PipelineRequestOptions,
} from "./pipeline-config";

export { localBreakdown, syncVoiceoverText };

const SYSTEM_PROMPT = `You are a video editor AI. Given a script, output a JSON edit recipe for an automated video.

Rules:
- Split the script into 3-8 scenes with natural pacing (~2-4 seconds each at 30fps = 60-120 frames)
- Remove inline SFX tags like [WHOOSH EFFECT] from subtitleText and voiceoverText
- Map SFX tags to soundEffect keywords: whoosh, ding, pop, page
- stockVideoKeyword should be a search phrase (2-4 words) matching the scene mood
- startFrame must be sequential (scene N starts where scene N-1 ends)
- animationStyle: fade, zoom, or neon-glow
- transition: fade-out or crossfade between scenes
- voiceoverText: full clean narration without bracket tags
- backgroundMusicKeyword: e.g. "corporate upbeat", "cinematic dramatic", "social lofi"

Output ONLY valid JSON.`;

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1]!.trim() : text.trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("LLM response did not contain valid JSON");
  }
}

async function externalBreakdown(
  script: string,
  aspectRatio: EditRecipeAspectRatio
): Promise<EditRecipe> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const model = process.env.LLM_MODEL ?? "gpt-4o";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Aspect ratio: ${aspectRatio}\n\nScript:\n${script}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM breakdown failed (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");

  const parsed = extractJson(content) as Record<string, unknown>;
  parsed.aspectRatio = aspectRatio;
  parsed.fps = 30;

  if (Array.isArray(parsed.scenes)) {
    let cursor = 0;
    parsed.scenes = (parsed.scenes as Record<string, unknown>[]).map(
      (scene, i) => {
        const duration =
          typeof scene.durationInFrames === "number" ? scene.durationInFrames : 90;
        const startFrame = cursor;
        cursor += duration;
        return {
          ...scene,
          id: typeof scene.id === "string" ? scene.id : genId("scene"),
          startFrame,
          durationInFrames: duration,
        };
      }
    );
  }

  return editRecipeSchema.parse(parsed);
}

export async function breakdownScript(
  script: string,
  aspectRatio: EditRecipeAspectRatio = "16:9",
  options?: PipelineRequestOptions
): Promise<{ recipe: EditRecipe; mode: "local" | "external" }> {
  // If the script contains timestamps, bypass LLM to preserve exact timeline mappings
  const hasTimestamps = script.match(/\[\d{1,2}:\d{2}/);
  if (hasTimestamps) {
    return { recipe: localBreakdown(script, aspectRatio), mode: "local" };
  }

  const useExternal = resolveUseExternalApis(options);

  if (useExternal && process.env.OPENAI_API_KEY) {
    try {
      const recipe = await externalBreakdown(script, aspectRatio);
      return { recipe, mode: "external" };
    } catch {
      return { recipe: localBreakdown(script, aspectRatio), mode: "local" };
    }
  }

  return { recipe: localBreakdown(script, aspectRatio), mode: "local" };
}
