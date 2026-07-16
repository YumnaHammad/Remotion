"use client";

import { ANIMATION_PRESETS, TRANSITION_TYPES } from "@/lib/constants";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayersPanel } from "./layers-panel";
import {
  DEFAULT_FILTERS,
  type AnimationPreset,
  type LayerFilters,
  type TransitionType,
} from "@/types";

const FILTER_CONFIG: {
  key: keyof LayerFilters;
  label: string;
  min: number;
  max: number;
  unit: string;
}[] = [
  { key: "brightness", label: "Brightness", min: 0, max: 200, unit: "%" },
  { key: "contrast", label: "Contrast", min: 0, max: 200, unit: "%" },
  { key: "saturate", label: "Saturation", min: 0, max: 300, unit: "%" },
  { key: "hueRotate", label: "Hue", min: 0, max: 360, unit: "°" },
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, unit: "%" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, unit: "%" },
];

export function RightPanel() {
  const project = useEditorStore((s) => s.project);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const setLayerAnimation = useEditorStore((s) => s.setLayerAnimation);
  const setSceneTransition = useEditorStore((s) => s.setSceneTransition);

  const layer = project.layers.find((l) => l.id === selectedLayerIds[0]);
  const scene = project.scenes[0];

  return (
    <div className="flex h-full w-72 flex-col border-l border-[var(--editor-border)] bg-[var(--editor-panel)]">
      <LayersPanel />

      <Tabs defaultValue="properties" className="flex flex-1 flex-col">
        <TabsList className="mx-3 mt-2 grid h-8 grid-cols-4 bg-white/5">
          <TabsTrigger value="properties" className="text-[10px]">
            Props
          </TabsTrigger>
          <TabsTrigger value="animation" className="text-[10px]">
            Anim
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-[10px]">
            FX
          </TabsTrigger>
          <TabsTrigger value="timing" className="text-[10px]">
            Time
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {!layer ? (
            <p className="p-6 text-center text-xs text-white/40">
              Select a layer to edit properties
            </p>
          ) : (
            <>
              <TabsContent value="properties" className="space-y-4 px-3 pb-4">
                <div className="space-y-1.5">
                  <Label className="text-white/60">Name</Label>
                  <Input
                    value={layer.name}
                    onChange={(e) =>
                      updateLayer(layer.id, { name: e.target.value })
                    }
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>

                {layer.type === "text" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-white/60">Text</Label>
                      <Input
                        value={layer.text ?? ""}
                        onChange={(e) =>
                          updateLayer(layer.id, { text: e.target.value })
                        }
                        className="border-white/10 bg-white/5 text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/60">
                        Font size · {layer.textStyle?.fontSize ?? 48}
                      </Label>
                      <Slider
                        value={[layer.textStyle?.fontSize ?? 48]}
                        min={12}
                        max={160}
                        step={1}
                        onValueChange={([fontSize]) =>
                          updateLayer(layer.id, {
                            textStyle: { ...layer.textStyle!, fontSize },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/60">Color</Label>
                      <Input
                        type="color"
                        value={layer.textStyle?.color ?? "#ffffff"}
                        onChange={(e) =>
                          updateLayer(layer.id, {
                            textStyle: {
                              ...layer.textStyle!,
                              color: e.target.value,
                            },
                          })
                        }
                        className="h-9 border-white/10 bg-white/5 p-1"
                      />
                    </div>
                  </>
                )}

                {(layer.type === "video" ||
                  layer.type === "audio" ||
                  layer.type === "image" ||
                  layer.type === "gif") && (
                  <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Media
                    </p>
                    {(layer.type === "video" ||
                      layer.type === "image" ||
                      layer.type === "gif") && (
                      <div className="space-y-1.5">
                        <Label className="text-white/60">Fit</Label>
                        <Select
                          value={layer.objectFit ?? "cover"}
                          onValueChange={(v) =>
                            updateLayer(layer.id, {
                              objectFit: v as "cover" | "contain" | "fill",
                            })
                          }
                        >
                          <SelectTrigger className="border-white/10 bg-white/5 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["cover", "contain", "fill"].map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {(layer.type === "video" ||
                      layer.type === "audio" ||
                      layer.type === "gif") && (
                      <div className="space-y-1.5">
                        <Label className="text-white/60">
                          Speed · {(layer.playbackRate ?? 1).toFixed(2)}x
                        </Label>
                        <Slider
                          value={[layer.playbackRate ?? 1]}
                          min={0.25}
                          max={3}
                          step={0.05}
                          onValueChange={([playbackRate]) =>
                            updateLayer(layer.id, { playbackRate })
                          }
                        />
                      </div>
                    )}
                    {(layer.type === "video" || layer.type === "audio") && (
                      <div className="space-y-1.5">
                        <Label className="text-white/60">
                          Volume · {Math.round((layer.volume ?? 1) * 100)}%
                        </Label>
                        <Slider
                          value={[layer.volume ?? 1]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={([volume]) =>
                            updateLayer(layer.id, { volume })
                          }
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Label className="text-white/60">Loop</Label>
                      <Switch
                        checked={!!layer.loop}
                        onCheckedChange={(loop) =>
                          updateLayer(layer.id, { loop })
                        }
                      />
                    </div>
                    {layer.type === "video" && (
                      <>
                        <div className="flex items-center justify-between">
                          <Label className="text-white/60">Freeze frame</Label>
                          <Switch
                            checked={typeof layer.freezeFrame === "number"}
                            onCheckedChange={(on) =>
                              updateLayer(layer.id, {
                                freezeFrame: on ? 0 : null,
                              })
                            }
                          />
                        </div>
                        {typeof layer.freezeFrame === "number" && (
                          <div className="space-y-1.5">
                            <Label className="text-white/60">
                              Freeze at · {layer.freezeFrame}f
                            </Label>
                            <Slider
                              value={[layer.freezeFrame]}
                              min={0}
                              max={layer.durationInFrames}
                              step={1}
                              onValueChange={([freezeFrame]) =>
                                updateLayer(layer.id, { freezeFrame })
                              }
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <Label className="text-white/60">Offthread</Label>
                          <Switch
                            checked={layer.useOffthread !== false}
                            onCheckedChange={(useOffthread) =>
                              updateLayer(layer.id, { useOffthread })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-white/60">
                    Opacity · {Math.round(layer.transform.opacity * 100)}%
                  </Label>
                  <Slider
                    value={[layer.transform.opacity]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([opacity]) =>
                      updateLayer(layer.id, {
                        transform: { ...layer.transform, opacity },
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/60">
                    Scale · {layer.transform.scale.toFixed(2)}
                  </Label>
                  <Slider
                    value={[layer.transform.scale]}
                    min={0.1}
                    max={3}
                    step={0.01}
                    onValueChange={([scale]) =>
                      updateLayer(layer.id, {
                        transform: { ...layer.transform, scale },
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/60">
                    Rotation · {layer.transform.rotation}°
                  </Label>
                  <Slider
                    value={[layer.transform.rotation]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={([rotation]) =>
                      updateLayer(layer.id, {
                        transform: { ...layer.transform, rotation },
                      })
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="animation" className="space-y-4 px-3 pb-4">
                <div className="space-y-1.5">
                  <Label className="text-white/60">Preset</Label>
                  <Select
                    value={layer.animation}
                    onValueChange={(v) =>
                      setLayerAnimation(layer.id, v as AnimationPreset)
                    }
                  >
                    <SelectTrigger className="border-white/10 bg-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANIMATION_PRESETS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60">
                    Duration · {layer.animationDuration}f
                  </Label>
                  <Slider
                    value={[layer.animationDuration]}
                    min={5}
                    max={90}
                    step={1}
                    onValueChange={([animationDuration]) =>
                      updateLayer(layer.id, { animationDuration })
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="effects" className="space-y-4 px-3 pb-4">
                <div className="space-y-1.5">
                  <Label className="text-white/60">
                    Blur · {layer.transform.blur}px
                  </Label>
                  <Slider
                    value={[layer.transform.blur]}
                    min={0}
                    max={40}
                    step={1}
                    onValueChange={([blur]) =>
                      updateLayer(layer.id, {
                        transform: { ...layer.transform, blur },
                      })
                    }
                  />
                </div>

                <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                    Color filters
                  </p>
                  {FILTER_CONFIG.map((f) => {
                    const filters = layer.filters ?? DEFAULT_FILTERS;
                    return (
                      <div key={f.key} className="space-y-1.5">
                        <Label className="text-white/60">
                          {f.label} · {filters[f.key]}
                          {f.unit}
                        </Label>
                        <Slider
                          value={[filters[f.key]]}
                          min={f.min}
                          max={f.max}
                          step={1}
                          onValueChange={([v]) =>
                            updateLayer(layer.id, {
                              filters: { ...filters, [f.key]: v },
                            })
                          }
                        />
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="text-[11px] text-primary hover:underline"
                    onClick={() =>
                      updateLayer(layer.id, { filters: { ...DEFAULT_FILTERS } })
                    }
                  >
                    Reset filters
                  </button>
                </div>

                {(layer.type === "video" || layer.type === "image") && (
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                    <div>
                      <Label className="text-white/70">Motion blur</Label>
                      <p className="text-[10px] text-white/40">
                        @remotion/motion-blur
                      </p>
                    </div>
                    <Switch
                      checked={!!layer.motionBlur}
                      onCheckedChange={(motionBlur) =>
                        updateLayer(layer.id, { motionBlur })
                      }
                    />
                  </div>
                )}

                {scene && (
                  <div className="space-y-1.5">
                    <Label className="text-white/60">Scene transition</Label>
                    <Select
                      value={scene.transition}
                      onValueChange={(v) =>
                        setSceneTransition(scene.id, v as TransitionType)
                      }
                    >
                      <SelectTrigger className="border-white/10 bg-white/5 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSITION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="timing" className="space-y-4 px-3 pb-4">
                <div className="space-y-1.5">
                  <Label className="text-white/60">Start frame</Label>
                  <Input
                    type="number"
                    value={layer.startFrame}
                    onChange={(e) =>
                      updateLayer(layer.id, {
                        startFrame: Number(e.target.value),
                      })
                    }
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60">Duration (frames)</Label>
                  <Input
                    type="number"
                    value={layer.durationInFrames}
                    onChange={(e) =>
                      updateLayer(layer.id, {
                        durationInFrames: Number(e.target.value),
                      })
                    }
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
              </TabsContent>
            </>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
