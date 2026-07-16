"use client";

import { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { AudioWaveform } from "./audio-waveform";

const TRACK_COLORS: Record<string, string> = {
  video: "bg-indigo-500/80",
  text: "bg-cyan-500/80",
  audio: "bg-amber-500/80",
  shape: "bg-pink-500/80",
  caption: "bg-emerald-500/80",
  effect: "bg-violet-500/80",
  solid: "bg-slate-500/80",
  image: "bg-sky-500/80",
  gif: "bg-pink-500/80",
  noise: "bg-fuchsia-500/80",
  lottie: "bg-rose-500/80",
  three: "bg-fuchsia-500/80",
};

type DragState =
  | { mode: "move" | "trim-start" | "trim-end"; id: string; startX: number; origStart: number; origDuration: number }
  | null;

export function Timeline() {
  const project = useEditorStore((s) => s.project);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const timelineZoom = useEditorStore((s) => s.timelineZoom);
  const showWaveforms = useEditorStore((s) => s.showWaveforms);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const setFrame = useEditorStore((s) => s.setFrame);
  const selectLayers = useEditorStore((s) => s.selectLayers);
  const moveLayer = useEditorStore((s) => s.moveLayer);
  const trimLayer = useEditorStore((s) => s.trimLayer);
  const toggleLayerLock = useEditorStore((s) => s.toggleLayerLock);
  const toggleLayerVisibility = useEditorStore((s) => s.toggleLayerVisibility);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>(null);
  const [dragging, setDragging] = useState(false);

  const { durationInFrames, fps } = project.settings;
  const pxPerFrame = 4 * timelineZoom;
  const totalWidth = durationInFrames * pxPerFrame;

  const snapPoints = useMemo(() => {
    const pts = new Set<number>([0, durationInFrames, currentFrame]);
    project.scenes.forEach((sc) => {
      pts.add(sc.startFrame);
      pts.add(sc.startFrame + sc.durationInFrames);
    });
    project.layers.forEach((l) => {
      pts.add(l.startFrame);
      pts.add(l.startFrame + l.durationInFrames);
    });
    return [...pts];
  }, [project.scenes, project.layers, durationInFrames, currentFrame]);

  const snap = (frame: number) => {
    if (!snapEnabled) return frame;
    const threshold = 8 / pxPerFrame;
    let best = frame;
    let bestDist = threshold;
    for (const p of snapPoints) {
      const d = Math.abs(p - frame);
      if (d < bestDist) {
        best = p;
        bestDist = d;
      }
    }
    return Math.round(best);
  };

  const markers = useMemo(() => {
    const step = fps * (timelineZoom < 0.75 ? 2 : 1);
    const items: number[] = [];
    for (let f = 0; f <= durationInFrames; f += step) items.push(f);
    return items;
  }, [durationInFrames, fps, timelineZoom]);

  const onRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft ?? 0);
    setFrame(Math.round(x / pxPerFrame));
  };

  const beginDrag = (
    e: React.PointerEvent,
    mode: "move" | "trim-start" | "trim-end",
    id: string,
    origStart: number,
    origDuration: number
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { mode, id, startX: e.clientX, origStart, origDuration };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const deltaFrames = Math.round((e.clientX - d.startX) / pxPerFrame);
    if (d.mode === "move") {
      moveLayer(d.id, snap(d.origStart + deltaFrames));
    } else if (d.mode === "trim-start") {
      const newStart = snap(d.origStart + deltaFrames);
      const newDur = d.origStart + d.origDuration - newStart;
      trimLayer(d.id, newStart, newDur);
    } else {
      const newDur = snap(d.origStart + d.origDuration + deltaFrames) - d.origStart;
      trimLayer(d.id, d.origStart, newDur);
    }
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const tracks =
    project.tracks.length > 0
      ? project.tracks
      : [
          {
            id: "t-default",
            name: "Main",
            kind: "video" as const,
            locked: false,
            muted: false,
            height: 48,
          },
        ];

  return (
    <div className="flex h-52 flex-col border-t border-[var(--editor-border)] bg-[var(--editor-bg)]">
      <div className="flex min-h-0 flex-1">
        {/* Track labels */}
        <div className="flex w-36 shrink-0 flex-col border-r border-[var(--editor-border)] bg-[var(--editor-panel)]">
          <div className="flex h-7 items-center border-b border-[var(--editor-border)] px-3 text-[10px] uppercase tracking-wider text-white/40">
            Tracks
          </div>
          {tracks.map((t) => (
            <div
              key={t.id}
              className="flex items-center border-b border-[var(--editor-border)]/50 px-3 text-xs text-white/60"
              style={{ height: t.height }}
            >
              {t.name}
            </div>
          ))}
        </div>

        {/* Timeline scroll */}
        <div ref={scrollRef} className="relative flex-1 overflow-auto scrollbar-thin">
          <div style={{ width: totalWidth, minWidth: "100%" }}>
            {/* Ruler */}
            <div
              className="relative h-7 cursor-pointer border-b border-[var(--editor-border)] bg-[var(--editor-panel)]"
              onClick={onRulerClick}
            >
              {markers.map((f) => (
                <div
                  key={f}
                  className="absolute top-0 h-full border-l border-white/10"
                  style={{ left: f * pxPerFrame }}
                >
                  <span className="ml-1 font-mono text-[9px] text-white/35">
                    {formatDuration(f, fps)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tracks + clips */}
            {tracks.map((track) => {
              const layers = project.layers.filter((l) => l.trackId === track.id);
              return (
                <div
                  key={track.id}
                  className="relative border-b border-[var(--editor-border)]/40"
                  style={{
                    height: track.height,
                    background: "var(--timeline-track)",
                  }}
                >
                  {layers.map((layer) => {
                    const selected = selectedLayerIds.includes(layer.id);
                    const hidden = layer.visible === false;
                    return (
                      <div
                        key={layer.id}
                        onPointerDown={(e) => {
                          if (layer.locked) return;
                          selectLayers(
                            e.metaKey || e.ctrlKey
                              ? selected
                                ? selectedLayerIds.filter((id) => id !== layer.id)
                                : [...selectedLayerIds, layer.id]
                              : [layer.id]
                          );
                          beginDrag(
                            e,
                            "move",
                            layer.id,
                            layer.startFrame,
                            layer.durationInFrames
                          );
                        }}
                        onPointerMove={onPointerMove}
                        onPointerUp={endDrag}
                        className={cn(
                          "group absolute top-1 bottom-1 flex select-none items-center overflow-hidden rounded-md px-2 text-[10px] font-medium text-white shadow-sm transition-[box-shadow]",
                          TRACK_COLORS[layer.type] ?? "bg-slate-500/80",
                          layer.locked ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
                          selected && "ring-2 ring-white ring-offset-1 ring-offset-black",
                          hidden && "opacity-40"
                        )}
                        style={{
                          left: layer.startFrame * pxPerFrame,
                          width: Math.max(layer.durationInFrames * pxPerFrame, 24),
                        }}
                      >
                        {/* trim start handle */}
                        {!layer.locked && (
                          <span
                            onPointerDown={(e) =>
                              beginDrag(
                                e,
                                "trim-start",
                                layer.id,
                                layer.startFrame,
                                layer.durationInFrames
                              )
                            }
                            className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize bg-white/0 group-hover:bg-white/40"
                          />
                        )}
                        <span className="pointer-events-none truncate">
                          {layer.name}
                        </span>
                        {showWaveforms && layer.type === "audio" && (
                          <div className="pointer-events-none absolute inset-x-1 bottom-0.5 h-3 opacity-60">
                            <AudioWaveform src={layer.src} bars={24} />
                          </div>
                        )}
                        {/* trim end handle */}
                        {!layer.locked && (
                          <span
                            onPointerDown={(e) =>
                              beginDrag(
                                e,
                                "trim-end",
                                layer.id,
                                layer.startFrame,
                                layer.durationInFrames
                              )
                            }
                            className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize bg-white/0 group-hover:bg-white/40"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Playhead */}
            <div
              className="pointer-events-none absolute top-0 z-20 w-px bg-red-500"
              style={{
                left: currentFrame * pxPerFrame,
                height: 28 + tracks.reduce((a, t) => a + t.height, 0),
              }}
            >
              <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-sm bg-red-500" />
            </div>
          </div>
        </div>
      </div>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50" />
      )}
    </div>
  );
}

/** Compact per-layer lock/visibility toggles used by the Layers panel. */
export function LayerToggles({ id }: { id: string }) {
  const layer = useEditorStore((s) => s.project.layers.find((l) => l.id === id));
  const toggleLock = useEditorStore((s) => s.toggleLayerLock);
  const toggleVisibility = useEditorStore((s) => s.toggleLayerVisibility);
  if (!layer) return null;
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => toggleVisibility(layer.id)}
        className="text-white/50 hover:text-white"
      >
        {layer.visible === false ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={() => toggleLock(layer.id)}
        className="text-white/50 hover:text-white"
      >
        {layer.locked ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <Unlock className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
