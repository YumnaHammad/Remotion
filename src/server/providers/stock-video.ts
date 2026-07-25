import fs from "fs/promises";
import path from "path";
import type { EditRecipeAspectRatio } from "@/types/edit-recipe";
import { pickLocalStockUrl } from "@/lib/pipeline/local-stock";
import {
  resolveUseExternalApis,
  type PipelineRequestOptions,
} from "./pipeline-config";

interface PexelsVideoFile {
  link: string;
  width: number;
  height: number;
  quality?: string;
}

interface PexelsVideo {
  video_files: PexelsVideoFile[];
}

function pickBestFile(
  files: PexelsVideoFile[],
  aspectRatio: EditRecipeAspectRatio
): PexelsVideoFile | undefined {
  const hd = files.filter(
    (f) => f.quality === "hd" || f.quality === "sd" || !f.quality
  );
  const pool = hd.length ? hd : files;
  if (!pool.length) return undefined;

  const portrait = aspectRatio === "9:16" || aspectRatio === "1:1";
  const sorted = [...pool].sort((a, b) => {
    const aScore = portrait ? a.height - a.width : a.width - a.height;
    const bScore = portrait ? b.height - b.width : b.width - b.height;
    return bScore - aScore;
  });
  return sorted[0];
}

async function searchPexels(
  keyword: string,
  aspectRatio: EditRecipeAspectRatio
): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const orientation =
    aspectRatio === "9:16" || aspectRatio === "1:1" ? "portrait" : "landscape";

  const url = new URL("https://api.pexels.com/videos/search");
  url.searchParams.set("query", keyword);
  url.searchParams.set("per_page", "5");
  url.searchParams.set("orientation", orientation);

  const res = await fetch(url.toString(), {
    headers: { Authorization: apiKey },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { videos?: PexelsVideo[] };
  for (const video of data.videos ?? []) {
    const file = pickBestFile(video.video_files ?? [], aspectRatio);
    if (file?.link) return file.link;
  }
  return null;
}

function localStockUrl(keyword: string, sceneIndex = 0): string {
  return pickLocalStockUrl(keyword, sceneIndex);
}

async function downloadStock(
  remoteUrl: string,
  outputPath: string
): Promise<string> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
  const filename = path.basename(outputPath);
  const jobDir = path.basename(path.dirname(outputPath));
  return `/generated-assets/${jobDir}/${filename}`;
}

export async function fetchStockVideo(
  keyword: string,
  aspectRatio: EditRecipeAspectRatio,
  outputPath: string,
  sceneIndex = 0,
  options?: PipelineRequestOptions
): Promise<{ url: string; mode: "local" | "external" }> {
  const useExternal = resolveUseExternalApis(options);

  if (useExternal && process.env.PEXELS_API_KEY) {
    try {
      const remoteUrl = await searchPexels(keyword, aspectRatio);
      if (remoteUrl) {
        const url = await downloadStock(remoteUrl, outputPath);
        return { url, mode: "external" };
      }
    } catch {
      // fall through to local
    }
  }

  return { url: localStockUrl(keyword, sceneIndex), mode: "local" };
}
