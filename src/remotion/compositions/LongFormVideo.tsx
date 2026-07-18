import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BackgroundMusic } from "../components/BackgroundMusic";
import type { SceneAnimationPreset, SceneType, VideoScene } from "@/types/scene-video";
import type { SceneVideoSchemaProps } from "./scene-video-schema";

const DEFAULT_FONT = "Inter, system-ui, sans-serif";

const GRADIENTS: Record<string, string> = {
  "gradient-hero": "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0b84f3 100%)",
  "gradient-warm": "linear-gradient(160deg, #1a0a2e, #c2410c)",
  "gradient-cool": "linear-gradient(160deg, #0c4a6e, #6366f1)",
  "gradient-corporate": "linear-gradient(160deg, #111827, #374151)",
  "gradient-social": "linear-gradient(135deg, #ec4899, #8b5cf6)",
};

function sceneBackground(scene: VideoScene, brandColor: string, accent: string): string {
  if (scene.background && GRADIENTS[scene.background]) {
    return GRADIENTS[scene.background];
  }
  if (scene.background?.startsWith("#") || scene.background?.startsWith("linear")) {
    return scene.background;
  }
  const tints: Record<SceneType, string> = {
    intro: `linear-gradient(160deg, ${brandColor}44, #0a0a0f)`,
    content: `linear-gradient(160deg, #0a0a0f, ${brandColor}33)`,
    stats: `linear-gradient(160deg, ${accent}22, #0a0a0f)`,
    gallery: `linear-gradient(160deg, #0a0a0f, ${accent}18)`,
    quote: `linear-gradient(160deg, ${brandColor}55, #111)`,
    outro: `linear-gradient(160deg, #0a0a0f, ${accent}33)`,
  };
  return tints[scene.type];
}

function useSceneAnimation(
  animation: SceneAnimationPreset,
  durationInFrames: number
) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = Math.min(1, frame / Math.min(30, durationInFrames * 0.4));

  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const slideX = interpolate(frame, [0, 25], [80, 0], { extrapolateRight: "clamp" });
  const slideY = interpolate(frame, [0, 25], [40, 0], { extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, 25], [0.85, 1], { extrapolateRight: "clamp" });
  const scale = spring({ frame, fps, config: { damping: 14 } });
  const reveal = interpolate(frame, [0, 30], [0, 100], { extrapolateRight: "clamp" });

  switch (animation) {
    case "fade":
      return { opacity: fade, transform: "none" };
    case "slide":
      return { opacity: fade, transform: `translateX(${slideX}px)` };
    case "zoom":
      return { opacity: fade, transform: `scale(${zoom})` };
    case "scale":
      return { opacity: fade, transform: `scale(${scale})` };
    case "parallax":
      return {
        opacity: fade,
        transform: `translateY(${slideY * 0.5}px) scale(${0.95 + progress * 0.05})`,
      };
    case "reveal":
      return {
        opacity: fade,
        clipPath: `inset(0 ${100 - reveal}% 0 0)`,
        transform: "none",
      };
    case "card-stack":
      return { opacity: fade, transform: `translateY(${slideY}px) rotate(${interpolate(frame, [0, 20], [-2, 0])}deg)` };
    case "split-screen":
      return { opacity: fade, transform: `translateX(${interpolate(frame, [0, 20], [-40, 0])}px)` };
    case "timeline":
      return { opacity: fade, transform: `translateX(${interpolate(frame, [0, 30], [-60, 0])}px)` };
    case "count-up":
      return { opacity: fade, transform: `scale(${spring({ frame, fps, config: { damping: 12 } })})` };
    default:
      return { opacity: fade, transform: "none" };
  }
}

function AnimatedCounter({ value, accent }: { value: string; accent: string }) {
  const frame = useCurrentFrame();
  const numeric = parseFloat(value.replace(/[^0-9.-]/g, ""));
  const suffix = value.replace(/[0-9.-]/g, "");
  const display =
    Number.isFinite(numeric) && value.match(/[0-9]/)
      ? `${Math.round(interpolate(frame, [0, 40], [0, numeric], { extrapolateRight: "clamp" }))}${suffix.replace(/^[\d.-]+/, "") || suffix}`
      : value;

  return (
    <div style={{ fontSize: 120, fontWeight: 900, color: accent, lineHeight: 1 }}>
      {display}
    </div>
  );
}

