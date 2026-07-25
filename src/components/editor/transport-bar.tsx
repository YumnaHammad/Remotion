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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ASPECT_PRESETS } from "@/lib/constants";
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
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const setTimelineZoom = useEditorStore((s) => s.setTimelineZoom);
  const setAspectRatio = useEditorStore((s) => s.setAspectRatio);

  const { fps, durationInFrames, aspectRatio } = project.settings;

  const jumpToStart = () => {
    setPlaying(false);
    setFrame(0);
  };

  const jumpToEnd = () => {
    setPlaying(false);
    setFrame(Math.max(0, durationInFrames - 1));
  };

  return (
    <div className="flex h-11 items-center gap-2 border-b border-[var(--editor-border)] bg-[var(--editor-panel)] px-3">
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Go to start"
              onClick={jumpToStart}
            >
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go to the beginning</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white hover:bg-white/10"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPlaying ? "Pause" : "Play preview"} (Space)
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Go to end"
              onClick={jumpToEnd}
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go to the end</TooltipContent>
        </Tooltip>
      </div>

      <div className="font-mono text-xs text-white/70" title="Current time / total length">
        {formatDuration(currentFrame, fps)}
        <span className="mx-1 text-white/30">/</span>
        {formatDuration(durationInFrames, fps)}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/60 hover:bg-white/10"
              onClick={() => setTimelineZoom(timelineZoom - 0.25)}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom timeline out</TooltipContent>
        </Tooltip>
        <span className="w-10 text-center font-mono text-[10px] text-white/50">
          {Math.round(timelineZoom * 100)}%
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/60 hover:bg-white/10"
              onClick={() => setTimelineZoom(timelineZoom + 0.25)}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom timeline in</TooltipContent>
        </Tooltip>
      </div>

      <Select
        value={aspectRatio}
        onValueChange={(v) => setAspectRatio(v as AspectRatio)}
      >
        <SelectTrigger
          className="h-8 w-[130px] border-white/10 bg-white/5 text-xs text-white"
          title="Video shape"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ASPECT_PRESETS) as AspectRatio[]).map((r) => (
            <SelectItem key={r} value={r}>
              {ASPECT_PRESETS[r].label} ({r})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
