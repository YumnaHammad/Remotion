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
import { ThreeShowcase } from "./compositions/ThreeShowcase";
import { CaptionDemo } from "./compositions/Captions";
import {
  NestedSequences,
  TransitionsShowcase,
} from "./compositions/TransitionsShowcase";
import {
  MediaPrimitivesLab,
  PrimitivesLab,
} from "./labs/PrimitivesLab";
import { AnimationLab } from "./labs/AnimationLab";
import { DataSlideshow } from "./compositions/DataSlideshow";
import { dataVideoSchema } from "./compositions/data-slideshow-schema";
import { REMOTION_OFFICIAL_COMPONENTS } from "./compositions/remotion-official-demos";
import { REMOTION_OFFICIAL_DIMS } from "@/templates/remotion-official-catalog";
import { MOCK_PROJECTS, SAMPLE_IMAGE } from "@/data/mock";

const defaultProject = MOCK_PROJECTS[0];
const templateDefaults: TemplateProps = {
  title: "REMOTION",
  subtitle: "Make videos programmatically",
  accent: "#0b84f3",
  brandColor: "#0b84f3",
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
        <Composition
          id="DataSlideshow"
          component={DataSlideshow}
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
      </Folder>

      <Folder name="Remotion Official">
        {(
          Object.entries(REMOTION_OFFICIAL_COMPONENTS) as [
            keyof typeof REMOTION_OFFICIAL_COMPONENTS,
            (typeof REMOTION_OFFICIAL_COMPONENTS)[keyof typeof REMOTION_OFFICIAL_COMPONENTS],
          ][]
        ).map(([id, Component]) => {
          const dims = REMOTION_OFFICIAL_DIMS[id];
          return (
            <Composition
              key={id}
              id={id}
              component={Component}
              schema={templateSchema}
              durationInFrames={dims.durationInFrames}
              fps={dims.fps}
              width={dims.width}
              height={dims.height}
              defaultProps={templateDefaults}
            />
          );
        })}
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

      <Folder name="Labs">
        <Composition
          id="PrimitivesLab"
          component={PrimitivesLab}
          durationInFrames={120}
          fps={30}
          width={1280}
          height={720}
          defaultProps={{ mode: "sequence" as const, accent: "#0b84f3" }}
        />
        <Composition
          id="MediaPrimitivesLab"
          component={MediaPrimitivesLab}
          durationInFrames={90}
          fps={30}
          width={1280}
          height={720}
          defaultProps={{ imageSrc: SAMPLE_IMAGE }}
        />
        <Composition
          id="AnimationLab"
          component={AnimationLab}
          durationInFrames={120}
          fps={30}
          width={1280}
          height={720}
          defaultProps={{
            mode: "spring" as const,
            intensity: 1,
            accent: "#0b84f3",
            text: "Make videos programmatically with Remotion",
          }}
        />
      </Folder>
    </>
  );
};