function SceneContent({
  scene,
  accent,
  brandColor,
  font,
  logoUrl,
}: {
  scene: VideoScene;
  accent: string;
  brandColor: string;
  font: string;
  logoUrl?: string;
}) {
  const anim = useSceneAnimation(scene.animation, scene.durationInFrames);

  return (
    <AbsoluteFill
      style={{
        background: sceneBackground(scene, brandColor, accent),
        fontFamily: font,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      {logoUrl && scene.type === "intro" && (
        <Img
          src={logoUrl}
          style={{
            position: "absolute",
            top: 48,
            left: 48,
            height: 56,
            objectFit: "contain",
          }}
        />
      )}

      <div style={{ ...anim, textAlign: "center", maxWidth: "88%" }}>
        {scene.type === "stats" && scene.statValue && (
          <>
            <AnimatedCounter value={scene.statValue} accent={accent} />
            {scene.statLabel && (
              <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 16 }}>
                {scene.statLabel}
              </div>
            )}
            {scene.title && (
              <div style={{ fontSize: 28, color: "#fff", marginTop: 24, fontWeight: 600 }}>
                {scene.title}
              </div>
            )}
          </>
        )}

        {scene.type === "quote" && (
          <>
            <div style={{ fontSize: 48, color: accent, marginBottom: 24 }}>&ldquo;</div>
            <div style={{ fontSize: 42, fontWeight: 600, color: "#fff", lineHeight: 1.35 }}>
              {scene.quote ?? scene.title}
            </div>
            {scene.author && (
              <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 32 }}>— {scene.author}</div>
            )}
          </>
        )}

        {scene.type === "gallery" && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {(scene.images?.length ? scene.images : ["#334155", "#475569", "#64748b"]).slice(0, 4).map((img, i) => (
              <div
                key={i}
                style={{
                  width: 280,
                  height: 180,
                  borderRadius: 16,
                  background: img.startsWith("http") ? undefined : img,
                  backgroundImage: img.startsWith("http") ? `url(${img})` : undefined,
                  backgroundSize: "cover",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  transform: `translateY(${i * 8}px)`,
                }}
              />
            ))}
            {scene.title && (
              <div style={{ width: "100%", fontSize: 36, fontWeight: 700, color: "#fff", marginTop: 24 }}>
                {scene.title}
              </div>
            )}
          </div>
        )}

        {(scene.type === "intro" || scene.type === "content" || scene.type === "outro") && (
          <>
            <div
              style={{
                fontSize: scene.type === "intro" ? 72 : 52,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              {scene.title}
            </div>
            {scene.subtitle && (
              <div style={{ fontSize: 28, color: accent, marginTop: 20 }}>{scene.subtitle}</div>
            )}
            {scene.body && (
              <div
                style={{
                  fontSize: 26,
                  color: "#cbd5e1",
                  marginTop: 28,
                  lineHeight: 1.5,
                  whiteSpace: "pre-line",
                }}
              >
                {scene.body}
              </div>
            )}
          </>
        )}

        {scene.type === "content" && scene.animation === "timeline" && (
          <div
            style={{
              marginTop: 40,
              height: 4,
              width: "60%",
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              borderRadius: 2,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
}

/**
 * Multi-scene long-form composition (30s–5min).
 * Driven by scenes[] — intro, content, stats, gallery, quote, outro.
 */
export const LongFormVideo: React.FC<Partial<SceneVideoSchemaProps>> = (raw) => {
  const props: SceneVideoSchemaProps = {
    title: "Long Form Video",
    subtitle: "",
    accent: "#0b84f3",
    brandColor: "#1e3a5f",
    fontFamily: DEFAULT_FONT,
    scenes: [],
    ...raw,
  };

  const font = props.fontFamily ?? DEFAULT_FONT;
  let offset = 0;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BackgroundMusic musicUrl={props.musicUrl} />

      {props.scenes.map((scene) => {
        const from = offset;
        offset += scene.durationInFrames;
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.durationInFrames}
            name={scene.id}
          >
            <SceneContent
              scene={scene}
              accent={props.accent}
              brandColor={props.brandColor}
              font={font}
              logoUrl={props.logoUrl}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** Calculate total duration from scene list. */
export function longFormDuration(scenes: VideoScene[]): number {
  return scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
}
