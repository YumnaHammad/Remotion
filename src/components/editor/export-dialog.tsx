"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { useProjectStore } from "@/stores/project-store";
import { toast } from "sonner";
import type {
  AspectRatio,
  ExportFormat,
  ExportQuality,
  RenderJob,
} from "@/types";
import {
  downloadExportFile,
  startExportProgress,
} from "@/lib/export-download";

const FORMATS: ExportFormat[] = ["mp4", "webm", "gif"];
const QUALITIES: ExportQuality[] = ["720p", "1080p", "2k", "4k"];
const RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1", "4:5"];
const FPS_CHOICES = [24, 30, 60];

function Option({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium transition",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40"
      )}
    >
      {children}
    </button>
  );
}

export function ExportDialog({ trigger }: { trigger?: React.ReactNode }) {
  const project = useEditorStore((s) => s.project);
  const addRender = useProjectStore((s) => s.addRender);
  const updateRender = useProjectStore((s) => s.updateRender);
  const updateProject = useProjectStore((s) => s.updateProject);

  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("mp4");
  const [quality, setQuality] = useState<ExportQuality>("1080p");
  const [ratio, setRatio] = useState<AspectRatio>(project.settings.aspectRatio);
  const [fps, setFps] = useState<number>(project.settings.fps);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const start = async () => {
    setBusy(true);
    setProgress(5);
    const job: RenderJob = {
      id: `r-${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      status: "queued",
      progress: 0,
      format,
      quality,
      aspectRatio: ratio,
      createdAt: new Date().toISOString(),
      estimatedSeconds: quality === "4k" ? 240 : 120,
    };
    addRender(job);
    updateProject(project.id, { ...project, status: "rendering" });

    const stopProgress = startExportProgress(setProgress);
    updateRender(job.id, { status: "rendering", progress: 5 });

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          compositionId: "Main",
          inputProps: { project },
          format,
          quality,
          directDownload: true,
        }),
      });

      stopProgress();

      const contentType = res.headers.get("Content-Type") ?? "";
      const filename = `${project.name.replace(/[^\w.-]+/g, "-") || project.id}.${format}`;

      if (contentType.includes("video/") || contentType.includes("image/gif")) {
        const blob = await res.blob();
        if (!blob.size) {
          throw new Error("Export returned an empty file.");
        }

        const outputUrl =
          res.headers.get("X-Export-Output-Url") ??
          `/api/exports/${project.id}.${format}`;

        updateRender(job.id, {
          status: "completed",
          progress: 100,
          outputUrl,
        });
        updateProject(project.id, { ...project, status: "ready" });
        setProgress(100);
        toast.success("Render complete", { description: project.name });
        await downloadExportFile(blob, filename);
        setOpen(false);
        return;
      }

      const data = (await res.json()) as {
        ok?: boolean;
        outputUrl?: string;
        error?: string;
      };

      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "Export failed.");
      }

      if (data.outputUrl) {
        updateRender(job.id, {
          status: "completed",
          progress: 100,
          outputUrl: data.outputUrl,
        });
        updateProject(project.id, { ...project, status: "ready" });
        setProgress(100);
        toast.success("Render complete", { description: project.name });
        await downloadExportFile(data.outputUrl, filename);
        setOpen(false);
        return;
      }

      throw new Error("Export failed — no output file was produced.");
    } catch (err) {
      stopProgress();
      const msg =
        err instanceof Error ? err.message : "Export failed unexpectedly.";
      updateRender(job.id, { status: "failed", progress: 0, error: msg });
      updateProject(project.id, { ...project, status: "ready" });
      toast.error(msg);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="glow">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export video</DialogTitle>
          <DialogDescription>
            Renders your timeline via Remotion and downloads when complete.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <Option key={f} active={format === f} onClick={() => setFormat(f)}>
                  {f.toUpperCase()}
                </Option>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quality</Label>
            <div className="grid grid-cols-4 gap-2">
              {QUALITIES.map((q) => (
                <Option key={q} active={quality === q} onClick={() => setQuality(q)}>
                  {q}
                </Option>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Aspect ratio</Label>
            <div className="grid grid-cols-4 gap-2">
              {RATIOS.map((r) => (
                <Option key={r} active={ratio === r} onClick={() => setRatio(r)}>
                  {r}
                </Option>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frame rate</Label>
            <div className="grid grid-cols-3 gap-2">
              {FPS_CHOICES.map((f) => (
                <Option key={f} active={fps === f} onClick={() => setFps(f)}>
                  {f} fps
                </Option>
              ))}
            </div>
          </div>

          {busy && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Rendering… {progress}%
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button
            variant="glow"
            className="w-full"
            onClick={start}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Start export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
