import type { AspectRatio } from "@/types";
import { MOCK_TEMPLATES } from "@/data/mock";

export type TemplateCategory =
  | "Social"
  | "Product"
  | "Business"
  | "Podcast"
  | "News";

export interface TemplateCatalogItem {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  compositionId: string;
  aspectRatio: AspectRatio;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  thumbnail: string;
  popular?: boolean;
  /** Best suited for website or data automation */
  useCases: ("website" | "data" | "manual")[];
}

const REGISTRY_DIMS: Record<
  string,
  { width: number; height: number; fps: number; durationInFrames: number; aspectRatio: AspectRatio }
> = {
  YoutubeShort: { width: 1080, height: 1920, fps: 30, durationInFrames: 150, aspectRatio: "9:16" },
  InstagramReel: { width: 1080, height: 1920, fps: 30, durationInFrames: 180, aspectRatio: "9:16" },
  TikTokTrend: { width: 1080, height: 1920, fps: 30, durationInFrames: 120, aspectRatio: "9:16" },
  PodcastOpener: { width: 1920, height: 1080, fps: 30, durationInFrames: 150, aspectRatio: "16:9" },
  ProductAd: { width: 1920, height: 1080, fps: 30, durationInFrames: 240, aspectRatio: "16:9" },
  StartupPromo: { width: 1920, height: 1080, fps: 30, durationInFrames: 210, aspectRatio: "16:9" },
  NewsVideo: { width: 1920, height: 1080, fps: 30, durationInFrames: 180, aspectRatio: "16:9" },
  Motivational: { width: 1080, height: 1920, fps: 30, durationInFrames: 150, aspectRatio: "9:16" },
  Explainer: { width: 1920, height: 1080, fps: 30, durationInFrames: 270, aspectRatio: "16:9" },
  SaasDemo: { width: 1920, height: 1080, fps: 30, durationInFrames: 300, aspectRatio: "16:9" },
  DataSlideshow: { width: 1920, height: 1080, fps: 30, durationInFrames: 300, aspectRatio: "16:9" },
};

const CATEGORY_MAP: Record<string, TemplateCategory> = {
  "YouTube Shorts": "Social",
  "Instagram Reels": "Social",
  TikTok: "Social",
  Podcast: "Podcast",
  "Product Ads": "Product",
  Startup: "Business",
  News: "News",
  Motivational: "Social",
  Explainer: "Business",
  SaaS: "Business",
};

/** Template gallery catalog — maps UI cards to Remotion composition IDs. */
export const TEMPLATE_CATALOG: TemplateCatalogItem[] = MOCK_TEMPLATES.map((t) => {
  const dims = REGISTRY_DIMS[t.compositionId] ?? REGISTRY_DIMS.ProductAd;
  const useCases: TemplateCatalogItem["useCases"] =
    t.compositionId === "ProductAd" || t.compositionId === "SaasDemo"
      ? ["website", "manual"]
      : t.compositionId === "NewsVideo" || t.compositionId === "Explainer"
        ? ["data", "manual"]
        : ["manual", "website"];

  return {
    id: t.id,
    name: t.name,
    description: t.description,
    category: CATEGORY_MAP[t.category] ?? "Business",
    compositionId: t.compositionId,
    aspectRatio: dims.aspectRatio,
    durationInFrames: dims.durationInFrames,
    fps: dims.fps,
    width: dims.width,
    height: dims.height,
    thumbnail: t.thumbnail,
    popular: t.popular,
    useCases,
  };
});

/** Data-only template for CSV/Excel/JSON uploads. */
export const DATA_TEMPLATE: TemplateCatalogItem = {
  id: "tpl-data",
  name: "Data Slideshow",
  description: "Turn spreadsheet rows into animated slides",
  category: "Business",
  compositionId: "DataSlideshow",
  aspectRatio: "16:9",
  durationInFrames: 300,
  fps: 30,
  width: 1920,
  height: 1080,
  thumbnail: "gradient-6",
  useCases: ["data"],
};

export function getTemplateById(id: string): TemplateCatalogItem | undefined {
  if (id === DATA_TEMPLATE.id) return DATA_TEMPLATE;
  return TEMPLATE_CATALOG.find((t) => t.id === id);
}

export function getTemplateByCompositionId(
  compositionId: string
): TemplateCatalogItem | undefined {
  if (compositionId === "DataSlideshow") return DATA_TEMPLATE;
  return TEMPLATE_CATALOG.find((t) => t.compositionId === compositionId);
}

export function getCompositionDimensions(compositionId: string) {
  return REGISTRY_DIMS[compositionId] ?? REGISTRY_DIMS.ProductAd;
}
