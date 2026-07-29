"use client";

import {
  Film,
  Mic,
  Scissors,
  Sparkles,
  Volume2,
  Wand2,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/shared/file-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BLEND_MODES,
  EFFECT_PRESETS,
  VOICE_EFFECT_PRESETS,
} from "@/data/creative-library";
import {
  DEFAULT_AUDIO_TOOLS,
  DEFAULT_ENHANCE,
  DEFAULT_MASK,
  DEFAULT_STABILIZE,
  DEFAULT_VOICE_EFFECTS,
  type BlendMode,
  type MaskShape,
  type SceneEditingTools,
} from "@/types/editing-tools";
import type { Layer, LayerFilters } from "@/types";
import { DEFAULT_FILTERS } from "@/types";
import { analyzeSilenceRegions, voicePresetToPlayback } from "@/lib/media-tools";
import { useAssetStore } from "@/stores/asset-store";
import { MOCK_MEDIA } from "@/data/mock";
import { toast } from "sonner";

interface EditingToolsPanelProps {
  layer?: Layer | null;
  onUpdateLayer?: (id: string, patch: Partial<Layer>) => void;
  sceneMode?: boolean;
  sceneEditing?: SceneEditingTools;
  onSceneEditingChange?: (patch: SceneEditingTools) => void;
}

