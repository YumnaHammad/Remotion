"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Trash2,
  Type,
  Video,
  Music,
  Shapes,
  Captions,
  Unlock,
  LayoutGrid,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import type { LayerType } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TYPE_ICON: Partial<
  Record<LayerType, React.ComponentType<{ className?: string }>>
> = {
  text: Type,
  image: ImageIcon,
  video: Video,
  gif: ImageIcon,
  audio: Music,
  shape: Shapes,
  noise: Shapes,
  caption: Captions,
  solid: Square,
  collage: LayoutGrid,
  sticker: ImageIcon,
  pattern: Shapes,
};

export function LayersPanel() {
  const layers = useEditorStore((s) => s.project.layers);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const selectLayers = useEditorStore((s) => s.selectLayers);
  const reorderLayer = useEditorStore((s) => s.reorderLayer);
  const bringLayerToFront = useEditorStore((s) => s.bringLayerToFront);
  const sendLayerToBack = useEditorStore((s) => s.sendLayerToBack);
  const toggleLock = useEditorStore((s) => s.toggleLayerLock);
  const toggleVisibility = useEditorStore((s) => s.toggleLayerVisibility);
  const removeLayers = useEditorStore((s) => s.removeLayers);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Top of list = front (renders last). Bottom of list = back.
  const ordered = [...layers].reverse();
  const selectedId = selectedLayerIds[0];

  return (
    <div className="flex max-h-[38%] min-h-[7rem] shrink-0 flex-col overflow-hidden border-b border-[var(--editor-border)]">
      <div className="flex shrink-0 items-center justify-between gap-1 px-3 py-2">
        <p className="text-xs font-semibold text-white/70">
          Your pieces · {layers.length}
        </p>
        {selectedId && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Bring to front"
              onClick={() => {
                bringLayerToFront(selectedId);
                toast.message("Brought to front");
              }}
              className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <ArrowUpToLine className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title="Send to back (background)"
              onClick={() => {
                sendLayerToBack(selectedId);
                toast.message("Sent to back — now behind other layers");
              }}
              className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <p className="shrink-0 px-3 pb-1.5 text-[10px] text-white/40">
        Top sits in front · Bottom sits behind. Tap one to edit it.
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
        {ordered.length === 0 && (
          <p className="px-2 py-6 text-center text-xs leading-relaxed text-white/45">
            Nothing here yet.
            <br />
            Add words, photos, or music from the left side.
          </p>
        )}
        {ordered.map((layer, visualIndex) => {
          const Icon = TYPE_ICON[layer.type] ?? Shapes;
          const selected = selectedLayerIds.includes(layer.id);
          const isBack = visualIndex === ordered.length - 1;
          const isFront = visualIndex === 0;
          return (
            <div
              key={layer.id}
              role="button"
              tabIndex={0}
              onClick={() => selectLayers([layer.id])}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectLayers([layer.id]);
                }
              }}
              className={cn(
                "group mb-0.5 flex cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1.5 text-xs transition",
                selected
                  ? "bg-primary/25 text-white ring-1 ring-primary/40"
                  : "text-white/70 hover:bg-white/5"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-white/50" />
              {editingId === layer.id ? (
                <input
                  autoFocus
                  defaultValue={layer.name}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    updateLayer(layer.id, { name: e.target.value });
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateLayer(layer.id, {
                        name: (e.target as HTMLInputElement).value,
                      });
                      setEditingId(null);
                    }
                  }}
                  className="min-w-0 flex-1 rounded bg-black/30 px-1 text-white outline-none"
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(layer.id);
                  }}
                  className="min-w-0 flex-1 truncate"
                >
                  {layer.name}
                  {isBack && (
                    <span className="ml-1 text-[9px] text-amber-400/80">
                      back
                    </span>
                  )}
                  {isFront && ordered.length > 1 && (
                    <span className="ml-1 text-[9px] text-sky-400/80">
                      front
                    </span>
                  )}
                </span>
              )}

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  title="Forward"
                  disabled={isFront}
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderLayer(layer.id, "up");
                  }}
                  className="text-white/45 hover:text-white disabled:opacity-20"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Backward"
                  disabled={isBack}
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderLayer(layer.id, "down");
                  }}
                  className="text-white/45 hover:text-white disabled:opacity-20"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Visibility"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(layer.id);
                  }}
                  className="text-white/45 hover:text-white"
                >
                  {layer.visible === false ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  title="Lock"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(layer.id);
                  }}
                  className="text-white/45 hover:text-white"
                >
                  {layer.locked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLayers([layer.id]);
                  }}
                  className="text-white/40 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
