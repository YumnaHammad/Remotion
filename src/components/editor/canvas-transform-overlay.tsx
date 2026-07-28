"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import type { Layer } from "@/types";
import {
  angleFromCenter,
  displayDeltaToComposition,
  isSpatialLayer,
  layerOverlayRect,
  layerVisibleAtFrame,
} from "@/lib/canvas-transform";
import { cn } from "@/lib/utils";

type DragMode = "move" | "rotate" | null;

interface DragState {
  mode: DragMode;
  layerId: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origRotation: number;
  centerX: number;
  centerY: number;
}

interface CanvasTransformOverlayProps {
  width: number;
  height: number;
}

export function CanvasTransformOverlay({
  width,
  height,
}: CanvasTransformOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

  const project = useEditorStore((s) => s.project);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const selectLayers = useEditorStore((s) => s.selectLayers);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const addLayer = useEditorStore((s) => s.addLayer);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setDisplaySize({
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visibleLayers = project.layers.filter(
    (l) => isSpatialLayer(l) && layerVisibleAtFrame(l, currentFrame) && !l.locked
  );

  const selectedId = selectedLayerIds[0];
  const selectedLayer = visibleLayers.find((l) => l.id === selectedId);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || !displaySize.w) return;
      const layer = project.layers.find((l) => l.id === d.layerId);
      if (!layer || layer.locked) return;

      if (d.mode === "move") {
        const { dx, dy } = displayDeltaToComposition(
          e.clientX - d.startX,
          e.clientY - d.startY,
          displaySize.w,
          displaySize.h,
          width,
          height
        );
        updateLayer(d.layerId, {
          transform: {
            ...layer.transform,
            x: d.origX + dx,
            y: d.origY + dy,
          },
        });
      }

      if (d.mode === "rotate") {
        const rotation = angleFromCenter(
          d.centerX,
          d.centerY,
          e.clientX,
          e.clientY
        );
        updateLayer(d.layerId, {
          transform: {
            ...layer.transform,
            rotation: Math.round(rotation),
          },
        });
      }
    },
    [displaySize, height, project.layers, updateLayer, width]
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const startDrag = (
    e: React.PointerEvent,
    layer: Layer,
    mode: DragMode,
    centerX: number,
    centerY: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (layer.locked) return;
    selectLayers([layer.id]);
    dragRef.current = {
      mode,
      layerId: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: layer.transform.x,
      origY: layer.transform.y,
      origRotation: layer.transform.rotation,
      centerX,
      centerY,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    // Only deselect when clicking empty canvas — not after selecting a layer handle
    if (e.target !== e.currentTarget) return;
    if (!dragRef.current) selectLayers([]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/framekit-layer");
    if (!raw || !displaySize.w) return;
    try {
      const payload = JSON.parse(raw) as Layer;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const localX = e.clientX - rect.left - rect.width / 2;
      const localY = e.clientY - rect.top - rect.height / 2;
      const { dx, dy } = displayDeltaToComposition(
        localX,
        localY,
        displaySize.w,
        displaySize.h,
        width,
        height
      );
      addLayer({
        ...payload,
        transform: {
          ...payload.transform,
          x: dx,
          y: dy,
        },
      });
      selectLayers([payload.id]);
    } catch {
      // ignore invalid drop payload
    }
  };

  if (!displaySize.w) {
    return (
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 touch-none"
      onClick={onCanvasClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {visibleLayers.map((layer) => {
        const rect = layerOverlayRect(
          layer,
          width,
          height,
          displaySize.w,
          displaySize.h
        );
        const isSelected = layer.id === selectedId;

        return (
          <div
            key={layer.id}
            className="absolute border-2 transition-colors hover:border-white/80"
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              transform: `rotate(${layer.transform.rotation}deg)`,
              transformOrigin: "center center",
              backgroundColor: isSelected ? "rgba(11, 132, 243, 0.08)" : "rgba(255, 255, 255, 0.02)",
              borderColor: isSelected ? "#0b84f3" : "rgba(255, 255, 255, 0.2)",
            }}
            onPointerDown={(e) =>
              startDrag(e, layer, "move", rect.centerX, rect.centerY)
            }
            onClick={(e) => {
              e.stopPropagation();
              selectLayers([layer.id]);
            }}
          >
            {isSelected && (
              <>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground">
                  {layer.name}
                  {layer.mask && layer.mask.shape !== "none"
                    ? ` · mask:${layer.mask.shape}`
                    : ""}
                </div>
                <button
                  type="button"
                  className="absolute -top-8 left-1/2 flex h-6 w-6 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-md active:cursor-grabbing"
                  onPointerDown={(e) =>
                    startDrag(e, layer, "rotate", rect.centerX, rect.centerY)
                  }
                  aria-label="Rotate layer"
                >
                  <RotateCw className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        );
      })}

      {selectedLayer && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-[10px] text-white/80">
          Drag to move · round handle to spin · arrow keys to nudge
        </div>
      )}
    </div>
  );
}