export function EditingToolsPanel({
  layer,
  onUpdateLayer,
  sceneMode = false,
  sceneEditing,
  onSceneEditingChange,
}: EditingToolsPanelProps) {
  const isAudio = layer?.type === "audio";
  const isVideo =
    layer?.type === "video" ||
    layer?.type === "image" ||
    layer?.type === "gif" ||
    layer?.type === "collage" ||
    layer?.type === "shape" ||
    layer?.type === "sticker";

  const patch = (p: Partial<Layer>) => {
    if (layer && onUpdateLayer) onUpdateLayer(layer.id, p);
  };

  const patchScene = (p: SceneEditingTools) => {
    onSceneEditingChange?.({ ...sceneEditing, ...p });
  };

  const audioTools = layer?.audioTools ?? DEFAULT_AUDIO_TOOLS;
  const enhance = layer?.enhance ?? sceneEditing?.enhance ?? DEFAULT_ENHANCE;
  const mask = layer?.mask ?? DEFAULT_MASK;
  const voice = layer?.voiceEffects ?? DEFAULT_VOICE_EFFECTS;
  const stabilize = layer?.stabilize ?? DEFAULT_STABILIZE;
  const bg = layer?.backgroundReplace ?? sceneEditing?.backgroundReplace;
  const uploadedAssets = useAssetStore((s) => s.assets);
  const imageAssets = [
    ...uploadedAssets.filter((a) => a.type === "image"),
    ...MOCK_MEDIA.filter((a) => a.type === "image"),
  ];

  const runSilenceCut = async () => {
    if (!layer?.src) {
      toast.error("No audio source on this layer");
      return;
    }
    toast.info("Analyzing silence…");
    const result = await analyzeSilenceRegions(
      layer.src,
      audioTools.silenceThresholdDb,
      audioTools.minSilenceMs
    );
    if (result.silentRegions === 0) {
      toast.message("No long silent regions detected");
      return;
    }
    patch({
      audioTools: { ...audioTools, silenceCut: true },
      name: `${layer.name} (silence trimmed)`,
    });
    toast.success(
      `Marked ${result.silentRegions} silent region(s) for cut on export`
    );
  };

  const applyEffectPreset = (presetId: string) => {
    const preset = EFFECT_PRESETS.find((e) => e.id === presetId);
    if (!preset || !layer) return;
    const filters: LayerFilters = {
      ...(layer.filters ?? DEFAULT_FILTERS),
      brightness: preset.filters.brightness ?? DEFAULT_FILTERS.brightness,
      contrast: preset.filters.contrast ?? DEFAULT_FILTERS.contrast,
      saturate: preset.filters.saturate ?? DEFAULT_FILTERS.saturate,
      hueRotate: preset.filters.hueRotate ?? DEFAULT_FILTERS.hueRotate,
      grayscale: preset.filters.grayscale ?? DEFAULT_FILTERS.grayscale,
      sepia: preset.filters.sepia ?? DEFAULT_FILTERS.sepia,
    };
    patch({
      filters,
      transform: {
        ...layer.transform,
        blur: preset.filters.blur ?? layer.transform.blur,
      },
    });
    toast.success(`Applied ${preset.name} effect`);
  };

  if (!sceneMode && !layer) {
    return (
      <p className="p-4 text-center text-xs text-muted-foreground">
        Select a layer to use editing tools
      </p>
    );
  }

  return (
    <div className="space-y-4 px-1 pb-4">
      {/* 1. Primary Settings Card */}
      <div className="space-y-3 rounded-xl border border-white/5 bg-black/10 p-3 shadow-sm">
        {(sceneMode || isAudio) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
              <Mic className="h-3.5 w-3.5" /> Speech & Voice
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/60">Voice effect</Label>
              <Select
                value={voice.preset}
                onValueChange={(preset) => {
                  const playback = voicePresetToPlayback(preset);
                  if (sceneMode) {
                    patchScene({
                      voiceEffects: {
                        ...voice,
                        preset: preset as typeof voice.preset,
                      },
                    });
                  } else {
                    patch({
                      voiceEffects: {
                        ...voice,
                        preset: preset as typeof voice.preset,
                      },
                      playbackRate: playback.playbackRate,
                      volume: playback.volume,
                    });
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_EFFECT_PRESETS.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {(sceneMode || isVideo) && (
          <div className="space-y-3 pt-3.5 border-t border-white/5 mt-3.5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
              <Film className="h-3.5 w-3.5" /> Background & Pace
            </div>

            {sceneMode && (
              <div className="space-y-1">
                <Label className="text-xs text-white/60">
                  Scene speed · {(sceneEditing?.speed ?? 1).toFixed(2)}×
                </Label>
                <Slider
                  value={[sceneEditing?.speed ?? 1]}
                  min={0.5}
                  max={2}
                  step={0.05}
                  onValueChange={([speed]) => patchScene({ speed })}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs text-white/60">Background style</Label>
              <Select
                value={bg?.mode ?? "none"}
                onValueChange={(mode) => {
                  const next = {
                    mode: mode as any,
                    color: bg?.color ?? "#00ff00",
                    blurAmount: bg?.blurAmount ?? 16,
                    imageUrl: bg?.imageUrl,
                    chromaColor: bg?.chromaColor ?? "#00ff00",
                  };
                  sceneMode
                    ? patchScene({ backgroundReplace: next })
                    : patch({ backgroundReplace: next });
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["none", "solid", "blur", "chroma", "image"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m === "image" ? "background image" : m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(bg?.mode === "solid" || bg?.mode === "chroma") && (
              <div className="space-y-1">
                <Label className="text-xs text-white/60">Background color</Label>
                <Input
                  type="color"
                  value={bg.color ?? bg.chromaColor ?? "#00ff00"}
                  onChange={(e) => {
                    const next = {
                      ...bg,
                      mode: bg.mode,
                      color: e.target.value,
                      chromaColor: e.target.value,
                    };
                    sceneMode
                      ? patchScene({ backgroundReplace: next })
                      : patch({ backgroundReplace: next });
                  }}
                  className="h-8 border-white/10 bg-white/5 p-1"
                />
              </div>
            )}

            {bg?.mode === "blur" && (
              <div className="space-y-1">
                <Label className="text-xs text-white/60">
                  Blur amount · {bg.blurAmount ?? 16}px
                </Label>
                <Slider
                  value={[bg.blurAmount ?? 16]}
                  min={2}
                  max={40}
                  step={1}
                  onValueChange={([blurAmount]) => {
                    const next = { ...bg, mode: "blur" as const, blurAmount };
                    sceneMode
                      ? patchScene({ backgroundReplace: next })
                      : patch({ backgroundReplace: next });
                  }}
                />
              </div>
            )}

            {bg?.mode === "image" && (
              <FileUploader
                label="Background Image"
                value={bg.imageUrl ?? ""}
                onChange={(imageUrl) => {
                  const next = {
                    mode: "image" as const,
                    imageUrl,
                    color: bg.color,
                    blurAmount: bg.blurAmount,
                  };
                  sceneMode
                    ? patchScene({ backgroundReplace: next })
                    : patch({ backgroundReplace: next });
                }}
                placeholderUrl="Paste background image URL..."
              />
            )}
          </div>
        )}
      </div>

      {/* 2. Advanced VFX & Collapsible Filters */}
      <details className="group border border-white/5 rounded-xl bg-black/20 overflow-hidden">
        <summary className="flex cursor-pointer items-center justify-between px-3 py-2.5 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white transition select-none">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Advanced VFX & Filters
          </span>
          <ChevronDown className="h-4 w-4 transition duration-200 group-open:rotate-180" />
        </summary>
        <div className="border-t border-white/5 p-3.5 space-y-4">
          {/* Audio filters (silence cut, denoise, normalize) */}
          {!sceneMode && isAudio && (
            <div className="space-y-3.5 border-b border-white/5 pb-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Audio FX</div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-white/60">Silence cut</Label>
                <Switch
                  checked={audioTools.silenceCut}
                  onCheckedChange={(silenceCut) =>
                    patch({ audioTools: { ...audioTools, silenceCut } })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-white/60">
                  Threshold · {audioTools.silenceThresholdDb} dB
                </Label>
                <Slider
                  value={[audioTools.silenceThresholdDb]}
                  min={-60}
                  max={-20}
                  step={1}
                  onValueChange={([silenceThresholdDb]) =>
                    patch({ audioTools: { ...audioTools, silenceThresholdDb } })
                  }
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={runSilenceCut}
              >
                <Scissors className="mr-1.5 h-3.5 w-3.5 text-sky-400" /> Detect & cut silence
              </Button>
              <div className="space-y-1">
                <Label className="text-xs text-white/60">
                  Denoise · {audioTools.denoise}%
                </Label>
                <Slider
                  value={[audioTools.denoise]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([denoise]) =>
                    patch({
                      audioTools: { ...audioTools, denoise },
                      enhance: { ...enhance, denoise },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-white/60">Normalize volume</Label>
                <Switch
                  checked={audioTools.normalize}
                  onCheckedChange={(normalize) =>
                    patch({ audioTools: { ...audioTools, normalize } })
                  }
                />
              </div>
            </div>
          )}

          {/* Video FX (reverse, playbackRate, mask, stabilize) */}
          {(sceneMode || isVideo) && (
            <div className="space-y-3.5 border-b border-white/5 pb-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Video FX</div>
              {!sceneMode && isVideo && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-white/60">Reverse playback</Label>
                    <Switch
                      checked={!!layer?.reverse}
                      onCheckedChange={(reverse) => patch({ reverse })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">
                      Speed · {(layer?.playbackRate ?? 1).toFixed(2)}×
                    </Label>
                    <Slider
                      value={[layer?.playbackRate ?? 1]}
                      min={0.25}
                      max={4}
                      step={0.05}
                      onValueChange={([playbackRate]) => patch({ playbackRate })}
                    />
                  </div>
                </>
              )}

              {!sceneMode && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">Mask shape</Label>
                    <Select
                      value={mask.shape}
                      onValueChange={(shape) =>
                        patch({ mask: { ...mask, shape: shape as MaskShape } })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white">
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
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {mask.shape !== "none" && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-white/60">
                          Mask feather · {mask.feather}
                        </Label>
                        <Slider
                          value={[mask.feather]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={([feather]) =>
                            patch({ mask: { ...mask, feather } })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-white/60">Invert mask</Label>
                        <Switch
                          checked={!!mask.invert}
                          onCheckedChange={(invert) =>
                            patch({ mask: { ...mask, invert } })
                          }
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-white/60">Stabilize</Label>
                    <Switch
                      checked={!!stabilize.enabled}
                      onCheckedChange={(enabled) =>
                        patch({ stabilize: { ...stabilize, enabled } })
                      }
                    />
                  </div>
                  {stabilize.enabled && (
                    <div className="space-y-1">
                      <Label className="text-xs text-white/60">
                        Stabilize strength · {stabilize.strength}
                      </Label>
                      <Slider
                        value={[stabilize.strength]}
                        min={5}
                        max={100}
                        step={1}
                        onValueChange={([strength]) =>
                          patch({
                            stabilize: { ...stabilize, strength, enabled: true },
                          })
                        }
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-xs text-white/60">Color overlay</Label>
                <Switch
                  checked={
                    layer?.overlay?.enabled ??
                    sceneEditing?.overlay?.enabled ??
                    false
                  }
                  onCheckedChange={(enabled) => {
                    const overlay = { enabled, opacity: 0.35, color: "#6366f1" };
                    sceneMode ? patchScene({ overlay }) : patch({ overlay });
                  }}
                />
              </div>
            </div>
          )}

          {/* Creative controls (blendMode, enhance, volume) */}
          <div className="space-y-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Creative Filters</div>
            <div className="space-y-1">
              <Label className="text-xs text-white/60">Blend / transition mode</Label>
              <Select
                value={layer?.blendMode ?? sceneEditing?.blendMode ?? "normal"}
                onValueChange={(blendMode) => {
                  sceneMode
                    ? patchScene({ blendMode: blendMode as BlendMode })
                    : patch({ blendMode: blendMode as BlendMode });
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLEND_MODES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!sceneMode && layer && (
              <div className="grid grid-cols-2 gap-1.5">
                {EFFECT_PRESETS.slice(0, 6).map((fx) => (
                  <Button
                    key={fx.id}
                    size="sm"
                    variant="outline"
                    className="h-auto py-1.5 text-[10px] border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => applyEffectPreset(fx.id)}
                  >
                    <Wand2 className="mr-1 h-3 w-3 text-sky-400" />
                    {fx.name}
                  </Button>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs text-white/60">
                <Zap className="h-3 w-3 text-amber-400" /> Enhance Sliders
              </Label>
              {(
                [
                  ["sharpen", "Sharpen", 0, 100],
                  ["vibrance", "Vibrance", 50, 200],
                  ["clarity", "Clarity", 0, 100],
                  ["denoise", "Denoise", 0, 100],
                ] as const
              ).map(([key, label, min, max]) => (
                <div key={key} className="space-y-0.5">
                  <Label className="text-[10px] text-white/40">
                    {label} · {enhance[key]}
                  </Label>
                  <Slider
                    value={[enhance[key]]}
                    min={min}
                    max={max}
                    step={1}
                    onValueChange={([v]) => {
                      const next = { ...enhance, [key]: v };
                      sceneMode
                        ? patchScene({ enhance: next })
                        : patch({ enhance: next });
                    }}
                  />
                </div>
              ))}
            </div>

            {!sceneMode && layer && (
              <div className="space-y-1 border-t border-white/5 pt-3.5 mt-3.5">
                <Label className="flex items-center gap-1 text-xs text-white/60">
                  <Volume2 className="h-3 w-3 text-sky-400" /> Volume ·{" "}
                  {Math.round((layer.volume ?? 1) * 100)}%
                </Label>
                <Slider
                  value={[layer.volume ?? 1]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([volume]) => patch({ volume })}
                />
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}
