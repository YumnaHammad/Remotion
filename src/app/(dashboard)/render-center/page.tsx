"use client";

import Link from "next/link";
import {
  Download,
  RefreshCw,
  Server,
  Terminal,
} from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjectStore } from "@/stores/project-store";
import { formatRelative } from "@/lib/utils";
import { PIPELINE_STAGES } from "@/lib/render-pipeline";

export default function RenderCenterPage() {
  const renders = useProjectStore((s) => s.renders);
  const active = renders.filter(
    (r) =>
      r.status === "rendering" ||
      r.status === "queued" ||
      r.status === "processing"
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Render Center"
        description="Remotion bundler → renderer → FFmpeg. Track queue, progress, ETA, and export history."
        icon={Server}
        actions={
          <Button asChild variant="glow">
            <Link href="/projects">Queue from project</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Active", value: String(active.length) },
          { label: "Completed", value: String(renders.filter((r) => r.status === "completed").length) },
          { label: "Failed", value: String(renders.filter((r) => r.status === "failed").length) },
          { label: "Formats", value: "MP4 · WebM · GIF" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Terminal className="h-4 w-4 text-primary" /> Pipeline stages
        </div>
        <div className="flex flex-wrap gap-2">
          {(PIPELINE_STAGES ?? ["bundle", "selectComposition", "renderMedia", "encode"]).map(
            (stage: string) => (
              <Badge key={stage} variant="secondary" className="font-mono text-[10px]">
                {stage}
              </Badge>
            )
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-[1.4fr_0.6fr_0.6fr_0.9fr_0.7fr] gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Job</span>
          <span>Format</span>
          <span>Quality</span>
          <span>Progress</span>
          <span>Action</span>
        </div>
        {renders.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[1.4fr_0.6fr_0.6fr_0.9fr_0.7fr] items-center gap-2 border-b border-border px-4 py-3.5 last:border-0"
          >
            <div>
              <p className="text-sm font-medium">{r.projectName}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatRelative(r.createdAt)} · {r.aspectRatio}
              </p>
            </div>
            <Badge variant="secondary">{r.format.toUpperCase()}</Badge>
            <span className="text-sm">{r.quality}</span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    r.status === "completed"
                      ? "success"
                      : r.status === "failed"
                        ? "destructive"
                        : "warning"
                  }
                >
                  {r.status}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {r.progress}%
                </span>
              </div>
              <Progress value={r.progress} />
              {r.error && (
                <p className="text-[10px] text-destructive">{r.error}</p>
              )}
            </div>
            <div>
              {r.status === "completed" ? (
                <Button size="sm" variant="outline" asChild>
                  <a href={r.outputUrl ?? "#"}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </Button>
              ) : r.status === "failed" ? (
                <Button size="sm" variant="ghost">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  ETA ~{r.estimatedSeconds ?? 90}s
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
