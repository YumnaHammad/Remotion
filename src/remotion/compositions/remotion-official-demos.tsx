import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "./templates-schema";
import { ThreeShowcase } from "./ThreeShowcase";
import { CaptionRenderer } from "./Captions";
import { BrandLogo } from "../components/BrandLogo";

const DEFAULT_FONT = "Inter, system-ui, sans-serif";

const defaultProps: TemplateProps = {
  title: "Remotion",
  subtitle: "Make videos programmatically",
  accent: "#0b84f3",
  brandColor: "#6366f1",
};

type ExtendedProps = Partial<TemplateProps> & {
  fontFamily?: string;
  logoUrl?: string;
};

function mergeProps(props: ExtendedProps) {
  const merged = { ...defaultProps, ...props };
  return {
    ...merged,
    fontFamily: props.fontFamily
      ? `${props.fontFamily}, system-ui, sans-serif`
      : DEFAULT_FONT,
    logoUrl: props.logoUrl,
  };
}

/** Shared layout for app-starter template demos (Next.js, Electron, etc.). */
const StarterKitDemo: React.FC<
  Partial<TemplateProps> & {
    badge: string;
    icon: string;
    features: string[];
  }
> = ({ badge, icon, features, ...props }) => {
  const { title, subtitle, accent, brandColor } = mergeProps(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18 } });
  const panelY = interpolate(frame, [0, 30], [40, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, #0a0a12 0%, ${brandColor}22 100%)`,
        fontFamily: DEFAULT_FONT,
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,17,28,0.92)",
          boxShadow: `0 40px 120px ${accent}33`,
          transform: `scale(${enter}) translateY(${panelY}px)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ fontSize: 28 }}>{icon}</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              color: accent,
              textTransform: "uppercase",
            }}
          >
            {badge}
          </span>
        </div>
        <div style={{ padding: "40px 48px" }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 22, color: "#94a3b8", marginTop: 12 }}>{subtitle}</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginTop: 36,
            }}
          >
            {features.map((f, i) => (
              <div
                key={f}
                style={{
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 14,
                  color: "#cbd5e1",
                  opacity: interpolate(frame, [20 + i * 8, 35 + i * 8], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionBlank: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, accent } = mergeProps(props);
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#ffffff", fontFamily: DEFAULT_FONT }}>
      {title && (
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center", opacity }}
        >
          <div style={{ fontSize: 32, color: accent, fontWeight: 500 }}>{title}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const HelloWorld: React.FC<ExtendedProps> = (props) => {
  const { title, subtitle, accent, fontFamily, logoUrl } = mergeProps(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });
  const spin = interpolate(frame, [0, 90], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: "#282c34",
        fontFamily,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BrandLogo logoUrl={logoUrl} />
      <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
        <div
          style={{
            width: 120,
            height: 120,
            margin: "0 auto 32px",
            transform: `rotate(${spin * 0.15}deg)`,
          }}
        >
          <svg viewBox="0 0 100 100" width="120" height="120">
            <circle cx="50" cy="50" r="8" fill={accent} />
            <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke={accent} strokeWidth="3" transform="rotate(0 50 50)" />
            <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#61dafb" strokeWidth="3" transform="rotate(60 50 50)" />
            <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#61dafb" strokeWidth="3" transform="rotate(120 50 50)" />
          </svg>
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#fff" }}>
          {title || "Welcome to Remotion"}
        </div>
        <div style={{ fontSize: 20, color: "#61dafb", marginTop: 16 }}>
          {subtitle || "Edit src/Video.tsx and save to reload."}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const NextJsSaaS: React.FC<Partial<TemplateProps>> = (props) => (
  <StarterKitDemo
    {...props}
    badge="Next.js SaaS"
    icon="▲"
    features={["Video API routes", "Remotion Player", "Stripe billing"]}
  />
);

export const NextJsVercelSandbox: React.FC<Partial<TemplateProps>> = (props) => (
  <StarterKitDemo
    {...props}
    badge="Vercel Sandbox"
    icon="▲"
    features={["On-demand renders", "Serverless workers", "Edge-ready"]}
  />
);

export const NextJsNoTailwind: React.FC<Partial<TemplateProps>> = (props) => (
  <StarterKitDemo
    {...props}
    badge="Next.js · No Tailwind"
    icon="▲"
    features={["Plain CSS modules", "Remotion bundle", "Export pipeline"]}
  />
);

export const NextJsPages: React.FC<Partial<TemplateProps>> = (props) => (
  <StarterKitDemo
    {...props}
    badge="Next.js Pages Router"
    icon="▲"
    features={["pages/api/render", "Classic routing", "Full-stack SaaS"]}
  />
);

export const Recorder: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle, accent, brandColor } = mergeProps(props);
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % 30, [0, 15, 30], [1, 1.15, 1]);
  const rec = frame % 60 < 30;

  return (
    <AbsoluteFill style={{ background: "#111", fontFamily: DEFAULT_FONT }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 720,
            height: 405,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${brandColor}, #0f172a)`,
            border: "2px solid rgba(255,255,255,0.1)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: rec ? "#ef4444" : "#64748b",
                transform: `scale(${pulse})`,
              }}
            />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              {rec ? "REC" : "STBY"}
            </span>
          </div>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            right: 24,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 16, color: accent, marginTop: 6 }}>{subtitle}</div>
        </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PromptMotionGraphics: React.FC<Partial<TemplateProps>> = (props) => (
  <StarterKitDemo
    {...props}
    badge="Prompt → Motion"
    icon="✦"
    features={["AI prompt input", "Motion presets", "SaaS starter kit"]}
  />
);

