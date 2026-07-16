"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Type,
  Image as ImageIcon,
  Video,
  Music,
  Shapes,
  Captions,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import type { LayerType } from "@/types";

const TYPE_ICON: Partial<Record<LayerType, React.ComponentType<{ className?: string }>>> = {
  text: Type,
  image: ImageIcon,
  video: Video,
  gif: ImageIcon,
  audio: Music,
  shape: Shapes,
  noise: Shapes,
  caption: Captions,
  solid: Shapes,
};

export function LayersPanel() {
  const layers = useEditorStore((s) => s.project.layers);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const selectLayers = useEditorStore((s) => s.selectLayers);
  const reorderLayer = useEditorStore((s) => s.reorderLayer);
  const toggleLock = useEditorStore((s) => s.toggleLayerLock);
  const toggleVisibility = useEditorStore((s) => s.toggleLayerVisibility);
  const removeLayers = useEditorStore((s) => s.removeLayers);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const [editingId, setEditingId] = useState<string | null>(null);

  // top of list = renders last (on top)
  const ordered = [...layers].reverse();

  return (
    <div className="flex max-h-52 flex-col border-b border-[var(--editor-border)]">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Layers · {layers.length}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
        {ordered.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-white/40">
            No layers yet. Add from the left panel.
          </p>
        )}
        {ordered.map((layer) => {
          const Icon = TYPE_ICON[layer.type] ?? Shapes;
          const selected = selectedLayerIds.includes(layer.id);
          return (
            <div
              key={layer.id}
              onClick={() => selectLayers([layer.id])}
              className={cn(
                "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition",
                selected
                  ? "bg-primary/20 text-white"
                  : "text-white/70 hover:bg-white/5"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-white/50" />
              {editingId === layer.id ? (
                <input
                  autoFocus
                  defaultValue={layer.name}
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
                  onDoubleClick={() => setEditingId(layer.id)}
                  className="min-w-0 flex-1 truncate"
                >
                  {layer.name}
                </span>
              )}

              <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  title="Move up"
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderLayer(layer.id, "up");
                  }}
                  className="text-white/40 hover:text-white"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Move down"
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderLayer(layer.id, "down");
                  }}
                  className="text-white/40 hover:text-white"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLayers([layer.id]);
                  }}
                  className="text-white/40 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(layer.id);
                }}
                className="text-white/40 hover:text-white"
              >
                {layer.visible === false ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(layer.id);
                }}
                className="text-white/40 hover:text-white"
              >
                {layer.locked ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Unlock className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
