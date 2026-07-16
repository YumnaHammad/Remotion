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
  templateSchema,
  type TemplateProps,
} from "./compositions/templates";
import { ThreeShowcase } from "./compositions/ThreeShowcase";
import { CaptionDemo } from "./compositions/Captions";
import {
  NestedSequences,
  TransitionsShowcase,
} from "./compositions/TransitionsShowcase";
import { MOCK_PROJECTS } from "@/data/mock";

const defaultProject = MOCK_PROJECTS[0];
const templateDefaults: TemplateProps = {
  title: "LUMEN",
  subtitle: "AI Video Studio",
  accent: "#818cf8",
  brandColor: "#6366f1",
};

export const RemotionRoot: React.FC = () => {
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
          component={YoutubeShort}
          schema={templateSchema}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={templateDefaults}
        />
        <Composition
          id="InstagramReel"
          component={InstagramReel}
          durationInFrames={180}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={templateDefaults}
        />
        <Composition
          id="TikTokTrend"
          component={TikTokTrend}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={templateDefaults}
        />
        <Composition
          id="PodcastOpener"
          component={PodcastOpener}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="ProductAd"
          component={ProductAd}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="StartupPromo"
          component={StartupPromo}
          durationInFrames={270}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="NewsVideo"
          component={NewsVideo}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
        <Composition
          id="Motivational"
          component={Motivational}
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
          component={Explainer}
          durationInFrames={360}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ ...templateDefaults, title: "Growth Metrics" }}
        />
        <Composition
          id="SaasDemo"
          component={SaasDemo}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={templateDefaults}
        />
      </Folder>

      <Folder name="Effects">
        <Composition
          id="ThreeShowcase"
          component={ThreeShowcase}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ title: "3D Product Orbit" }}
        />
        <Composition
          id="CaptionDemo"
          component={CaptionDemo}
          durationInFrames={150}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="TransitionsShowcase"
          component={TransitionsShowcase}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="NestedSequences"
          component={NestedSequences}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
