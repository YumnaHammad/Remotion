"use client";

import type React from "react";
import {
  Explainer,
  InstagramReel,
  Motivational,
  NewsVideo,
  PodcastOpener,
  ProductAd,
  SaasDemo,
  StartupPromo,
  TikTokTrend,
  YoutubeShort,
} from "@/remotion/compositions/templates";
import { DataSlideshow } from "@/remotion/compositions/DataSlideshow";
import { REMOTION_OFFICIAL_COMPONENTS } from "@/remotion/compositions/remotion-official-demos";

/**
 * Maps composition IDs to React components for @remotion/player.
 * Keep in sync with Root.tsx registrations.
 */
export const COMPOSITION_MAP: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  YoutubeShort: YoutubeShort as React.ComponentType<Record<string, unknown>>,
  InstagramReel: InstagramReel as React.ComponentType<Record<string, unknown>>,
  TikTokTrend: TikTokTrend as React.ComponentType<Record<string, unknown>>,
  PodcastOpener: PodcastOpener as React.ComponentType<Record<string, unknown>>,
  ProductAd: ProductAd as React.ComponentType<Record<string, unknown>>,
  StartupPromo: StartupPromo as React.ComponentType<Record<string, unknown>>,
  NewsVideo: NewsVideo as React.ComponentType<Record<string, unknown>>,
  Motivational: Motivational as React.ComponentType<Record<string, unknown>>,
  Explainer: Explainer as React.ComponentType<Record<string, unknown>>,
  SaasDemo: SaasDemo as React.ComponentType<Record<string, unknown>>,
  DataSlideshow: DataSlideshow as React.ComponentType<Record<string, unknown>>,
  ...Object.fromEntries(
    Object.entries(REMOTION_OFFICIAL_COMPONENTS).map(([id, Component]) => [
      id,
      Component as React.ComponentType<Record<string, unknown>>,
    ])
  ),
};

export function getCompositionComponent(compositionId: string) {
  return (
    COMPOSITION_MAP[compositionId] ??
    (REMOTION_OFFICIAL_COMPONENTS.HelloWorld as React.ComponentType<
      Record<string, unknown>
    >)
  );
}
