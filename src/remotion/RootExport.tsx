import React from "react";
import { Composition, Folder } from "remotion";
import { MainComposition, type MainCompositionProps } from "./compositions/MainComposition";
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
} from "./compositions/templates";
import { templateSchema } from "./compositions/templates-schema";
import type { TemplateProps } from "./compositions/templates-schema";
import { DataSlideshow } from "./compositions/DataSlideshow";
import { dataVideoSchema } from "./compositions/data-slideshow-schema";
import { LongFormVideo } from "./compositions/LongFormVideo";
import { AutomatedVideo } from "./compositions/AutomatedVideo";
import {
  DEFAULT_AUTOMATED_VIDEO_PROPS,
  automatedVideoDuration,
} from "./compositions/automated-video-schema";
import { CharacterMapVideo } from "./compositions/CharacterMapVideo";
import {
  DEFAULT_CHARACTER_MAP_PROPS,
  characterMapDuration,
} from "./compositions/character-map-schema";
import { aspectRatioToDimensions } from "@/types/edit-recipe";
import {
  DEFAULT_SCENE_VIDEO_PROPS,
  sceneListDuration,
} from "./compositions/scene-video-schema";
import { MOCK_PROJECTS } from "@/data/mock";
import { withBackgroundMusic } from "./with-background-music";

const defaultProject = MOCK_PROJECTS[0];
const templateDefaults: TemplateProps = {
  title: "REMOTION",
  subtitle: "Make videos programmatically",
  accent: "#0b84f3",
  brandColor: "#0b84f3",
};

const YoutubeShortMusic = withBackgroundMusic(YoutubeShort);
const InstagramReelMusic = withBackgroundMusic(InstagramReel);
const TikTokTrendMusic = withBackgroundMusic(TikTokTrend);
const PodcastOpenerMusic = withBackgroundMusic(PodcastOpener);
const ProductAdMusic = withBackgroundMusic(ProductAd);
const StartupPromoMusic = withBackgroundMusic(StartupPromo);
const NewsVideoMusic = withBackgroundMusic(NewsVideo);
const MotivationalMusic = withBackgroundMusic(Motivational);
const ExplainerMusic = withBackgroundMusic(Explainer);
const SaasDemoMusic = withBackgroundMusic(SaasDemo);
const DataSlideshowMusic = withBackgroundMusic(DataSlideshow);

/**
 * Lean Remotion root for server-side export (Vercel / API render).
 * Excludes Three.js labs and official demo compositions that break
 * headless Linux bundles with minified "t is not a function" errors.
 */
export const RemotionExportRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={MainComposition}
        durationInFrames={defaultProject.settings.durationInFrames}
        fps={defaultProject.settings.fps}
        width={defaultProject.settings.width}
        height={defaultProject.settings.height}
        defaultProps={{ project: defaultProject } satisfies MainCompositionProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.project.settings.durationInFrames,
          fps: props.project.settings.fps,
          width: props.project.settings.width,
          height: props.project.settings.height,
        })}
      />

      <Folder name="Templates">
        <Composition
          id="YoutubeShort"
          component={YoutubeShortMusic}
          schema={templateSchema}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={templateDefaults}
        />
        <Composition
          id="InstagramReel"
          component={InstagramReelMusic}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={templateDefaults}
        />
        <Composition
          id="TikTokTrend"
          component={TikTokTrendMusic}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={templateDefaults}
        />
        <Composition
          id="PodcastOpener"
          component={PodcastOpenerMusic}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="ProductAd"
          component={ProductAdMusic}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="StartupPromo"
          component={StartupPromoMusic}
          durationInFrames={270}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="NewsVideo"
          component={NewsVideoMusic}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="Motivational"
          component={MotivationalMusic}
          durationInFrames={200}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            ...templateDefaults,
            title: "Dream Big Start Now",
            subtitle: "Your moment is now",
          }}
        />
        <Composition
          id="Explainer"
          component={ExplainerMusic}
          durationInFrames={360}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ ...templateDefaults, title: "Growth Metrics" }}
        />
        <Composition
          id="SaasDemo"
          component={SaasDemoMusic}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="DataSlideshow"
          component={DataSlideshowMusic}
          schema={dataVideoSchema}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "Data Report",
            subtitle: "Your spreadsheet, animated",
            accent: "#0b84f3",
            brandColor: "#6366f1",
            rows: [{ Product: "Widget Pro", Revenue: "$12,400" }],
            columns: ["Product", "Revenue"],
          }}
        />
        <Composition
          id="LongFormVideo"
          component={LongFormVideo}
          durationInFrames={sceneListDuration(DEFAULT_SCENE_VIDEO_PROPS.scenes)}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={DEFAULT_SCENE_VIDEO_PROPS}
          calculateMetadata={({ props }) => ({
            durationInFrames: sceneListDuration(
              Array.isArray(props.scenes) ? props.scenes : []
            ),
          })}
        />
        <Composition
          id="AutomatedVideo"
          component={AutomatedVideo}
          durationInFrames={automatedVideoDuration(
            DEFAULT_AUTOMATED_VIDEO_PROPS.scenes
          )}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={DEFAULT_AUTOMATED_VIDEO_PROPS}
          calculateMetadata={({ props }) => {
            const ar = props.aspectRatio;
            const aspectRatio =
              ar === "9:16" || ar === "1:1" ? ar : "16:9";
            const dims = aspectRatioToDimensions(aspectRatio);
            return {
              durationInFrames: automatedVideoDuration(
                Array.isArray(props.scenes) ? props.scenes : []
              ),
              width: dims.width,
              height: dims.height,
            };
          }}
        />
        <Composition
          id="CharacterMapVideo"
          component={CharacterMapVideo}
          durationInFrames={characterMapDuration(DEFAULT_CHARACTER_MAP_PROPS)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={DEFAULT_CHARACTER_MAP_PROPS}
          calculateMetadata={({ props }) => {
            const ar = props.aspectRatio;
            const aspectRatio =
              ar === "16:9" || ar === "1:1" ? ar : "9:16";
            const dims = aspectRatioToDimensions(aspectRatio);
            return {
              durationInFrames: characterMapDuration(props),
              width: dims.width,
              height: dims.height,
            };
          }}
        />
      </Folder>
    </>
  );
};