export const JavaScriptStarter: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle } = mergeProps(props);
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 25], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "#f7df1e",
        fontFamily: "monospace",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ transform: `translateY(${y}px)`, textAlign: "center" }}>
        <div style={{ fontSize: 64, fontWeight: 900, color: "#323330" }}>JS</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#323330", marginTop: 16 }}>
          {title}
        </div>
        <div style={{ fontSize: 18, color: "#555", marginTop: 8 }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

export const RenderServer: React.FC<Partial<TemplateProps>> = (props) => (
  <StarterKitDemo
    {...props}
    badge="Express Render Server"
    icon="⚡"
    features={["POST /render", "BullMQ queue", "FFmpeg output"]}
  />
);

export const ElectronApp: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle } = mergeProps(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg,#1e293b,#0f172a)",
        fontFamily: DEFAULT_FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 800,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            height: 36,
            background: "#334155",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 14px",
          }}
        >
          {["#ef4444", "#eab308", "#22c55e"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ marginLeft: 8, fontSize: 12, color: "#94a3b8" }}>Remotion Desktop</span>
        </div>
        <div style={{ padding: 48, background: "#0f172a", textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 18, color: "#64748b", marginTop: 10 }}>{subtitle}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReactRouter7: React.FC<Partial<TemplateProps>> = (props) => (
  <StarterKitDemo
    {...props}
    badge="React Router 7"
    icon="⎇"
    features={["File-based routes", "Video SaaS layout", "Render actions"]}
  />
);

export const RemotionThreeD: React.FC<Partial<TemplateProps>> = (props) => {
  const { title } = mergeProps(props);
  return <ThreeShowcase title={title} />;
};

export const Stills: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle, accent, brandColor } = mergeProps(props);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${brandColor}, ${accent})`,
        fontFamily: DEFAULT_FONT,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: "#fff" }}>{title}</div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.85)", marginTop: 20 }}>
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 14,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.6)",
            textTransform: "uppercase",
          }}
        >
          PNG / JPEG still
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Audiogram: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle, accent, brandColor } = mergeProps(props);
  const frame = useCurrentFrame();
  const bars = Array.from({ length: 32 }, (_, i) => {
    const h = 24 + Math.abs(Math.sin((frame + i * 3) / 7)) * 100;
    return (
      <div
        key={i}
        style={{
          width: 8,
          height: h,
          borderRadius: 4,
          background: i % 2 === 0 ? accent : brandColor,
        }}
      />
    );
  });

  return (
    <AbsoluteFill style={{ background: "#0c0a09", fontFamily: DEFAULT_FONT }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 48 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140 }}>{bars}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 20, color: "#a8a29e", marginTop: 10 }}>{subtitle}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const MusicVisualization: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, accent, brandColor } = mergeProps(props);
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#050508", overflow: "hidden" }}>
      {Array.from({ length: 48 }, (_, i) => {
        const h = 40 + Math.abs(Math.sin((frame + i * 2) / 5)) * 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 0,
              left: `${(i / 48) * 100}%`,
              width: "2.2%",
              height: h,
              background: `linear-gradient(180deg, ${accent}, ${brandColor})`,
              opacity: 0.85,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: DEFAULT_FONT,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 900, color: "#fff", textShadow: "0 4px 30px #000" }}>
          {title}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PromptToVideo: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle, accent } = mergeProps(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = Math.floor(frame / 45) % 3;
  const scenes = [title, subtitle, "Voiceover + images from your prompt"];
  const scale = spring({ frame: frame % 45, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${accent}44, #0a0a12)`,
        fontFamily: DEFAULT_FONT,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: "#fff",
          textAlign: "center",
          transform: `scale(${scale})`,
          maxWidth: 800,
        }}
      >
        {scenes[slide]}
      </div>
    </AbsoluteFill>
  );
};

export const SkiaDemo: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, accent, brandColor } = mergeProps(props);
  const frame = useCurrentFrame();
  const rot = frame / 3;

  return (
    <AbsoluteFill style={{ background: "#fafafa", fontFamily: DEFAULT_FONT }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        <circle cx="960" cy="540" r="180" fill={brandColor} opacity={0.2} />
        <rect
          x="760"
          y="340"
          width="400"
          height="400"
          rx="40"
          fill={accent}
          transform={`rotate(${rot} 960 540)`}
        />
        <text x="960" y="920" textAnchor="middle" fill="#334155" fontSize="48" fontWeight="700">
          {title}
        </text>
      </svg>
    </AbsoluteFill>
  );
};

