"use client";

import Link from "next/link";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjectStore } from "@/stores/project-store";
import { formatRelative } from "@/lib/utils";

export default function ExportPage() {
  const renders = useProjectStore((s) => s.renders);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export Center</h1>
        <p className="text-sm text-muted-foreground">
          Remotion → frame generation → FFmpeg → download
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.6fr] gap-2 border-b border-border bg-muted/40 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Project</span>
          <span>Format</span>
          <span>Quality</span>
          <span>Progress</span>
          <span>Action</span>
        </div>
        {renders.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_0.6fr] items-center gap-2 border-b border-border px-4 py-3.5 last:border-0"
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
                  ~{r.estimatedSeconds ?? 90}s
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Pipeline: Project State → Composition → Frames → BullMQ → FFmpeg → R2/Supabase.{" "}
        <Link href="/settings" className="text-primary hover:underline">
          Configure Lambda
        </Link>
      </p>
    </div>
  );
}
