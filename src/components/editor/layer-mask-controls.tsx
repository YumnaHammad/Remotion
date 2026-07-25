"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_MASK, type MaskShape } from "@/types/editing-tools";
import type { Layer } from "@/types";

/** Dedicated masking controls — used in Tools + FX so it's always findable. */
export function LayerMaskControls({
  layer,
  onUpdate,
}: {
  layer: Layer;
  onUpdate: (id: string, patch: Partial<Layer>) => void;
}) {
  const mask = layer.mask ?? DEFAULT_MASK;

  return (
    <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/90">
          Masking
        </p>
        <p className="text-[10px] text-white/40">
          Clip this layer to a shape. Works on images, video, shapes, stickers.
        </p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-white/60">Mask shape</Label>
        <Select
          value={mask.shape}
          onValueChange={(shape) =>
            onUpdate(layer.id, {
              mask: { ...mask, shape: shape as MaskShape },
            })
          }
        >
          <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(
              [
                "none",
                "circle",
                "rect",
                "rounded",
                "gradient-v",
                "gradient-h",
              ] as const
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {s === "none"
                  ? "No mask"
                  : s === "gradient-v"
                    ? "Fade vertical"
                    : s === "gradient-h"
                      ? "Fade horizontal"
                      : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mask.shape !== "none" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs text-white/60">
              Feather · {mask.feather}
            </Label>
            <Slider
              value={[mask.feather]}
              min={0}
              max={100}
              step={1}
              onValueChange={([feather]) =>
                onUpdate(layer.id, { mask: { ...mask, feather } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/60">Invert mask</Label>
            <Switch
              checked={!!mask.invert}
              onCheckedChange={(invert) =>
                onUpdate(layer.id, { mask: { ...mask, invert } })
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