export const Overlay: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle, accent } = mergeProps(props);
  const frame = useCurrentFrame();
  const y = interpolate(frame, [0, 20], [80, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: 48,
          fontFamily: DEFAULT_FONT,
        }}
      >
        <div
          style={{
            transform: `translateY(${y}px)`,
            background: "rgba(0,0,0,0.75)",
            padding: "20px 28px",
            borderLeft: `4px solid ${accent}`,
            borderRadius: 8,
            maxWidth: 600,
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 18, color: "#cbd5e1", marginTop: 6 }}>{subtitle}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CodeHike: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, accent } = mergeProps(props);
  const frame = useCurrentFrame();
  const lines = [
    "import { Composition } from 'remotion';",
    "export const MyVideo = () => {",
    "  return <Title text={props.title} />;",
    "};",
  ];
  const visible = Math.min(lines.length, Math.floor(frame / 18) + 1);

  return (
    <AbsoluteFill
      style={{
        background: "#0d1117",
        fontFamily: "monospace",
        padding: 80,
      }}
    >
      <div style={{ fontSize: 28, color: accent, marginBottom: 32, fontWeight: 700 }}>
        {title}
      </div>
      {lines.slice(0, visible).map((line, i) => (
        <div key={line} style={{ fontSize: 22, color: i === visible - 1 ? "#79c0ff" : "#8b949e", marginBottom: 12 }}>
          {line}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const Stargazer: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle, accent } = mergeProps(props);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const burst = spring({ frame, fps, config: { damping: 12 } });
  const stars = interpolate(frame, [0, 60], [0, 1284], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 30%, #1e1b4b, #030712)",
        fontFamily: DEFAULT_FONT,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(i * 17) % 100}%`,
            top: `${(i * 23) % 100}%`,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#fbbf24",
            opacity: 0.3 + (i % 5) * 0.1,
          }}
        />
      ))}
      <div style={{ textAlign: "center", transform: `scale(${burst})` }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: accent }}>★ {stars}</div>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#fff", marginTop: 16 }}>{title}</div>
        <div style={{ fontSize: 20, color: "#94a3b8", marginTop: 10 }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

export const TikTokCaptions: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, brandColor } = mergeProps(props);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${brandColor}33, #0a0a12)`,
      }}
    >
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>
          {title}
        </div>
      </AbsoluteFill>
      <CaptionRenderer theme="neon" />
    </AbsoluteFill>
  );
};

export const EditorStarter: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle, accent } = mergeProps(props);
  const frame = useCurrentFrame();
  const playhead = interpolate(frame, [0, 120], [0, 100], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#18181b", fontFamily: DEFAULT_FONT }}>
      <div style={{ height: "70%", background: "#09090b", borderBottom: "1px solid #27272a" }} />
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, color: "#a1a1aa", marginBottom: 8 }}>{title}</div>
        <div
          style={{
            height: 48,
            background: "#27272a",
            borderRadius: 8,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `${playhead}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: accent,
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: "#71717a", marginTop: 8 }}>{subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

export const WatercolorMap: React.FC<Partial<TemplateProps>> = (props) => {
  const { title, subtitle, accent, brandColor } = mergeProps(props);
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 120], [0, 30], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#fef3c7", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080">
        <ellipse cx={960 + drift} cy="520" rx="520" ry="280" fill={brandColor} opacity="0.35" />
        <ellipse cx={800 - drift} cy="600" rx="400" ry="220" fill={accent} opacity="0.4" />
        <ellipse cx="1100" cy="480" rx="300" ry="180" fill="#f472b6" opacity="0.3" />
      </svg>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          padding: 64,
          fontFamily: DEFAULT_FONT,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 800, color: "#1c1917" }}>{title}</div>
        <div style={{ fontSize: 24, color: "#57534e", marginTop: 8 }}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** All official Remotion template demo components keyed by composition ID. */
export const REMOTION_OFFICIAL_COMPONENTS = {
  RemotionBlank,
  HelloWorld,
  NextJsSaaS,
  NextJsVercelSandbox,
  NextJsNoTailwind,
  NextJsPages,
  Recorder,
  PromptMotionGraphics,
  JavaScriptStarter,
  RenderServer,
  ElectronApp,
  ReactRouter7,
  RemotionThreeD,
  Stills,
  Audiogram,
  MusicVisualization,
  PromptToVideo,
  SkiaDemo,
  Overlay,
  CodeHike,
  Stargazer,
  TikTokCaptions,
  EditorStarter,
  WatercolorMap,
} as const;

export type RemotionOfficialCompositionId = keyof typeof REMOTION_OFFICIAL_COMPONENTS;
