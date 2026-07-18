"use client";

import { useCallback, useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import type { ExportFormat, ExportQuality } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Loader2 } from "lucide-react";

interface ExportVideoButtonProps {
  projectId: string;
  projectName: string;
  compositionId: string;
  inputProps: Record<string, unknown>;
  trigger?: React.ReactNode;
}

/**
 * Queues an export job and surfaces download when the server render completes.
 */
export function ExportVideoButton({
  projectId,
  projectName,
  compositionId,
  inputProps,
  trigger,
}: ExportVideoButtonProps) {
  const addRender = useProjectStore((s) => s.addRender);
  const updateRender = useProjectStore((s) => s.updateRender);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "rendering" | "done" | "error">(
    "idle"
  );
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startExport = useCallback(async () => {
    const jobId = `job-${Date.now()}`;
    const format: ExportFormat = "mp4";
    const quality: ExportQuality = "1080p";

    addRender({
      id: jobId,
      projectId,
      projectName,
      status: "queued",
      progress: 0,
      format,
      quality,
      aspectRatio: "16:9",
      createdAt: new Date().toISOString(),
    });

    setStatus("rendering");
    setProgress(5);
    setErrorMessage(null);
    setOutputUrl(null);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          compositionId,
          inputProps,
          format,
          quality,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        jobId?: string;
        outputUrl?: string;
        error?: string;
        message?: string;
        status?: string;
      };

      if (data.ok && data.outputUrl) {
        setProgress(100);
        setOutputUrl(data.outputUrl);
        updateRender(jobId, {
          status: "completed",
          progress: 100,
          outputUrl: data.outputUrl,
        });
        setStatus("done");
        toast.success("Video ready to download");
        return;
      }

      const msg =
        data.error ??
        data.message ??
        (data.status === "queued"
          ? "Rendering is not available on this server. Run locally with REMOTION_RENDER=1."
          : "Export failed — no output file was produced.");

      setStatus("error");
      setErrorMessage(msg);
      updateRender(jobId, { status: "failed", progress: 0, error: msg });
      toast.error(msg);
    } catch {
      const msg = "Export failed — could not reach the render server.";
      setStatus("error");
      setErrorMessage(msg);
      updateRender(jobId, { status: "failed", progress: 0, error: msg });
      toast.error(msg);
    }
  }, [addRender, updateRender, projectId, projectName, compositionId, inputProps]);

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setOutputUrl(null);
    setErrorMessage(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="glow">
            <Download className="mr-2 h-4 w-4" /> Export MP4
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Renders <strong>{compositionId}</strong> as MP4 (1080p).
          </p>

          {status === "idle" && (
            <Button className="w-full" variant="glow" onClick={startExport}>
              Start render
            </Button>
          )}

          {status === "rendering" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Rendering… {progress}%
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                This can take a minute on first export while Remotion bundles.
              </p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <Button asChild className="w-full" variant="glow">
              <a href={outputUrl} download={`${projectName}.mp4`}>
                <Download className="mr-2 h-4 w-4" /> Download MP4
              </a>
            </Button>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                {errorMessage ?? "Render failed."}
              </p>
              <Button className="w-full" variant="outline" onClick={reset}>
                Try again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
