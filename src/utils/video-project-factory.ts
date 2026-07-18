import type { BrandSettings, VideoTemplateProps } from "@/types/video";
import type { SceneVideoProps } from "@/types/scene-video";
import type { TemplateCatalogItem } from "@/templates/catalog";
import { getCompositionDimensions } from "@/templates/catalog";
import { applyBrandToProps } from "@/utils/brand-defaults";
import { genId } from "@/lib/project-factory";
import { scenesWithIds } from "@/lib/scene-presets";
import { totalSceneDuration } from "@/types/scene-video";
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
    logoUrl: brand.logoUrl,
    musicUrl: brand.musicUrl,
    ...overrides,
  };
  return applyBrandToProps(base, brand);
}

/** Build Remotion inputProps for preview/export from a catalog template. */
export function buildInputPropsForTemplate(
  template: TemplateCatalogItem,
  brand: BrandSettings,
  overrides: Partial<VideoTemplateProps> = {}
): Record<string, unknown> {
  if (template.longForm && template.defaultScenes) {
    const scenes = scenesWithIds(template.defaultScenes);
    const sceneProps: SceneVideoProps = {
      title: overrides.title ?? template.name,
      subtitle: overrides.subtitle ?? template.description.slice(0, 80),
      accent: overrides.accent ?? brand.colors.accent,
      brandColor: overrides.brandColor ?? brand.colors.primary,
      fontFamily: overrides.fontFamily ?? brand.fontFamily,
      logoUrl: overrides.logoUrl ?? brand.logoUrl,
      musicUrl: overrides.musicUrl ?? brand.musicUrl,
      scenes,
    };
    return sceneProps as unknown as Record<string, unknown>;
  }

  return buildTemplateProps(brand, {
    title: template.name,
    subtitle: template.description.slice(0, 80),
    ...overrides,
  }) as unknown as Record<string, unknown>;
}

/** Create a simple video project from a template catalog item. */
export function createProjectFromTemplate(
  template: TemplateCatalogItem,
  brand: BrandSettings,
  propsOverrides: Partial<VideoTemplateProps> = {},
  meta?: { name?: string; sourceType?: SimpleVideoProject["sourceType"] }
): SimpleVideoProject {
  const dims = getCompositionDimensions(template.compositionId);
  const now = new Date().toISOString();

  if (template.longForm && template.defaultScenes) {
    const scenes = scenesWithIds(template.defaultScenes);
    const sceneProps: SceneVideoProps = {
      title: propsOverrides.title ?? template.name,
      subtitle:
        propsOverrides.subtitle ?? "Edit scenes in the next step",
      accent: propsOverrides.accent ?? brand.colors.accent,
      brandColor: propsOverrides.brandColor ?? brand.colors.primary,
      fontFamily: propsOverrides.fontFamily ?? brand.fontFamily,
      logoUrl: propsOverrides.logoUrl ?? brand.logoUrl,
      musicUrl: propsOverrides.musicUrl ?? brand.musicUrl,
      scenes,
    };
    const durationInFrames = totalSceneDuration(scenes);

    return {
      id: genId("svp"),
      name: meta?.name ?? template.name,
      sourceType: meta?.sourceType ?? "template",
      compositionId: "LongFormVideo",
      templateId: template.id,
      props: sceneProps,
      aspectRatio: template.aspectRatio,
      durationInFrames,
      fps: template.fps,
      width: template.width,
      height: template.height,
      createdAt: now,
      updatedAt: now,
      status: "draft",
    };
  }

  const props = buildTemplateProps(brand, propsOverrides);

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
