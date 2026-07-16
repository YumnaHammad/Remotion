"use client";

import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/stores/editor-store";
import { formatDuration } from "@/lib/utils";
import type { AspectRatio } from "@/types";

export function TransportBar() {
  const project = useEditorStore((s) => s.project);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const timelineZoom = useEditorStore((s) => s.timelineZoom);
  const togglePlay = useEditorStore((s) => s.togglePlay);
  const setFrame = useEditorStore((s) => s.setFrame);
  const setTimelineZoom = useEditorStore((s) => s.setTimelineZoom);
  const setAspectRatio = useEditorStore((s) => s.setAspectRatio);

  const { fps, durationInFrames, aspectRatio } = project.settings;

  return (
    <div className="flex h-11 items-center gap-2 border-b border-[var(--editor-border)] bg-[var(--editor-panel)] px-3">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => setFrame(0)}
        >
          <SkipBack className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white hover:bg-white/10"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => setFrame(durationInFrames - 1)}
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="font-mono text-xs text-white/70">
        {formatDuration(currentFrame, fps)}
        <span className="mx-1 text-white/30">/</span>
        {formatDuration(durationInFrames, fps)}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/60 hover:bg-white/10"
          onClick={() => setTimelineZoom(timelineZoom - 0.25)}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="w-10 text-center font-mono text-[10px] text-white/50">
          {Math.round(timelineZoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/60 hover:bg-white/10"
          onClick={() => setTimelineZoom(timelineZoom + 0.25)}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Select
        value={aspectRatio}
        onValueChange={(v) => setAspectRatio(v as AspectRatio)}
      >
        <SelectTrigger className="h-8 w-[90px] border-white/10 bg-white/5 text-xs text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(["16:9", "9:16", "1:1", "4:5"] as AspectRatio[]).map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
