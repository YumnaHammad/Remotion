"use client";

import { useRef } from "react";
import {
  Captions,
  Film,
  Folder,
  Images,
  LayoutTemplate,
  Mic,
  Music,
  Shapes,
  Sparkles,
  Sticker,
  Type,
  Upload,
  Video,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EDITOR_TABS } from "@/lib/constants";
import { useEditorStore } from "@/stores/editor-store";
import { useAssetStore, assetFromFile } from "@/stores/asset-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  MOCK_MEDIA,
  MOCK_TEMPLATES,
  GRADIENTS,
  SAMPLE_GIF,
  SAMPLE_IMAGE,
  SAMPLE_VIDEO,
  SAMPLE_AUDIO,
} from "@/data/mock";
import { DEFAULT_FILTERS, type Layer, type ShapeKind } from "@/types";
import { ScenesPanel } from "./scenes-panel";
import { AudioMixer } from "./audio-mixer";
import { toast } from "sonner";

const TAB_ICONS = {
  assets: Folder,
  templates: LayoutTemplate,
  scenes: Film,
  text: Type,
  shapes: Shapes,
  audio: Music,
  video: Video,
  stickers: Sticker,
  brand: Sparkles,
} as const;

function makeLayer(
  partial: Partial<Layer> & Pick<Layer, "type" | "name">
): Layer {
  return {
    id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    trackId: "t-tx1",
    startFrame: 0,
    durationInFrames: 60,
    transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 },
    animation: "none",
    animationDuration: 15,
    filters: { ...DEFAULT_FILTERS },
    ...partial,
  };
}

const SHAPES: ShapeKind[] = [
  "rect",
  "circle",
  "ellipse",
  "triangle",
  "star",
  "polygon",
  "heart",
  "pie",
  "arrow",
];

