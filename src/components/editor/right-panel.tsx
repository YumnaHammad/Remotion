"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpToLine, Mic } from "lucide-react";
import { toast } from "sonner";
import { ANIMATION_PRESETS, TRANSITION_TYPES } from "@/lib/constants";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayersPanel } from "./layers-panel";
import { LayerMaskControls } from "./layer-mask-controls";
import { CaptionListEditor } from "./caption-list-editor";
import { EditingToolsPanel } from "@/features/editor-tools/editing-tools-panel";
import {
  captionsDurationInFrames,
  transcribeFromFile,
  transcribeFromSourceUrl,
} from "@/lib/transcribe-client";
import {
  DEFAULT_FILTERS,
  type AnimationPreset,
  type Layer,
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
  const selectLayers = useEditorStore((s) => s.selectLayers);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const addLayer = useEditorStore((s) => s.addLayer);
  const sendLayerToBack = useEditorStore((s) => s.sendLayerToBack);
  const bringLayerToFront = useEditorStore((s) => s.bringLayerToFront);
  const setLayerAnimation = useEditorStore((s) => s.setLayerAnimation);
  const setSceneTransition = useEditorStore((s) => s.setSceneTransition);
  const speakCaptionsOnPlay = useEditorStore((s) => s.speakCaptionsOnPlay);
  const setSpeakCaptionsOnPlay = useEditorStore((s) => s.setSpeakCaptionsOnPlay);
  const [transcribing, setTranscribing] = useState(false);
  const [tab, setTab] = useState("properties");

  const currentFrame = useEditorStore((s) => s.currentFrame);

  const layer = project.layers.find((l) => l.id === selectedLayerIds[0]);
  const scene =
    project.scenes.find(
      (sc) =>
        currentFrame >= sc.startFrame &&
        currentFrame < sc.startFrame + sc.durationInFrames
    ) ?? project.scenes[0];

  const selectHint = (
    <div className="space-y-3 p-4">
      <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-3 text-center">
        <p className="text-sm font-medium text-white/80">Nothing selected</p>
        <p className="mt-1 text-[11px] leading-relaxed text-white/45">
          Click a piece above (or on the timeline) to change its text, size,
          color, or timing.
        </p>
      </div>
      {project.layers.length > 0 && (
        <>
          <p className="text-center text-[10px] uppercase tracking-wide text-white/35">
            Quick pick
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {project.layers.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  selectLayers([l.id]);
                  setTab("properties");
                }}
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] text-white/80 hover:bg-primary/20 hover:text-white"
              >
                {l.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const resolveMediaSrc = (): string | null => {
    if (!layer) return null;
    if (
      (layer.type === "audio" || layer.type === "video") &&
      layer.src
    ) {
      return layer.src;
    }
    if (layer.type === "caption") {
      const media = project.layers.find(
        (l) => (l.type === "audio" || l.type === "video") && l.src
      );
      return media?.src ?? null;
    }
    return null;
  };

  const transcribeIntoLayer = async () => {
    if (!layer) return;
    const src = resolveMediaSrc();
    if (!src) {
      toast.error("No audio/video source found to transcribe");
      return;
    }
    setTranscribing(true);
    const toastId = toast.loading("Transcribing audio…");
    try {
      // Blob URLs only exist in this browser session; the server can't fetch
      // them, so re-read the blob here and upload the bytes instead.
      const result = src.startsWith("blob:")
        ? await transcribeFromFile(
            new File([await (await fetch(src)).blob()], "clip")
          )
        : await transcribeFromSourceUrl(src);
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      const durationInFrames = captionsDurationInFrames(
        result.captions,
        project.settings.fps
      );
      if (layer.type === "caption") {
        updateLayer(layer.id, {
          captions: result.captions,
          durationInFrames,
        });
      } else {
        const captionLayer = project.layers.find((l) => l.type === "caption");
        if (captionLayer) {
          updateLayer(captionLayer.id, {
            captions: result.captions,
            durationInFrames,
            startFrame: layer.startFrame,
          });
        } else {
          addLayer({
            id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            type: "caption",
            name: "Whisper Captions",
            trackId: "t-tx1",
            startFrame: layer.startFrame,
            durationInFrames,
            captions: result.captions,
            transform: {
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              blur: 0,
            },
            animation: "none",
            animationDuration: 15,
            filters: { ...DEFAULT_FILTERS },
          });
        }
      }
      toast.success(
        `Done — ${result.captions.length} words turned into captions`,
        { id: toastId }
      );
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-72 flex-col border-l border-[var(--editor-border)] bg-[var(--editor-panel)]">
      <LayersPanel />

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-3 mt-2 grid h-8 shrink-0 grid-cols-5 bg-white/5">
          <TabsTrigger value="properties" className="text-[10px]" title="Change text, color, position">
            Edit
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-[10px]" title="Crop, mask, enhance">
            Fix
          </TabsTrigger>
          <TabsTrigger value="animation" className="text-[10px]" title="How it appears">
            Motion
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-[10px]" title="Filters and look">
            Look
          </TabsTrigger>
          <TabsTrigger value="timing" className="text-[10px]" title="When it starts and ends">
            Timing
          </TabsTrigger>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
          {!layer ? (
            selectHint
          ) : (
            <>
              <p className="mx-3 mb-2 mt-2 text-[10px] text-white/35">
                Editing: <span className="text-white/70">{layer.name}</span>
              </p>

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

                {layer.type === "shape" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-white/60">Shape kind</Label>
                      <Select
                        value={layer.shape ?? "rect"}
                        onValueChange={(shape) =>
                          updateLayer(layer.id, {
                            shape: shape as Layer["shape"],
                          })
                        }
                      >
                        <SelectTrigger className="border-white/10 bg-white/5 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "rect",
                            "circle",
                            "ellipse",
                            "triangle",
                            "star",
                            "polygon",
                            "heart",
                            "pie",
                            "arrow",
                          ].map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/60">Fill</Label>
                      <Input
                        type="color"
                        value={layer.fill ?? "#6366f1"}
                        onChange={(e) =>
                          updateLayer(layer.id, { fill: e.target.value })
                        }
                        className="h-9 border-white/10 bg-white/5 p-1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/60">Stroke</Label>
                      <Input
                        type="color"
                        value={layer.stroke ?? "#ffffff"}
                        onChange={(e) =>
                          updateLayer(layer.id, { stroke: e.target.value })
                        }
                        className="h-9 border-white/10 bg-white/5 p-1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/60">
                        Stroke width · {layer.strokeWidth ?? 0}
                      </Label>
                      <Slider
                        value={[layer.strokeWidth ?? 0]}
                        min={0}
                        max={24}
                        step={1}
                        onValueChange={([strokeWidth]) =>
                          updateLayer(layer.id, { strokeWidth })
                        }
                      />
                    </div>
                  </>
                )}

                {layer.type === "collage" && (
                  <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      Collage cells
                    </p>
                    <p className="text-[10px] text-white/40">
                      Layout: {layer.collageLayout ?? "grid-2x2"} ·{" "}
                      {layer.collageSources?.length ?? layer.collageCells ?? 0}{" "}
                      cells
                    </p>
                    {(layer.collageSources ?? []).map((cell, i) => (
                      <div key={i} className="space-y-1">
                        <Label className="text-[10px] text-white/50">
                          Cell {i + 1}
                        </Label>
                        <Input
                          value={cell.src}
                          onChange={(e) => {
                            const collageSources = [
                              ...(layer.collageSources ?? []),
                            ];
                            collageSources[i] = {
                              ...collageSources[i],
                              src: e.target.value,
                            };
                            updateLayer(layer.id, { collageSources });
                          }}
                          className="h-8 border-white/10 bg-white/5 text-[11px] text-white"
                          placeholder="Image URL"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {layer.type === "solid" && (
                  <div className="space-y-1.5">
                    <Label className="text-white/60">Background color</Label>
                    <Input
                      type="color"
                      value={layer.fill ?? "#0b84f3"}
                      onChange={(e) =>
                        updateLayer(layer.id, { fill: e.target.value })
                      }
                      className="h-9 border-white/10 bg-white/5 p-1"
                    />
                  </div>
                )}

                {layer.type === "caption" && (
                  <CaptionListEditor
                    layer={layer}
                    fps={project.settings.fps}
                    speakOnPlay={speakCaptionsOnPlay}
                    onSpeakOnPlayChange={setSpeakCaptionsOnPlay}
                    onUpdateLayer={updateLayer}
                    onAddVoiceLayer={({ src, name, startFrame, durationInFrames }) => {
                      addLayer({
                        id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                        type: "audio",
                        name,
                        trackId: "t-a1",
                        startFrame,
                        durationInFrames,
                        src,
                        volume: 1,
                        playbackRate: 1,
                        transform: {
                          x: 0,
                          y: 0,
                          scale: 1,
                          rotation: 0,
                          opacity: 1,
                          blur: 0,
                        },
                        animation: "none",
                        animationDuration: 0,
                        filters: { ...DEFAULT_FILTERS },
                      });
                    }}
                  />
                )}

                {(layer.type === "caption" ||
                  layer.type === "audio" ||
                  layer.type === "video") && (
                  <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      From a recording
                    </p>
                    {layer.type === "caption" && (
                      <p className="text-[10px] text-white/40">
                        Or fill these words automatically from a video/music clip.
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={transcribing}
                      className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => void transcribeIntoLayer()}
                    >
                      <Mic className="mr-2 h-3.5 w-3.5 text-amber-400" />
                      {transcribing ? "Listening…" : "Turn speech into captions"}
                    </Button>
                  </div>
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

                {["text", "caption", "image", "video", "gif", "sticker", "shape", "collage"].includes(
                  layer.type
                ) && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-white/60">
                          X · {Math.round(layer.transform.x)}px
                        </Label>
                        <Slider
                          value={[layer.transform.x]}
                          min={-960}
                          max={960}
                          step={1}
                          onValueChange={([x]) =>
                            updateLayer(layer.id, {
                              transform: { ...layer.transform, x },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-white/60">
                          Y · {Math.round(layer.transform.y)}px
                        </Label>
                        <Slider
                          value={[layer.transform.y]}
                          min={-540}
                          max={540}
                          step={1}
                          onValueChange={([y]) =>
                            updateLayer(layer.id, {
                              transform: { ...layer.transform, y },
                            })
                          }
                        />
                      </div>
                    </div>
                  </>
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

              <TabsContent value="tools" className="space-y-3 px-2 pb-4">
                <LayerMaskControls layer={layer} onUpdate={updateLayer} />
                <EditingToolsPanel
                  layer={layer}
                  onUpdateLayer={updateLayer}
                />
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
                <LayerMaskControls layer={layer} onUpdate={updateLayer} />

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
                  <Label className="text-white/60">When it starts</Label>
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
                  <Label className="text-white/60">How long it lasts</Label>
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
        </div>
      </Tabs>
    </div>
  );
}
