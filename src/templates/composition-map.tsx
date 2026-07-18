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
import { LongFormVideo } from "@/remotion/compositions/LongFormVideo";
import { withBackgroundMusic } from "@/remotion/with-background-music";
import { REMOTION_OFFICIAL_COMPONENTS } from "@/remotion/compositions/remotion-official-demos";

type Props = Record<string, unknown>;

const RAW_MAP: Record<string, React.ComponentType<Props>> = {
  YoutubeShort: YoutubeShort as React.ComponentType<Props>,
  InstagramReel: InstagramReel as React.ComponentType<Props>,
  TikTokTrend: TikTokTrend as React.ComponentType<Props>,
  PodcastOpener: PodcastOpener as React.ComponentType<Props>,
  ProductAd: ProductAd as React.ComponentType<Props>,
  StartupPromo: StartupPromo as React.ComponentType<Props>,
  NewsVideo: NewsVideo as React.ComponentType<Props>,
  Motivational: Motivational as React.ComponentType<Props>,
  Explainer: Explainer as React.ComponentType<Props>,
  SaasDemo: SaasDemo as React.ComponentType<Props>,
  DataSlideshow: DataSlideshow as React.ComponentType<Props>,
  LongFormVideo: LongFormVideo as React.ComponentType<Props>,
  ...Object.fromEntries(
    Object.entries(REMOTION_OFFICIAL_COMPONENTS).map(([id, Component]) => [
      id,
      Component as React.ComponentType<Props>,
    ])
  ),
};

/**
 * Maps composition IDs to React components for @remotion/player.
 * Keep in sync with Root.tsx registrations.
 */
export const COMPOSITION_MAP: Record<string, React.ComponentType<Props>> =
  Object.fromEntries(
    Object.entries(RAW_MAP).map(([id, Comp]) => [
      id,
      id === "LongFormVideo" ? Comp : withBackgroundMusic(Comp),
    ])
  );

export function getCompositionComponent(compositionId: string) {
  return (
    COMPOSITION_MAP[compositionId] ??
    (REMOTION_OFFICIAL_COMPONENTS.HelloWorld as React.ComponentType<
      Record<string, unknown>
    >)
  );
}