export function LeftPanel() {
  const leftTab = useEditorStore((s) => s.leftTab);
  const setLeftTab = useEditorStore((s) => s.setLeftTab);
  const addLayer = useEditorStore((s) => s.addLayer);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const uploadedAssets = useAssetStore((s) => s.assets);
  const addAsset = useAssetStore((s) => s.addAsset);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const add = (layer: Layer) => {
    addLayer(layer);
    toast.success(`${layer.name} added`);
  };

  const onUpload = (files: FileList | null) => {
    if (!files) return;
    let count = 0;
    for (const file of Array.from(files)) {
      addAsset(assetFromFile(file));
      count++;
    }
    if (count) toast.success(`${count} asset${count > 1 ? "s" : ""} uploaded`);
  };

  const assets = [...uploadedAssets, ...MOCK_MEDIA];

  return (
    <div className="flex h-full border-r border-[var(--editor-border)] bg-[var(--editor-panel)]">
      <div className="flex w-12 flex-col items-center gap-1 border-r border-[var(--editor-border)] py-2">
        {EDITOR_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id as keyof typeof TAB_ICONS];
          return (
            <button
              key={tab.id}
              type="button"
              title={tab.label}
              onClick={() => setLeftTab(tab.id as typeof leftTab)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition",
                leftTab === tab.id
                  ? "bg-primary/20 text-primary"
                  : "text-white/40 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <div className="flex w-64 flex-col">
        <div className="border-b border-[var(--editor-border)] px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            {EDITOR_TABS.find((t) => t.id === leftTab)?.label}
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {leftTab === "text" && (
              <>
                {["Title", "Subtitle", "Caption", "Neon Headline"].map(
                  (label) => (
                    <Button
                      key={label}
                      variant="outline"
                      className="h-auto w-full justify-start border-white/10 bg-white/5 py-3 text-left text-white hover:bg-white/10"
                      onClick={() =>
                        add(
                          makeLayer({
                            type: "text",
                            name: label,
                            trackId: "t-tx1",
                            startFrame: currentFrame,
                            text:
                              label === "Neon Headline" ? "GLOW UP" : label,
                            textStyle: {
                              fontFamily: "Inter",
                              fontSize: label === "Title" ? 72 : 36,
                              fontWeight: 700,
                              color:
                                label === "Neon Headline"
                                  ? "#22d3ee"
                                  : "#ffffff",
                              align: "center",
                              lineHeight: 1.2,
                              letterSpacing: 0,
                              neon: label === "Neon Headline",
                              gradient:
                                label === "Title"
                                  ? "linear-gradient(135deg,#fff,#a5b4fc)"
                                  : undefined,
                            },
                            animation:
                              label === "Caption" ? "typewriter" : "fade",
                          })
                        )
                      }
                    >
                      <Type className="mr-2 h-4 w-4 text-primary" />
                      {label}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start border-white/10 bg-white/5 py-3 text-white hover:bg-white/10"
                  onClick={() =>
                    add(
                      makeLayer({
                        type: "caption",
                        name: "Captions",
                        trackId: "t-tx1",
                        startFrame: currentFrame,
                        durationInFrames: 100,
                        animation: "none",
                      })
                    )
                  }
                >
                  <Captions className="mr-2 h-4 w-4 text-emerald-400" />
                  Karaoke Captions
                </Button>
              </>
            )}

            {leftTab === "shapes" && (
              <div className="grid grid-cols-3 gap-2">
                {SHAPES.map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    title={shape}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 text-[10px] capitalize text-white/70 transition hover:bg-white/10"
                    onClick={() =>
                      add(
                        makeLayer({
                          type: "shape",
                          name: shape,
                          trackId: "t-v1",
                          startFrame: currentFrame,
                          shape,
                          fill: "#6366f1",
                          animation: "scale",
                        })
                      )
                    }
                  >
                    <Shapes className="h-4 w-4 text-cyan-400" />
                    {shape}
                  </button>
                ))}
                <button
                  type="button"
                  title="Noise field"
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 text-[10px] text-white/70 transition hover:bg-white/10"
                  onClick={() =>
                    add(
                      makeLayer({
                        type: "noise",
                        name: "Noise BG",
                        trackId: "t-v1",
                        startFrame: currentFrame,
                        durationInFrames: 120,
                        fill: "#818cf8",
                        animation: "none",
                      })
                    )
                  }
                >
                  <Waves className="h-4 w-4 text-fuchsia-400" />
                  noise
                </button>
              </div>
            )}

            {leftTab === "templates" && (
              <>
                <p className="px-0.5 text-[10px] text-white/40">
                  Applies the template to the current composition.
                </p>
                {MOCK_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      applyTemplate(t);
                      toast.success(`${t.name} applied`);
                    }}
                    className="block w-full cursor-pointer overflow-hidden rounded-lg border border-white/10 text-left transition hover:border-primary/40"
                  >
                    <div
                      className="aspect-video"
                      style={{ background: GRADIENTS[t.thumbnail] }}
                    />
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-white">
                        {t.name}
                      </p>
                      <p className="text-[10px] text-white/40">{t.category}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {leftTab === "scenes" && <ScenesPanel />}

            {leftTab === "assets" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    onUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full justify-start border-dashed border-white/15 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4 text-primary" /> Upload media
                </Button>
                {assets.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-left transition hover:bg-white/10"
                  onClick={() =>
                    add(
                      makeLayer({
                        type:
                          m.type === "gif"
                            ? "gif"
                            : m.type === "audio"
                              ? "audio"
                              : m.type === "video"
                                ? "video"
                                : "image",
                        name: m.name,
                        trackId:
                          m.type === "audio"
                            ? "t-a1"
                            : m.type === "video" || m.type === "image"
                              ? "t-v1"
                              : "t-v1",
                        startFrame: currentFrame,
                        durationInFrames: 90,
                        src: m.url,
                        objectFit: "cover",
                        volume: 1,
                        playbackRate: 1,
                        animation: "none",
                      })
                    )
                  }
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                    {m.type === "audio" ? (
                      <Mic className="h-4 w-4 text-amber-400" />
                    ) : m.type === "video" ? (
                      <Video className="h-4 w-4 text-sky-400" />
                    ) : m.type === "gif" ? (
                      <Sticker className="h-4 w-4 text-pink-400" />
                    ) : (
                      <Images className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-white">{m.name}</p>
                    <p className="text-[10px] text-white/40">{m.type}</p>
                  </div>
                </button>
                ))}
              </>
            )}

            {leftTab === "video" && (
              <>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start border-white/10 bg-white/5 py-3 text-white hover:bg-white/10"
                  onClick={() =>
                    add(
                      makeLayer({
                        type: "video",
                        name: "Video Clip",
                        trackId: "t-v1",
                        startFrame: currentFrame,
                        durationInFrames: 120,
                        src: SAMPLE_VIDEO,
                        objectFit: "cover",
                        useOffthread: true,
                        volume: 1,
                        playbackRate: 1,
                        animation: "none",
                      })
                    )
                  }
                >
                  <Video className="mr-2 h-4 w-4 text-sky-400" /> OffthreadVideo
                </Button>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start border-white/10 bg-white/5 py-3 text-white hover:bg-white/10"
                  onClick={() =>
                    add(
                      makeLayer({
                        type: "image",
                        name: "Image",
                        trackId: "t-v1",
                        startFrame: currentFrame,
                        durationInFrames: 90,
                        src: SAMPLE_IMAGE,
                        objectFit: "cover",
                        animation: "scale",
                      })
                    )
                  }
                >
                  <Images className="mr-2 h-4 w-4 text-emerald-400" /> Image
                </Button>
              </>
            )}

            {leftTab === "audio" && (
              <>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start border-white/10 bg-white/5 py-3 text-white hover:bg-white/10"
                  onClick={() =>
                    add(
                      makeLayer({
                        type: "audio",
                        name: "Background Music",
                        trackId: "t-a1",
                        startFrame: currentFrame,
                        durationInFrames: 150,
                        src: SAMPLE_AUDIO,
                        volume: 0.8,
                        playbackRate: 1,
                        loop: true,
                        animation: "none",
                      })
                    )
                  }
                >
                  <Music className="mr-2 h-4 w-4 text-amber-400" /> Background
                  Music
                </Button>
                <Button
                  variant="outline"
                  className="h-auto w-full justify-start border-white/10 bg-white/5 py-3 text-white hover:bg-white/10"
                  onClick={() =>
                    add(
                      makeLayer({
                        type: "audio",
                        name: "Voice-over",
                        trackId: "t-a1",
                        startFrame: currentFrame,
                        durationInFrames: 120,
                        src: SAMPLE_AUDIO,
                        volume: 1,
                        playbackRate: 1,
                        animation: "none",
                      })
                    )
                  }
                >
                  <Mic className="mr-2 h-4 w-4 text-rose-400" /> Voice-over
                </Button>
                <AudioMixer />
              </>
            )}

            {leftTab === "stickers" && (
              <div className="grid grid-cols-2 gap-2">
                {[SAMPLE_GIF].map((gif, i) => (
                  <button
                    key={i}
                    type="button"
                    className="overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:border-primary/40"
                    onClick={() =>
                      add(
                        makeLayer({
                          type: "gif",
                          name: "Sticker GIF",
                          trackId: "t-v1",
                          startFrame: currentFrame,
                          durationInFrames: 90,
                          src: gif,
                          objectFit: "contain",
                          animation: "bounce",
                        })
                      )
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gif} alt="sticker" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {leftTab === "brand" && (
              <div className="space-y-3">
                <p className="text-xs text-white/50">Brand colors</p>
                <div className="flex flex-wrap gap-2">
                  {["#6366f1", "#22d3ee", "#f472b6", "#0f172a", "#f8fafc"].map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        className="h-8 w-8 rounded-lg ring-1 ring-white/20"
                        style={{ background: c }}
                        onClick={() =>
                          add(
                            makeLayer({
                              type: "solid",
                              name: "Brand Color",
                              trackId: "t-v1",
                              startFrame: currentFrame,
                              fill: c,
                              durationInFrames: 90,
                            })
                          )
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
