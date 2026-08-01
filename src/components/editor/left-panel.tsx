"use client";

import { useRef, useState } from "react";
import {
  Captions,
  Film,
  Folder,
  Images,
  LayoutGrid,
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
import {
  DEFAULT_FILTERS,
  type Layer,
  type ShapeKind,
  type TimedCaption,
} from "@/types";
import {
  BROLL_LIBRARY,
  COLLAGE_LAYOUTS,
  EFFECT_PRESETS,
  PATTERN_PRESETS,
  STICKER_LIBRARY,
} from "@/data/creative-library";
import {
  captionsDurationInFrames,
  transcribeFromFile,
  transcribeFromSourceUrl,
} from "@/lib/transcribe-client";
import { blobToWavFile, pickRecorderMimeType } from "@/lib/record-audio";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  broll: Film,
  stickers: Sticker,
  patterns: Waves,
  effects: Sparkles,
  collage: LayoutGrid,
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

type VoiceMode = "voice-captions" | "captions-only";

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

function layerDragProps(layer: Layer) {
  return {
    draggable: true as const,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(
        "application/framekit-layer",
        JSON.stringify(layer)
      );
      e.dataTransfer.effectAllowed = "copy";
    },
  };
}

export function LeftPanel() {
  const leftTab = useEditorStore((s) => s.leftTab);
  const setLeftTab = useEditorStore((s) => s.setLeftTab);
  const addLayer = useEditorStore((s) => s.addLayer);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const removeLayers = useEditorStore((s) => s.removeLayers);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const project = useEditorStore((s) => s.project);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const uploadedAssets = useAssetStore((s) => s.assets);
  const addAsset = useAssetStore((s) => s.addAsset);
  const uploadFiles = useAssetStore((s) => s.uploadFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcribeInputRef = useRef<HTMLInputElement>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordStartRef = useRef(0);
  const [voiceMode, setVoiceModeState] = useState<VoiceMode>("voice-captions");
  const voiceModeRef = useRef<VoiceMode>("voice-captions");
  const setVoiceMode = (mode: VoiceMode) => {
    voiceModeRef.current = mode;
    setVoiceModeState(mode);
  };

  const add = (layer: Layer) => {
    addLayer(layer);
    toast.success(`Added “${layer.name}” — click it to edit`);
  };

  const findMediaSource = (): { src: string; layer?: Layer } | null => {
    const selected = project.layers.find((l) => l.id === selectedLayerIds[0]);
    if (
      selected &&
      (selected.type === "audio" || selected.type === "video") &&
      selected.src
    ) {
      return { src: selected.src, layer: selected };
    }
    const first = project.layers.find(
      (l) => (l.type === "audio" || l.type === "video") && l.src
    );
    return first?.src ? { src: first.src, layer: first } : null;
  };

  const applyCaptions = (captions: TimedCaption[], anchorFrame: number) => {
    const durationInFrames = captionsDurationInFrames(
      captions,
      project.settings.fps
    );
    // Reuse the selected caption layer, or failing that any caption layer —
    // adding a fresh layer per transcription stacks them and every word
    // renders twice on screen.
    const selectedCaption = project.layers.find(
      (l) => l.id === selectedLayerIds[0] && l.type === "caption"
    );
    const captionTarget =
      selectedCaption ?? project.layers.find((l) => l.type === "caption");

    // Stale transcription layers from before this reuse logic (or from other
    // panels) still render their own words on top — clear them out.
    const staleCaptions = project.layers.filter(
      (l) =>
        l.type === "caption" &&
        l.name === "Whisper Captions" &&
        l.id !== captionTarget?.id
    );
    if (staleCaptions.length) {
      removeLayers(staleCaptions.map((l) => l.id));
    }

    if (captionTarget) {
      updateLayer(captionTarget.id, {
        captions,
        durationInFrames,
        startFrame: anchorFrame,
      });
    } else {
      addLayer(
        makeLayer({
          type: "caption",
          name: "Whisper Captions",
          trackId: "t-tx1",
          startFrame: anchorFrame,
          durationInFrames,
          captions,
          animation: "none",
        })
      );
    }
  };

  const transcribeAudio = async () => {
    const media = findMediaSource();
    if (!media) {
      // No clip on the timeline yet — let the user pick one; we add it to the
      // timeline and transcribe it in one go.
      toast.info("Pick a video or audio file with speech");
      transcribeInputRef.current?.click();
      return;
    }
    setTranscribing(true);
    const toastId = toast.loading("Listening to your audio and writing captions…");
    try {
      const isLocal = media.src.startsWith("/") || media.src.startsWith("blob:") || media.src.includes("localhost") || media.src.includes("127.0.0.1");
      const srcUrl = media.src.startsWith("/")
        ? window.location.origin + media.src
        : media.src;

      const result = isLocal
        ? await transcribeFromFile(
            new File(
              [await (await fetch(srcUrl)).blob()],
              media.layer?.name ?? "clip"
            )
          )
        : await transcribeFromSourceUrl(srcUrl);
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      if (result.captions.length === 0) {
        toast.warning(
          "No speech found in that clip — check it has a clear voice",
          { id: toastId }
        );
        return;
      }
      applyCaptions(result.captions, media.layer?.startFrame ?? currentFrame);
      toast.success(
        `Done — ${result.captions.length} words turned into captions`,
        { id: toastId }
      );
    } finally {
      setTranscribing(false);
    }
  };

  const mediaDurationInFrames = (
    url: string,
    kind: "audio" | "video"
  ): Promise<number> =>
    new Promise((resolve) => {
      const el = document.createElement(kind);
      el.preload = "metadata";
      const timer = setTimeout(() => {
        resolve(150);
      }, 1000);
      el.onloadedmetadata = () => {
        clearTimeout(timer);
        resolve(
          Number.isFinite(el.duration) && el.duration > 0
            ? Math.ceil(el.duration * project.settings.fps)
            : 150
        );
      };
      el.onerror = () => {
        clearTimeout(timer);
        resolve(150);
      };
      el.src = url;
    });

  const transcribePickedFile = async (
    file: File,
    knownDurationSec?: number,
    mode: VoiceMode = "voice-captions"
  ) => {
    const kind = file.type.startsWith("audio") ? "audio" : "video";
    const asset = assetFromFile(file);
    addAsset(asset);

    // MediaRecorder blobs report Infinity duration in Chromium, so mic
    // recordings pass the elapsed time in explicitly.
    const durationInFrames = knownDurationSec
      ? Math.ceil(knownDurationSec * project.settings.fps)
      : await mediaDurationInFrames(asset.url, kind);

    // Start after whatever already sits on the target track — overlapping
    // clips all play at once, which sounds like echoing / repeated words.
    const trackId = kind === "audio" ? "t-a1" : "t-v1";
    const trackEnd = project.layers
      .filter((l) => l.trackId === trackId)
      .reduce((end, l) => Math.max(end, l.startFrame + l.durationInFrames), 0);
    const anchorFrame =
      mode === "captions-only"
        ? currentFrame
        : Math.max(currentFrame, trackEnd);

    if (mode === "voice-captions") {
      addLayer(
        makeLayer({
          type: kind,
          name: file.name,
          trackId,
          startFrame: anchorFrame,
          durationInFrames,
          src: asset.url,
          objectFit: "cover",
          volume: 1,
          playbackRate: 1,
          animation: "none",
        })
      );
    }

    setTranscribing(true);
    const toastId = toast.loading(
      `Added “${file.name}” — listening and writing captions…`
    );
    try {
      const result = await transcribeFromFile(file);
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      if (result.captions.length === 0) {
        toast.warning(
          "No speech detected — speak closer to the microphone and try again",
          { id: toastId }
        );
        return;
      }
      applyCaptions(result.captions, anchorFrame);
      toast.success(
        `Done — ${result.captions.length} words turned into captions`,
        { id: toastId }
      );
    } finally {
      setTranscribing(false);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const recorder = new MediaRecorder(stream, {
        mimeType: pickRecorderMimeType(),
        audioBitsPerSecond: 128000,
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const elapsedSec = (Date.now() - recordStartRef.current) / 1000;
        if (elapsedSec < 0.5 || chunks.length === 0) {
          toast.error("Recording was too short — hold on a bit longer");
          return;
        }
        const blob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        });
        const stamp = Date.now();
        try {
          // Re-encode as WAV: recorder blobs aren't seekable and report no
          // duration, which makes timeline playback stutter.
          const { file, durationSec } = await blobToWavFile(
            blob,
            `voice-note-${stamp}.wav`
          );
          void transcribePickedFile(file, durationSec, voiceModeRef.current);
        } catch {
          const file = new File([blob], `voice-note-${stamp}.webm`, {
            type: blob.type,
          });
          void transcribePickedFile(file, elapsedSec, voiceModeRef.current);
        }
      };
      recorderRef.current = recorder;
      recordStartRef.current = Date.now();
      recorder.start(250);
      setRecording(true);
      toast.info("Recording… click again to stop");
    } catch {
      toast.error(
        "Microphone access was blocked — allow it in your browser and try again"
      );
    }
  };

  const onUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const toastId = toast.loading("Uploading files to server...");
    try {
      const count = await uploadFiles(files);
      if (count > 0) {
        toast.success(`Successfully uploaded ${count} file${count > 1 ? "s" : ""}`, { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Error uploading files", { id: toastId });
    }
  };

  const assets = [...uploadedAssets, ...MOCK_MEDIA];
  const activeTab = EDITOR_TABS.find((t) => t.id === leftTab);

  return (
    <div className="flex h-full border-r border-[var(--editor-border)] bg-[var(--editor-panel)]">
      <div className="flex w-14 flex-col items-center gap-1 border-r border-[var(--editor-border)] py-2">
        {EDITOR_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id as keyof typeof TAB_ICONS];
          return (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={tab.label}
                  onClick={() => setLeftTab(tab.id as typeof leftTab)}
                  className={cn(
                    "flex h-9 w-9 flex-col items-center justify-center rounded-lg transition border",
                    leftTab === tab.id
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "text-white/40 border-transparent hover:bg-white/5 hover:text-white/80"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[180px]">
                <p className="font-medium">{tab.label}</p>
                <p className="text-[11px] text-muted-foreground">{tab.hint}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex w-64 flex-col">
        <div className="border-b border-[var(--editor-border)] px-3 py-2.5">
          <p className="text-sm font-semibold text-white/90">
            {activeTab?.label}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/45">
            {activeTab?.hint}
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-3">
            {leftTab === "text" && (
              <>
                <p className="px-0.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Add text
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["Title", "Subtitle", "Caption", "Neon Headline"].map(
                    (label) => {
                      const layer = makeLayer({
                        type: "text",
                        name: label,
                        trackId: "t-tx1",
                        startFrame: currentFrame,
                        text: label === "Neon Headline" ? "GLOW UP" : label,
                        textStyle: {
                          fontFamily: "Inter",
                          fontSize: label === "Title" ? 72 : 36,
                          fontWeight: 700,
                          color:
                            label === "Neon Headline" ? "#22d3ee" : "#ffffff",
                          align: "center",
                          lineHeight: 1.2,
                          letterSpacing: 0,
                          neon: label === "Neon Headline",
                          gradient:
                            label === "Title"
                              ? "linear-gradient(135deg,#fff,#a5b4fc)"
                              : undefined,
                        },
                        animation: label === "Caption" ? "typewriter" : "fade",
                      });
                      return (
                        <Button
                          key={label}
                          variant="outline"
                          className="h-auto w-full flex-col gap-1.5 border-white/10 bg-white/5 py-3 text-white hover:bg-white/10"
                          {...layerDragProps(layer)}
                          onClick={() => add(layer)}
                        >
                          <Type className="h-4 w-4 text-primary" />
                          <span className="text-[11px] leading-none">
                            {label === "Neon Headline" ? "Neon" : label}
                          </span>
                        </Button>
                      );
                    }
                  )}
                </div>

                <p className="px-0.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                  Captions from speech
                </p>
                <input
                  ref={transcribeInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void transcribePickedFile(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  disabled={transcribing || recording}
                  className="h-auto w-full justify-start border-primary/30 bg-primary/15 py-3 text-white hover:bg-primary/25"
                  onClick={() => void transcribeAudio()}
                >
                  <Captions className="mr-2 h-4 w-4 text-primary" />
                  {transcribing
                    ? "Writing your captions…"
                    : "Captions from video or audio"}
                </Button>
                <Button
                  variant="outline"
                  disabled={transcribing}
                  className={cn(
                    "h-auto w-full justify-start border-white/10 bg-white/5 py-3 text-white hover:bg-white/10",
                    recording &&
                      "border-red-500/50 bg-red-500/10 hover:bg-red-500/20"
                  )}
                  onClick={() => void toggleRecording()}
                >
                  <Mic
                    className={cn(
                      "mr-2 h-4 w-4 text-red-400",
                      recording && "animate-pulse"
                    )}
                  />
                  {recording ? "Stop recording" : "Record my voice"}
                </Button>
                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
                  {(
                    [
                      { id: "voice-captions", label: "Keep my voice" },
                      { id: "captions-only", label: "Captions only" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setVoiceMode(m.id)}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-[11px] transition",
                        voiceMode === m.id
                          ? "bg-primary/25 text-white"
                          : "text-white/50 hover:bg-white/5"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start py-2 text-[11px] text-white/50 hover:bg-white/5 hover:text-white/80"
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
                  <Captions className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                  Empty captions — type them yourself
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
                  <Upload className="mr-2 h-4 w-4 text-primary" /> Upload from your computer
                </Button>
                {assets.map((m) => (
                <div
                  key={m.id}
                  className="flex w-full flex-col gap-1 rounded-lg border border-white/10 bg-white/5 p-2"
                >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 text-left transition hover:opacity-90"
                  onClick={async () => {
                    const duration = (m.type === "audio" || m.type === "video")
                      ? await mediaDurationInFrames(m.url, m.type)
                      : 90;
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
                            : "t-v1",
                        startFrame: currentFrame,
                        durationInFrames: duration,
                        src: m.url,
                        objectFit: "cover",
                        volume: 1,
                        playbackRate: 1,
                        animation: "none",
                      })
                    );
                  }}
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
                {(m.type === "image" || m.type === "gif" || m.type === "video") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-full border-white/10 bg-black/20 text-[10px] text-white/70 hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      const id = `l-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
                      const layer = makeLayer({
                        type: m.type === "gif" ? "gif" : m.type === "video" ? "video" : "image",
                        name: `${m.name} (BG)`,
                        trackId: "t-v1",
                        startFrame: 0,
                        durationInFrames: project.settings.durationInFrames,
                        src: m.url,
                        objectFit: "cover",
                        animation: "none",
                      });
                      // Force id so we can send to back immediately
                      add({ ...layer, id });
                      // send to back on next tick after add
                      setTimeout(() => {
                        useEditorStore.getState().sendLayerToBack(id);
                        useEditorStore.getState().selectLayers([id]);
                      }, 0);
                      toast.success("Added as background (back layer)");
                    }}
                  >
                    Use as full-screen background
                  </Button>
                )}
                </div>
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
                {STICKER_LIBRARY.map((st) => {
                  const layer = makeLayer({
                    type: "sticker",
                    name: st.name,
                    trackId: "t-v1",
                    startFrame: currentFrame,
                    durationInFrames: 90,
                    src: st.url,
                    stickerId: st.id,
                    objectFit: "contain",
                    animation: "bounce",
                  });
                  return (
                    <button
                      key={st.id}
                      type="button"
                      className="overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:border-primary/40"
                      {...layerDragProps(layer)}
                      onClick={() => add(layer)}
                    >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={st.url} alt={st.name} className="aspect-square w-full object-cover" />
                    <p className="truncate px-1 py-1 text-[10px] text-white/60">{st.name}</p>
                  </button>
                  );
                })}
              </div>
            )}

            {leftTab === "broll" && (
              <div className="space-y-2">
                {BROLL_LIBRARY.map((clip) => {
                  const layer = makeLayer({
                    type: "video",
                    name: clip.name,
                    trackId: "t-v1",
                    startFrame: currentFrame,
                    durationInFrames: Math.round(clip.durationSec * 30),
                    src: clip.url,
                    brollTag: clip.tags[0],
                    isBroll: true,
                    objectFit: "cover",
                    useOffthread: true,
                    volume: 0,
                    animation: "fade",
                  });
                  return (
                    <Button
                      key={clip.id}
                      variant="outline"
                      className="h-auto w-full justify-start border-white/10 bg-white/5 py-2 text-white hover:bg-white/10"
                      {...layerDragProps(layer)}
                      onClick={() => add(layer)}
                    >
                    <Film className="mr-2 h-4 w-4 shrink-0 text-sky-400" />
                    <div className="min-w-0 text-left">
                      <p className="truncate text-xs">{clip.name}</p>
                      <p className="text-[10px] text-white/40">{clip.tags.join(" · ")}</p>
                    </div>
                  </Button>
                  );
                })}
              </div>
            )}

            {leftTab === "patterns" && (
              <div className="grid grid-cols-2 gap-2">
                {PATTERN_PRESETS.map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    className="overflow-hidden rounded-lg border border-white/10 bg-white/5 p-2 transition hover:border-primary/40"
                    onClick={() =>
                      add(
                        makeLayer({
                          type: "pattern",
                          name: pat.name,
                          trackId: "t-v1",
                          startFrame: currentFrame,
                          durationInFrames: 150,
                          pattern: pat.type,
                          animation: "none",
                        })
                      )
                    }
                  >
                    <div
                      className="h-12 rounded-md"
                      style={{ background: pat.preview, backgroundSize: "12px 12px" }}
                    />
                    <p className="mt-1 text-[10px] text-white/60">{pat.name}</p>
                  </button>
                ))}
              </div>
            )}

            {leftTab === "effects" && (
              <div className="grid grid-cols-2 gap-2">
                {EFFECT_PRESETS.map((fx) => (
                  <Button
                    key={fx.id}
                    size="sm"
                    variant="outline"
                    className="h-auto flex-col items-start border-white/10 bg-white/5 py-2 text-white hover:bg-white/10"
                    onClick={() =>
                      add(
                        makeLayer({
                          type: "solid",
                          name: fx.name,
                          trackId: "t-v1",
                          startFrame: currentFrame,
                          durationInFrames: 90,
                          fill: "transparent",
                          filters: {
                            ...DEFAULT_FILTERS,
                            contrast: fx.filters.contrast ?? 100,
                            saturate: fx.filters.saturate ?? 100,
                            sepia: fx.filters.sepia ?? 0,
                            grayscale: fx.filters.grayscale ?? 0,
                          },
                          animation: "fade",
                        })
                      )
                    }
                  >
                    <Sparkles className="mb-1 h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-medium">{fx.name}</span>
                    <span className="text-[9px] text-white/40">{fx.description}</span>
                  </Button>
                ))}
              </div>
            )}

            {leftTab === "collage" && (
              <div className="space-y-2">
                {COLLAGE_LAYOUTS.map((layout) => (
                  <Button
                    key={layout.id}
                    variant="outline"
                    className="h-auto w-full justify-start border-white/10 bg-white/5 py-2 text-white hover:bg-white/10"
                    onClick={() => {
                      const collageSources = Array.from(
                        { length: layout.cells },
                        (_, i) => ({
                          src: `https://picsum.photos/seed/collage-${layout.id}-${i}/800/800`,
                          fit: "cover" as const,
                        })
                      );
                      add(
                        makeLayer({
                          type: "collage",
                          name: layout.name,
                          trackId: "t-v1",
                          startFrame: currentFrame,
                          durationInFrames: 120,
                          src: collageSources[0]?.src,
                          collageLayout: layout.id,
                          collageCells: layout.cells,
                          collageSources,
                          objectFit: "cover",
                          animation: "fade",
                        })
                      );
                      toast.success(`${layout.name} collage added`);
                    }}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4 shrink-0 text-violet-400" />
                    <div className="text-left">
                      <p className="text-xs">{layout.name}</p>
                      <p className="text-[10px] text-white/40">
                        {layout.description}
                      </p>
                    </div>
                  </Button>
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
