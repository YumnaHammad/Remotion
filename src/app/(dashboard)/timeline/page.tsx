"use client";

import Link from "next/link";
import { ListVideo, Scissors, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/stores/project-store";

const FEATURES = [
  "Multi-track: video, audio, text, captions, effects",
  "Drag / trim / snap to frames & scene edges",
  "Split at playhead · nudge · multi-select",
  "Waveforms via @remotion/media-utils",
  "Undo / redo history · lock / hide layers",
  "Master + track mute/solo mixer",
];

export default function TimelineStudioPage() {
  const projects = useProjectStore((s) => s.projects);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Timeline Studio"
        description="Premiere-grade Remotion timeline — frame-accurate editing powered by Sequence / Series."
        icon={ListVideo}
        actions={
          <Button asChild variant="glow">
            <Link href={`/editor/${projects[0]?.id ?? "proj-1"}`}>
              <Scissors className="h-4 w-4" /> Open editor timeline
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-[#0b84f3]">Remotion</Badge>
            <span className="text-sm text-muted-foreground">
              Maps clips to Sequence from / durationInFrames
            </span>
          </div>
          <div className="space-y-2 rounded-lg border border-[#2b2f36] bg-black p-4 font-mono text-[11px] text-zinc-400">
            <div className="flex h-7 items-center gap-2 border-b border-white/10 pb-2 text-white/50">
              <span className="w-20">V1</span>
              <div className="h-5 flex-1 rounded bg-[#0b84f3]/80 px-2 text-[10px] leading-5 text-white">
                OffthreadVideo · 0–90f
              </div>
            </div>
            <div className="flex h-7 items-center gap-2 border-b border-white/10 pb-2">
              <span className="w-20">T1</span>
              <div className="ml-[10%] h-5 w-[40%] rounded bg-cyan-500/80 px-2 text-[10px] leading-5 text-white">
                AnimatedText · spring
              </div>
            </div>
            <div className="flex h-7 items-center gap-2 border-b border-white/10 pb-2">
              <span className="w-20">A1</span>
              <div className="h-5 flex-1 rounded bg-amber-500/70 px-2 text-[10px] leading-5 text-white">
                Audio waveform
              </div>
            </div>
            <div className="flex h-7 items-center gap-2">
              <span className="w-20">FX</span>
              <div className="ml-[55%] h-5 w-[25%] rounded bg-violet-500/80 px-2 text-[10px] leading-5 text-white">
                Transition wipe
              </div>
            </div>
            <div className="relative mt-2 h-px bg-red-500">
              <div className="absolute -top-1 left-[35%] h-3 w-3 -translate-x-1/2 rotate-45 bg-red-500" />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Capabilities
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {FEATURES.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild className="w-full" variant="outline">
            <Link href={`/editor/${projects[0]?.id ?? "proj-1"}`}>
              Launch full timeline
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
