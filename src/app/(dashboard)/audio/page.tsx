"use client";

import Link from "next/link";
import { Music } from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { AudioMixer } from "@/components/editor/audio-mixer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/stores/project-store";
import { SAMPLE_AUDIO } from "@/data/mock";
import { AudioWaveform } from "@/components/editor/audio-waveform";

export default function AudioStudioPage() {
  const projects = useProjectStore((s) => s.projects);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Audio Studio"
        description="Multi-track Remotion <Audio/> mixing — mute, solo, volume, waveforms, fades."
        icon={Music}
        actions={
          <Button asChild variant="glow">
            <Link href={`/editor/${projects[0]?.id ?? "proj-1"}`}>
              Open in editor
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Waveform preview</p>
            <Badge variant="secondary">@remotion/media-utils</Badge>
          </div>
          <div className="rounded-lg border border-border bg-black/40 p-4">
            <AudioWaveform src={SAMPLE_AUDIO} bars={48} />
          </div>
          <p className="text-xs text-muted-foreground">
            Sample: ambient lofi · used by timeline audio clips
          </p>
        </div>
        <div className="rounded-xl border border-border bg-[#191b1f] p-4">
          <AudioMixer />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        <p className="mb-2 font-semibold text-foreground">Pipeline</p>
        Layer volume × track volume × master → Remotion &lt;Audio volume=&#123;&#125; /&gt;
        and &lt;OffthreadVideo volume=&#123;&#125; /&gt;. Solo mutes non-soloed tracks.
      </div>
    </div>
  );
}
