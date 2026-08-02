import { NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  prompt: z.string().min(3).max(4000),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional(),
});

function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY?.trim();
  if (!key) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }
  return key;
}

export async function POST(req: Request) {
  try {
    const apiKey = getApiKey();
    const json = await req.json();
    const body = BodySchema.parse(json);

    const ai = new GoogleGenAI({ apiKey });

    // Map editor ratio to Imagen aspect ratios (supported: "1:1", "3:4", "4:3", "9:16", "16:9")
    const ratioMap = {
      "16:9": "16:9" as const,
      "9:16": "9:16" as const,
      "1:1": "1:1" as const,
    };
    const aspectRatio = ratioMap[body.aspectRatio ?? "1:1"] ?? "1:1";

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: body.prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio,
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) {
      throw new Error("No image was returned from the generator");
    }

    const buffer = Buffer.from(imageBytes, "base64");
    const filename = `ai-image-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;
    
    // Save to local uploads
    const publicDir = path.join(process.cwd(), "public", "generated-assets", "uploads");
    await fs.mkdir(publicDir, { recursive: true });
    
    const filePath = path.join(publicDir, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/generated-assets/uploads/${filename}`;

    return NextResponse.json({
      ok: true,
      url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI image generation failed";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
