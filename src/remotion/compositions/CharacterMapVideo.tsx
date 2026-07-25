"use client";

import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CaptionRenderer } from "./Captions";
import { CityMapLayer } from "../components/CityMapLayer";
import { RiveCharacterLayer } from "../components/RiveCharacterLayer";
import { defaultCityCameraPath } from "@/lib/camera-path";
import type { CharacterMapVideoProps } from "@/types/feature-stack";
import { rewriteBrokenMediaUrl } from "@/lib/sample-media";

function DuckingMusic({ url }: { url?: string }) {
  const frame = useCurrentFrame();
  const src = rewriteBrokenMediaUrl(url) ?? url;
  if (!src) return null;
  const vol = 0.1 + Math.sin(frame / 24) * 0.02;
  return <Audio src={src} volume={vol} loop />;
}

/**
 * Full feature-stack composition:
 * MapLibre/three city → character (Rive/cartoon + lip-sync/puppet) → captions + VO
 */
export const CharacterMapVideo: React.FC<Partial<CharacterMapVideoProps>> = (
  raw
) => {
  const props: CharacterMapVideoProps = {
    title: raw.title ?? "Character Map Video",
    accent: raw.accent ?? "#0b84f3",
    brandColor: raw.brandColor ?? "#1e3a5f",
    aspectRatio: raw.aspectRatio ?? "9:16",
    fontFamily: raw.fontFamily ?? "Inter, system-ui, sans-serif",
    voiceoverUrl: rewriteBrokenMediaUrl(raw.voiceoverUrl) ?? raw.voiceoverUrl,
    backgroundMusicUrl:
      rewriteBrokenMediaUrl(raw.backgroundMusicUrl) ?? raw.backgroundMusicUrl,
    captions: raw.captions,
    visemes: raw.visemes ?? [],
    landmarks: raw.landmarks ?? [],
    route: raw.route ?? "script",
    riveSrc: raw.riveSrc,
    showMap: raw.showMap ?? true,
    showCharacter: raw.showCharacter ?? true,
    mapSeed: raw.mapSeed ?? 42,
    cameraPath: raw.cameraPath,
    characterLook: raw.characterLook,
    mapLook: raw.mapLook,
  };

  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const titleOpacity = interpolate(frame, [0, 20, 50, 70], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const charAccent = props.characterLook?.accent ?? props.accent;
  const charShirt = props.characterLook?.shirt ?? props.brandColor;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0e14" }}>
      <DuckingMusic url={props.backgroundMusicUrl} />
      {props.voiceoverUrl && <Audio src={props.voiceoverUrl} volume={1} />}

      {props.showMap && (
        <CityMapLayer
          seed={props.mapLook?.seed ?? props.mapSeed}
          look={props.mapLook}
          cameraPath={
            props.cameraPath ?? defaultCityCameraPath(durationInFrames)
          }
        />
      )}

      {/* Soft vignette so character reads clearly */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)",
          pointerEvents: "none",
        }}
      />

      {props.showCharacter && (
        <RiveCharacterLayer
          riveSrc={props.riveSrc}
          visemes={props.visemes}
          landmarks={props.landmarks}
          accent={charAccent}
          brandColor={charShirt}
          skin={props.characterLook?.skin}
          hair={props.characterLook?.hair}
          scale={props.characterLook?.scale}
        />
      )}

      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 48,
          opacity: titleOpacity,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: props.fontFamily,
            fontSize: 42,
            fontWeight: 800,
            color: "#fff",
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
            letterSpacing: "-0.02em",
          }}
        >
          {props.title}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            fontWeight: 600,
            color: props.accent,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {props.route === "reference" ? "Reference · Puppet" : "Script · Lip-sync"}
        </div>
      </AbsoluteFill>

      <CaptionRenderer
        captions={props.captions as never}
        theme="karaoke"
        useSampleFallback={false}
      />
    </AbsoluteFill>
  );
};
