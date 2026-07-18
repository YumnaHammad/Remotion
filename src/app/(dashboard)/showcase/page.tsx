"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Box,
  Captions,
  Clapperboard,
  Layers,
  PlayCircle,
  Server,
  Sparkles,
  Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { DemoStage } from "@/components/studio/demo-stage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrimitivesLab } from "@/remotion/labs/PrimitivesLab";
import { AnimationLab } from "@/remotion/labs/AnimationLab";
import { TransitionsShowcase } from "@/remotion/compositions/TransitionsShowcase";
import { CaptionDemo } from "@/remotion/compositions/Captions";
import { ThreeShowcase } from "@/remotion/compositions/ThreeShowcase";

const SECTIONS = [
  {
    title: "Core primitives",
    href: "/player-lab?comp=PrimitivesLab",
    icon: Layers,
    blurb: "Composition · Sequence · Series · Loop · Freeze · interpolate · spring",
    demo: (
      <DemoStage
        component={PrimitivesLab}
        inputProps={{ mode: "sequence", accent: "#0b84f3" }}
        durationInFrames={120}
        compositionWidth={1280}
        compositionHeight={720}
        controls={false}
      />
    ),
  },
  {
    title: "Animation playground",
    href: "/animations",
    icon: Wand2,
    blurb: "Springs, easing curves, typewriter, counters, parallax, shake",
    demo: (
      <DemoStage
        component={AnimationLab}
        inputProps={{
          mode: "spring",
          intensity: 1,
          accent: "#0b84f3",
          text: "Remotion",
        }}
        durationInFrames={120}
        compositionWidth={1280}
        compositionHeight={720}
        controls={false}
      />
    ),
  },
  {
    title: "Transition gallery",
    href: "/transitions",
    icon: ArrowLeftRight,
    blurb: "@remotion/transitions — fade, slide, wipe, cinematic",
    demo: (
      <DemoStage
        component={TransitionsShowcase}
        durationInFrames={240}
        compositionWidth={1920}
        compositionHeight={1080}
        controls={false}
      />
    ),
  },
  {
    title: "Caption demos",
    href: "/captions",
    icon: Captions,
    blurb: "@remotion/captions TikTok-style karaoke highlighting",
    demo: (
      <DemoStage
        component={CaptionDemo}
        durationInFrames={150}
        compositionWidth={1080}
        compositionHeight={1920}
        controls={false}
        className="max-h-[320px] mx-auto"
      />
    ),
  },
  {
    title: "Three.js demos",
    href: "/three",
    icon: Box,
    blurb: "@remotion/three product orbits & lighting",
    demo: (
      <DemoStage
        component={ThreeShowcase}
        inputProps={{ title: "3D Product Orbit" }}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        controls={false}
      />
    ),
  },
  {
    title: "Player Lab",
    href: "/player-lab",
    icon: PlayCircle,
    blurb: "Seek, speed, loop, fullscreen — full @remotion/player API",
    demo: null,
  },
  {
    title: "Storyboard → Timeline",
    href: "/storyboard",
    icon: Clapperboard,
    blurb: "Scene planning that maps to Series.Sequence",
    demo: null,
  },
  {
    title: "Render Center",
    href: "/render-center",
    icon: Server,
    blurb: "Queue · progress · MP4 / WebM / GIF · 720p–4K",
    demo: null,
  },
];

export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Showcase"
        description="Every major Remotion capability — live previews, labs, and links into the full studio OS."
        icon={Sparkles}
        actions={
          <Badge className="bg-[#0b84f3] text-white">Remotion ecosystem</Badge>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {s.demo && <div className="border-b border-border">{s.demo}</div>}
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold">{s.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{s.blurb}</p>
              <Button asChild size="sm" variant="outline">
                <Link href={s.href}>Open</Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
