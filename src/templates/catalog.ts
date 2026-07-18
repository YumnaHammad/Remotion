import type { AspectRatio } from "@/types";
import type { LongFormCategory, TemplateDifficulty } from "@/types/scene-video";
import type { VideoScene } from "@/types/scene-video";
import { MOCK_TEMPLATES } from "@/data/mock";
import {
  REMOTION_OFFICIAL_CATALOG,
  REMOTION_OFFICIAL_DIMS,
} from "@/templates/remotion-official-catalog";
import {
  buildLongFormCatalogItems,
  LONG_FORM_CATEGORIES,
} from "@/templates/long-form-catalog";

export type TemplateCategory =
  | "Official"
  | "Starter"
  | "Social"
  | "Product"
  | "Business"
  | "Podcast"
  | "News"
  | "Creative";

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
  premium?: boolean;
  /** Best suited for website or data automation */
  useCases: ("website" | "data" | "manual")[];
  /** From remotion.dev/templates */
  official?: boolean;
  remotionUrl?: string;
  /** Long-form multi-scene template (30s–5min) */
  longForm?: boolean;
  longFormCategory?: LongFormCategory;
  difficulty?: TemplateDifficulty;
  estimatedDuration?: string;
  featured?: boolean;
  trending?: boolean;
  sceneCount?: number;
  defaultScenes?: Omit<VideoScene, "id">[];
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
  LongFormVideo: { width: 1920, height: 1080, fps: 30, durationInFrames: 3600, aspectRatio: "16:9" },
  ...REMOTION_OFFICIAL_DIMS,
};

const CATEGORY_MAP: Record<string, TemplateCategory> = {
  "YouTube Shorts": "Social",
  "Instagram Reels": "Social",
  TikTok: "Social",
  Podcast: "Podcast",
  "Product Ads": "Product",
  "Startup Promo": "Business",
  News: "News",
  Motivational: "Social",
  Explainer: "Business",
  "SaaS Demos": "Business",
};

/** Built-in marketing templates (custom compositions). */
export const BUILTIN_TEMPLATE_CATALOG: TemplateCatalogItem[] = MOCK_TEMPLATES.map((t) => {
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
    premium: t.premium,
    useCases,
  };
});

/** Premium long-form templates (25 layouts, 30s–5min). */
export const LONG_FORM_TEMPLATE_CATALOG = buildLongFormCatalogItems();

/** Full template gallery — long-form + official demos + built-in templates. */
export const TEMPLATE_CATALOG: TemplateCatalogItem[] = [
  ...LONG_FORM_TEMPLATE_CATALOG,
  ...REMOTION_OFFICIAL_CATALOG,
  ...BUILTIN_TEMPLATE_CATALOG,
];

export { LONG_FORM_CATEGORIES };

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Official",
  "Starter",
  "Social",
  "Product",
  "Business",
  "Podcast",
  "News",
  "Creative",
];

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
