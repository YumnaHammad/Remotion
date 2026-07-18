import type { BrandSettings, VideoTemplateProps } from "@/types/video";
import type { TemplateCatalogItem } from "@/templates/catalog";
import { getCompositionDimensions } from "@/templates/catalog";
import { applyBrandToProps } from "@/utils/brand-defaults";
import { genId } from "@/lib/project-factory";
import type { SimpleVideoProject, UrlMetadata, DataRow } from "@/types/video";

/** Build default template props with brand kit applied. */
export function buildTemplateProps(
  brand: BrandSettings,
  overrides: Partial<VideoTemplateProps> = {}
): VideoTemplateProps {
  const base: VideoTemplateProps = {
    title: "Your Title",
    subtitle: "Your subtitle here",
    accent: brand.colors.accent,
    brandColor: brand.colors.primary,
    fontFamily: brand.fontFamily,
    musicUrl: brand.musicUrl,
    ...overrides,
  };
  return applyBrandToProps(base, brand);
}

/** Create a simple video project from a template catalog item. */
export function createProjectFromTemplate(
  template: TemplateCatalogItem,
  brand: BrandSettings,
  propsOverrides: Partial<VideoTemplateProps> = {},
  meta?: { name?: string; sourceType?: SimpleVideoProject["sourceType"] }
): SimpleVideoProject {
  const dims = getCompositionDimensions(template.compositionId);
  const props = buildTemplateProps(brand, propsOverrides);
  const now = new Date().toISOString();

  return {
    id: genId("svp"),
    name: meta?.name ?? template.name,
    sourceType: meta?.sourceType ?? "template",
    compositionId: template.compositionId,
    templateId: template.id,
    props,
    aspectRatio: dims.aspectRatio,
    durationInFrames: dims.durationInFrames,
    fps: dims.fps,
    width: dims.width,
    height: dims.height,
    createdAt: now,
    updatedAt: now,
    status: "draft",
  };
}

/** Map website metadata into template props. */
export function propsFromWebsite(
  metadata: UrlMetadata,
  brand: BrandSettings
): VideoTemplateProps {
  return buildTemplateProps(brand, {
    title: metadata.title.slice(0, 80),
    subtitle:
      metadata.description.slice(0, 160) ||
      metadata.siteName ||
      metadata.url,
    imageUrl: metadata.image,
  });
}

/** Map parsed spreadsheet rows into DataSlideshow props. */
export function propsFromData(
  title: string,
  subtitle: string,
  rows: DataRow[],
  columns: string[],
  brand: BrandSettings
) {
  return {
    title,
    subtitle,
    accent: brand.colors.accent,
    brandColor: brand.colors.primary,
    fontFamily: brand.fontFamily,
    rows: rows.slice(0, 20),
    columns,
  };
}

/** Dynamic duration for data slideshow based on row count. */
export function dataVideoDuration(rowCount: number): number {
  const slides = Math.min(rowCount, 8);
  return 60 + slides * 60; // title card + rows
}
