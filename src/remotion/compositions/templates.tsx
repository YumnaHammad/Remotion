import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ParticleField } from "../components/ParticleField";
import { BrandLogo } from "../components/BrandLogo";
import type { TemplateProps } from "./templates-schema";
import { mergeTemplateProps } from "./template-utils";

type TemplateComponentProps = Partial<TemplateProps> & {
  fontFamily?: string;
  logoUrl?: string;
};

export const YoutubeShort: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, accent, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });
  const slide = interpolate(frame, [10, 30], [40, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg,#0a0612,#1a1030)",
        fontFamily,
      }}
    >
      <BrandLogo logoUrl={logoUrl} />
      <ParticleField density={24} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
          <div style={{ fontSize: 28, color: accent, letterSpacing: 8, fontWeight: 600 }}>
            SHORTS
          </div>
          <div style={{ fontSize: 84, fontWeight: 900, color: "#fff", marginTop: 12 }}>
            {title}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#94a3b8",
              marginTop: 16,
              transform: `translateY(${slide}px)`,
              opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            {subtitle}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const InstagramReel: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, brandColor, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const glow = interpolate(frame % 45, [0, 22, 45], [0.4, 1, 0.4]);

  return (
    <AbsoluteFill style={{ background: "#12040e", fontFamily }}>
      <BrandLogo logoUrl={logoUrl} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${brandColor}55, transparent 55%)`,
          opacity: glow,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 48 }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#f472b6",
            textShadow: `0 0 30px #f472b6`,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#fff", marginTop: 24, opacity: 0.8 }}>
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ProductAd: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, brandColor, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#05070c", fontFamily }}>
      <BrandLogo logoUrl={logoUrl} />
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: 40,
              background: `linear-gradient(135deg, ${brandColor}, #22d3ee)`,
              transform: `rotate(${interpolate(frame, [0, 60], [12, 0])}deg) scale(${spring({ frame, fps })})`,
              boxShadow: `0 40px 80px ${brandColor}66`,
            }}
          />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={40}>
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 120,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 800, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 8 }}>{subtitle}</div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const PodcastOpener: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, accent, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const bars = Array.from({ length: 24 }, (_, i) => {
    const h =
      20 +
      Math.abs(Math.sin((frame + i * 4) / 8)) * 80 +
      Math.abs(Math.cos((frame + i * 2) / 6)) * 40;
    return (
      <div
        key={i}
        style={{
          width: 10,
          height: h,
          borderRadius: 4,
          background: i % 2 === 0 ? accent : "#22d3ee",
          opacity: 0.85,
        }}
      />
    );
  });

  return (
    <AbsoluteFill style={{ background: "#0c0a09", justifyContent: "center", alignItems: "center", gap: 40, fontFamily }}>
      <BrandLogo logoUrl={logoUrl} />
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
        {bars}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#fff" }}>{title}</div>
        <div style={{ fontSize: 24, color: "#a8a29e", marginTop: 8 }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

export const SaasDemo: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, brandColor, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 40], [60, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#0b1020", fontFamily }}>
      <BrandLogo logoUrl={logoUrl} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 900,
            height: 520,
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "linear-gradient(180deg,#151b2e,#0d1220)",
            boxShadow: `0 30px 100px ${brandColor}33`,
            transform: `translateY(${y}px)`,
            opacity,
            padding: 32,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["#ef4444", "#eab308", "#22c55e"].map((c) => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 22, color: "#94a3b8", marginTop: 12 }}>{subtitle}</div>
          <div
            style={{
              marginTop: 40,
              height: 12,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${interpolate(frame, [20, 90], [0, 100], { extrapolateRight: "clamp" })}%`,
                height: "100%",
                background: brandColor,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Motivational: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const words = title.split(" ");

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg,#0f172a,#1e1b4b)",
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
        fontFamily,
      }}
    >
      <BrandLogo logoUrl={logoUrl} />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
        {words.map((w, i) => {
          const delay = i * 8;
          const o = interpolate(frame - delay, [0, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={`${w}-${i}`}
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#fff",
                opacity: o,
                transform: `translateY(${(1 - o) * 30}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 32,
          fontSize: 28,
          color: "#a5b4fc",
          opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

export const Explainer: React.FC<TemplateComponentProps> = (props) => {
  const { title, brandColor, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const values = [65, 82, 47, 91, 73];

  return (
    <AbsoluteFill style={{ background: "#0a0f1a", padding: 80, fontFamily }}>
      <BrandLogo logoUrl={logoUrl} />
      <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", marginBottom: 48 }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 28, height: 320 }}>
        {values.map((v, i) => {
          const h = interpolate(frame - i * 6, [0, 30], [0, v * 3], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 56,
                  height: h,
                  borderRadius: "12px 12px 4px 4px",
                  background: `linear-gradient(180deg, ${brandColor}, #22d3ee)`,
                }}
              />
              <span style={{ color: "#64748b", fontSize: 16 }}>Q{i + 1}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const NewsVideo: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, accent, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const tickerX = interpolate(frame, [0, 200], [100, -100]);

  return (
    <AbsoluteFill style={{ background: "#0c1222", fontFamily }}>
      <BrandLogo logoUrl={logoUrl} />
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: 48 }}>
        <div
          style={{
            background: accent,
            color: "#fff",
            display: "inline-block",
            padding: "8px 16px",
            fontSize: 18,
            fontWeight: 700,
            borderRadius: 4,
            marginBottom: 12,
          }}
        >
          BREAKING
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", maxWidth: "80%" }}>
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 8 }}>{subtitle}</div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 44,
          background: "#dc2626",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            transform: `translateX(${tickerX}%)`,
          }}
        >
          {subtitle} · Live updates · {title} · Stay informed
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const StartupPromo: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, brandColor, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 30% 20%, ${brandColor}33, #05060a 50%)`,
        justifyContent: "center",
        padding: 100,
        fontFamily,
      }}
    >
      <BrandLogo logoUrl={logoUrl} />
      <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 40}px)` }}>
        <div style={{ fontSize: 18, letterSpacing: 6, color: brandColor, fontWeight: 600 }}>
          INTRODUCING
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, color: "#fff", marginTop: 16, lineHeight: 1.05 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 20, maxWidth: 560 }}>
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 40,
            display: "inline-block",
            background: brandColor,
            color: "#fff",
            padding: "14px 28px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          Get started free
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const TikTokTrend: React.FC<TemplateComponentProps> = (props) => {
  const { title, subtitle, fontFamily, logoUrl } = mergeTemplateProps(props);
  const frame = useCurrentFrame();
  const beat = Math.sin(frame / 4) * 0.05 + 1;

  return (
    <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center", fontFamily }}>
      <BrandLogo logoUrl={logoUrl} />
      <div
        style={{
          transform: `scale(${beat}) rotate(${Math.sin(frame / 10) * 2}deg)`,
          textAlign: "center",
          padding: 32,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            background: "linear-gradient(90deg,#22d3ee,#f472b6,#fbbf24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#fff", marginTop: 20 }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};
