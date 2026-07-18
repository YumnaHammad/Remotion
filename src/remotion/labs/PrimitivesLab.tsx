import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Img,
  Loop,
  Sequence,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type PrimitiveMode =
  | "sequence"
  | "series"
  | "loop"
  | "freeze"
  | "interpolate"
  | "spring";

export type PrimitivesLabProps = {
  mode: PrimitiveMode;
  accent: string;
};

function Card({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(145deg, ${color}, #0b0c0f)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          padding: "28px 48px",
          borderRadius: 20,
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "white",
          fontSize: 42,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        {label}
      </div>
      {children}
    </AbsoluteFill>
  );
}

function SequenceDemo({ accent }: { accent: string }) {
  return (
    <AbsoluteFill style={{ background: "#0b0c0f" }}>
      <Sequence from={0} durationInFrames={40} name="Intro">
        <Card label="<Sequence> 0–40" color={accent} />
      </Sequence>
      <Sequence from={40} durationInFrames={40} name="Middle">
        <Card label="<Sequence> 40–80" color="#22d3ee" />
      </Sequence>
      <Sequence from={80} durationInFrames={40} name="Outro">
        <Card label="<Sequence> 80–120" color="#a78bfa" />
      </Sequence>
    </AbsoluteFill>
  );
}

function SeriesDemo({ accent }: { accent: string }) {
  return (
    <AbsoluteFill style={{ background: "#0b0c0f" }}>
      <Series>
        <Series.Sequence durationInFrames={40}>
          <Card label="<Series> A" color={accent} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={40}>
          <Card label="<Series> B" color="#f472b6" />
        </Series.Sequence>
        <Series.Sequence durationInFrames={40}>
          <Card label="<Series> C" color="#fbbf24" />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
}

function LoopDemo({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % 30, [0, 15, 30], [0.85, 1.15, 0.85]);
  return (
    <AbsoluteFill style={{ background: "#0b0c0f" }}>
      <Loop durationInFrames={30}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            background: `radial-gradient(circle at center, ${accent}55, #0b0c0f)`,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: accent,
              transform: `scale(${pulse})`,
              boxShadow: `0 0 60px ${accent}`,
            }}
          />
          <p
            style={{
              position: "absolute",
              bottom: 80,
              color: "white",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            &lt;Loop durationInFrames={"{30}"} /&gt;
          </p>
        </AbsoluteFill>
      </Loop>
    </AbsoluteFill>
  );
}

function FreezeDemo({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0b0c0f" }}>
      <Freeze frame={45}>
        <Card label={`Frozen @ frame 45 (now ${frame})`} color={accent} />
      </Freeze>
    </AbsoluteFill>
  );
}

function InterpolateDemo({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 90], [-400, 400], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 20, 70, 90], [0, 1, 1, 0]);
  return (
    <AbsoluteFill
      style={{
        background: "#0b0c0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `translateX(${x}px)`,
          opacity,
          padding: "24px 40px",
          borderRadius: 16,
          background: accent,
          color: "white",
          fontSize: 36,
          fontWeight: 800,
        }}
      >
        interpolate()
      </div>
    </AbsoluteFill>
  );
}

function SpringDemo({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.6 },
  });
  return (
    <AbsoluteFill
      style={{
        background: "#0b0c0f",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          width: 220,
          height: 220,
          borderRadius: 32,
          background: `linear-gradient(135deg, ${accent}, #22d3ee)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 28,
          fontWeight: 800,
          boxShadow: `0 20px 80px ${accent}66`,
        }}
      >
        spring()
      </div>
    </AbsoluteFill>
  );
}

export const PrimitivesLab: React.FC<PrimitivesLabProps> = ({
  mode,
  accent,
}) => {
  switch (mode) {
    case "series":
      return <SeriesDemo accent={accent} />;
    case "loop":
      return <LoopDemo accent={accent} />;
    case "freeze":
      return <FreezeDemo accent={accent} />;
    case "interpolate":
      return <InterpolateDemo accent={accent} />;
    case "spring":
      return <SpringDemo accent={accent} />;
    default:
      return <SequenceDemo accent={accent} />;
  }
};

/** Tiny media strip proving Img / AbsoluteFill / Audio wiring. */
export const MediaPrimitivesLab: React.FC<{ imageSrc: string }> = ({
  imageSrc,
}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 90], [1, 1.15], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img
        src={imageSrc}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(transparent 40%, rgba(0,0,0,0.75) 100%)",
          justifyContent: "flex-end",
          padding: 48,
        }}
      >
        <p style={{ color: "white", fontSize: 40, fontWeight: 800 }}>
          &lt;Img /&gt; + AbsoluteFill
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
