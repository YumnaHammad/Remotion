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
import {
  downloadExportFile,
  startExportProgress,
} from "@/lib/export-download";

interface ExportVideoButtonProps {
  projectId: string;
  projectName: string;
  compositionId: string;
  inputProps: Record<string, unknown>;
  trigger?: React.ReactNode;
}

/**
 * Renders via /api/render and downloads the MP4 when complete.
 * Uses directDownload so Vercel serverless returns the file in one request.
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
  const [savedBlob, setSavedBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startExport = useCallback(async () => {
    const jobId = `job-${Date.now()}`;
    const format: ExportFormat = "mp4";
    const quality: ExportQuality = "1080p";
    const filename = `${projectName.replace(/[^\w.-]+/g, "-") || projectId}.mp4`;

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
    setSavedBlob(null);

    const stopProgress = startExportProgress(setProgress);
    updateRender(jobId, { status: "rendering", progress: 5 });

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
          directDownload: true,
        }),
      });

      stopProgress();

      const contentType = res.headers.get("Content-Type") ?? "";

      if (contentType.includes("video/") || contentType.includes("image/gif")) {
        const blob = await res.blob();
        if (!blob.size) {
          throw new Error("Export returned an empty file.");
        }

        const apiUrl =
          res.headers.get("X-Export-Output-Url") ??
          `/api/exports/${projectId}.${format}`;

        setProgress(100);
        setSavedBlob(blob);
        setOutputUrl(apiUrl);
        updateRender(jobId, {
          status: "completed",
          progress: 100,
          outputUrl: apiUrl,
        });
        setStatus("done");
        toast.success("Video ready — click Download MP4");

        await downloadExportFile(blob, filename).catch(() => undefined);
        return;
      }

      const data = (await res.json()) as {
        ok?: boolean;
        outputUrl?: string;
        error?: string;
        message?: string;
      };

      if (!res.ok || data.ok === false) {
        throw new Error(
          data.error ??
            data.message ??
            "Export failed — the render server returned an error."
        );
      }

      if (data.outputUrl) {
        setProgress(100);
        setOutputUrl(data.outputUrl);
        updateRender(jobId, {
          status: "completed",
          progress: 100,
          outputUrl: data.outputUrl,
        });
        setStatus("done");
        toast.success("Video ready to download");
        await downloadExportFile(data.outputUrl, filename);
        return;
      }

      throw new Error("Export failed — no output file was produced.");
    } catch (err) {
      stopProgress();
      const msg =
        err instanceof Error ? err.message : "Export failed unexpectedly.";
      setStatus("error");
      setErrorMessage(msg);
      updateRender(jobId, { status: "failed", progress: 0, error: msg });
      toast.error(msg);
    }
  }, [addRender, updateRender, projectId, projectName, compositionId, inputProps]);

  const handleDownload = async () => {
    const filename = `${projectName.replace(/[^\w.-]+/g, "-") || projectId}.mp4`;
    try {
      if (savedBlob) {
        await downloadExportFile(savedBlob, filename);
        return;
      }
      if (outputUrl) {
        await downloadExportFile(outputUrl, filename);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not download the file."
      );
    }
  };

  const reset = () => {
    setStatus("idle");
    setProgress(0);
    setOutputUrl(null);
    setSavedBlob(null);
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
                First export can take 1–2 minutes while Remotion bundles. Keep
                this dialog open until the download starts.
              </p>
            </div>
          )}

          {status === "done" && (outputUrl || savedBlob) && (
            <Button className="w-full" variant="glow" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download MP4
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
