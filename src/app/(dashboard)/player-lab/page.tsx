"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Pause,
  Play,
  PlayCircle,
  SkipBack,
  SkipForward,
  Maximize2,
} from "lucide-react";
import { Player, type PlayerRef } from "@remotion/player";
import { PageHeader } from "@/components/studio/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PrimitivesLab } from "@/remotion/labs/PrimitivesLab";
import { AnimationLab } from "@/remotion/labs/AnimationLab";
import { TransitionsShowcase } from "@/remotion/compositions/TransitionsShowcase";
import { CaptionDemo } from "@/remotion/compositions/Captions";
import { ThreeShowcase } from "@/remotion/compositions/ThreeShowcase";

const PRESETS = {
  PrimitivesLab: {
    component: PrimitivesLab,
    props: { mode: "spring" as const, accent: "#0b84f3" },
    w: 1280,
    h: 720,
    frames: 120,
  },
  AnimationLab: {
    component: AnimationLab,
    props: {
      mode: "spring" as const,
      intensity: 1,
      accent: "#0b84f3",
      text: "Player Lab",
    },
    w: 1280,
    h: 720,
    frames: 120,
  },
  TransitionsShowcase: {
    component: TransitionsShowcase,
    props: {},
    w: 1920,
    h: 1080,
    frames: 240,
  },
  CaptionDemo: {
    component: CaptionDemo,
    props: {},
    w: 1080,
    h: 1920,
    frames: 150,
  },
  ThreeShowcase: {
    component: ThreeShowcase,
    props: { title: "3D Product Orbit" },
    w: 1920,
    h: 1080,
    frames: 120,
  },
} as const;

type PresetKey = keyof typeof PRESETS;

function PlayerLabInner() {
  const search = useSearchParams();
  const initial = (search.get("comp") as PresetKey) || "PrimitivesLab";
  const [preset, setPreset] = useState<PresetKey>(
    initial in PRESETS ? initial : "PrimitivesLab"
  );
  const [playing, setPlaying] = useState(true);
  const [loop, setLoop] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [frame, setFrame] = useState(0);
  const playerRef = useRef<PlayerRef>(null);

  const cfg = PRESETS[preset];
  const fps = 30;

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) =>
      setFrame(e.detail.frame);
    p.addEventListener("frameupdate", onFrame);
    return () => p.removeEventListener("frameupdate", onFrame);
  }, [preset]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.play();
    else p.pause();
  }, [playing, preset]);

  const aspect = useMemo(() => `${cfg.w} / ${cfg.h}`, [cfg.w, cfg.h]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Player Lab"
        description="@remotion/player playground — play, pause, seek, frame step, speed, loop, fullscreen."
        icon={PlayCircle}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_320px]">
        <div
          className="relative overflow-hidden rounded-xl border border-[#2b2f36] bg-black shadow-2xl"
          style={{ aspectRatio: aspect }}
        >
          <Player
            ref={playerRef}
            component={cfg.component as React.ComponentType}
            inputProps={cfg.props}
            durationInFrames={cfg.frames}
            compositionWidth={cfg.w}
            compositionHeight={cfg.h}
            fps={fps}
            style={{ width: "100%", height: "100%" }}
            controls={false}
            loop={loop}
            autoPlay
            playbackRate={speed}
            acknowledgeRemotionLicense
          />
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label>Composition</Label>
            <Select
              value={preset}
              onValueChange={(v) => setPreset(v as PresetKey)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PRESETS).map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => playerRef.current?.seekTo(0)}
            >
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="glow"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() =>
                playerRef.current?.seekTo(Math.min(cfg.frames - 1, frame + 1))
              }
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => playerRef.current?.requestFullscreen()}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label>
              Frame · {frame} / {cfg.frames - 1}
            </Label>
            <Slider
              value={[frame]}
              min={0}
              max={cfg.frames - 1}
              step={1}
              onValueChange={([v]) => {
                setFrame(v);
                playerRef.current?.seekTo(v);
                setPlaying(false);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Speed · {speed.toFixed(2)}x</Label>
            <Slider
              value={[speed]}
              min={0.25}
              max={2}
              step={0.05}
              onValueChange={([v]) => setSpeed(v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Loop</Label>
            <Switch checked={loop} onCheckedChange={setLoop} />
          </div>

          <Badge variant="secondary">Space · ← → in editor</Badge>
        </div>
      </div>
    </div>
  );
}

export default function PlayerLabPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground">Loading Player Lab…</div>
      }
    >
      <PlayerLabInner />
    </Suspense>
  );
}
