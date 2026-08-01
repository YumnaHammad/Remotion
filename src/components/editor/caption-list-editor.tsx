"use client";

import { useEffect, useMemo, useState } from "react";
import { Volume2, Wand2, Loader2, AudioLines, Scissors, Merge } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { Layer, TimedCaption } from "@/types";
import {
  captionsDurationMs,
  captionsPlainText,
  captionsToScript,
  scriptToTimedCaptions,
  speakCaptionsInBrowser,
  captionsToTimestampedScript,
  timestampedScriptToCaptions,
} from "@/lib/caption-editor";
import { captionsDurationInFrames } from "@/lib/transcribe-client";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editor-store";
import { groupCaptionsIntoSegments } from "@/lib/pipeline/local-breakdown";

interface CaptionListEditorProps {
  layer: Layer;
  fps: number;
  speakOnPlay: boolean;
  onSpeakOnPlayChange: (v: boolean) => void;
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void;
  onAddVoiceLayer: (args: {
    src: string;
    name: string;
    startFrame: number;
    durationInFrames: number;
  }) => void;
}

/**
 * Edit your own caption word list, apply timing, and add a real voice track.
 */
export function CaptionListEditor({
  layer,
  fps,
  speakOnPlay,
  onSpeakOnPlayChange,
  onUpdateLayer,
  onAddVoiceLayer,
}: CaptionListEditorProps) {
  const [script, setScript] = useState(() =>
    captionsToTimestampedScript(layer.captions) ||
    captionsToScript(layer.captions) ||
    "Create stunning videos with Framekit"
  );
  const [msPerWord, setMsPerWord] = useState(320);
  const [busy, setBusy] = useState<"apply" | "speak" | "tts" | null>(null);
  const [cloudTts, setCloudTts] = useState(false);

  useEffect(() => {
    setScript(
      captionsToTimestampedScript(layer.captions) ||
        captionsToScript(layer.captions) ||
        "Create stunning videos with Framekit"
    );
  }, [layer.id, layer.captions]);

  useEffect(() => {
    fetch("/api/tts")
      .then((r) => r.json())
      .then((d: { cloudTts?: boolean }) => setCloudTts(!!d.cloudTts))
      .catch(() => setCloudTts(false));
  }, []);

  const previewCount = useMemo(
    () => scriptToTimedCaptions(script, { msPerWord }).length,
    [script, msPerWord]
  );

  const buildCaptions = () => {
    const captions = scriptToTimedCaptions(script, { msPerWord });
    if (!captions.length) {
      toast.error("Enter at least one word");
      return null;
    }
    return captions;
  };

  const applyCaptions = (captions: TimedCaption[]) => {
    const durationInFrames = captionsDurationInFrames(captions, fps);
    onUpdateLayer(layer.id, {
      captions,
      durationInFrames,
      name:
        layer.name === "Captions" || layer.name.startsWith("Captions")
          ? "Captions"
          : layer.name,
    });
    return durationInFrames;
  };

  const applyTextOnly = () => {
    setBusy("apply");
    try {
      const captions = buildCaptions();
      if (!captions) return;
      applyCaptions(captions);
      toast.success(`Applied ${captions.length} words — click Add voice for sound`);
    } finally {
      setBusy(null);
    }
  };

  const previewSpeak = () => {
    const captions =
      layer.captions?.length ?
        layer.captions
      : scriptToTimedCaptions(script, { msPerWord });
    if (!captions.length) {
      toast.error("Add caption text first");
      return;
    }
    setBusy("speak");
    speakCaptionsInBrowser(captions, {
      onEnd: () => setBusy(null),
    });
    toast.message("Speaking now…");
  };

  const addVoiceTrack = async () => {
    const captions = buildCaptions();
    if (!captions) return;

    applyCaptions(captions);

    const text = captionsPlainText(captions);
    setBusy("tts");
    const toastId = toast.loading("Generating voice from your captions…");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          useExternalApis: true,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        mode?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.url) {
        throw new Error(data.error ?? "TTS failed");
      }

      const endMs = captionsDurationMs(captions);
      const durationInFrames = Math.max(
        30,
        Math.ceil((endMs / 1000) * fps) + 15
      );

      onAddVoiceLayer({
        src: data.url,
        name: `Voice · ${text.slice(0, 24)}${text.length > 24 ? "…" : ""}`,
        startFrame: layer.startFrame,
        durationInFrames,
      });

      onUpdateLayer(layer.id, {
        captions,
        durationInFrames,
      });

      const modeMsg =
        data.mode === "external"
          ? "Cloud voice added on Audio track"
          : data.mode === "sapi"
            ? "Voice added on Audio track (Windows TTS)"
            : "Placeholder audio added — check TTS setup";

      toast.success(modeMsg, { id: toastId });

      // Also speak immediately so the user hears something right away
      speakCaptionsInBrowser(captions);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "TTS failed", {
        id: toastId,
      });
    } finally {
      setBusy(null);
    }
  };

  const projectLayers = useEditorStore((s) => s.project.layers);
  const canMerge = useMemo(() => {
    return projectLayers.filter((l) => l.type === "caption").length > 1;
  }, [projectLayers]);

  const divideIntoTimestampBlocks = () => {
    if (!layer.captions || !layer.captions.length) {
      toast.error("Add or record some caption words first.");
      return;
    }
    const segments = groupCaptionsIntoSegments(layer.captions);
    if (segments.length <= 1) {
      toast.error("Not enough timing segments to divide. Add punctuation (. ! ?) or spacing gaps.");
      return;
    }
    const baseIndex = projectLayers.findIndex((l) => l.id === layer.id);
    if (baseIndex === -1) return;

    const newLayers: Layer[] = [];
    segments.forEach((seg, i) => {
      const startFrame = Math.round((seg.startMs / 1000) * fps);
      const endFrame = Math.round((seg.endMs / 1000) * fps);
      const durationInFrames = Math.max(15, endFrame - startFrame);
      const relativeCaptions = seg.words.map((w: any) => ({
        ...w,
        startMs: w.startMs - seg.startMs,
        endMs: w.endMs - seg.startMs,
        timestampMs: w.timestampMs - seg.startMs,
      }));

      newLayers.push({
        ...layer,
        id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${i}`,
        name: `Caption Part ${i + 1}`,
        startFrame: layer.startFrame + startFrame,
        durationInFrames,
        captions: relativeCaptions,
      });
    });

    const updatedLayers = [...projectLayers];
    updatedLayers.splice(baseIndex, 1, ...newLayers);

    useEditorStore.getState().setLayers(updatedLayers);
    useEditorStore.getState().selectLayers([newLayers[0]!.id]);
    toast.success(`Divided captions into ${newLayers.length} separate parts.`);
  };

  const mergeAllCaptionLayers = () => {
    const captionLayers = projectLayers
      .filter((l) => l.type === "caption")
      .sort((a, b) => a.startFrame - b.startFrame);

    if (captionLayers.length <= 1) {
      toast.error("There is only one caption layer in the project.");
      return;
    }

    const combinedCaptions: TimedCaption[] = [];
    captionLayers.forEach((cl) => {
      if (!cl.captions) return;
      const layerOffsetMs = (cl.startFrame / fps) * 1000;
      cl.captions.forEach((c) => {
        const baseTimestamp = c.timestampMs ?? Math.round((c.startMs + c.endMs) / 2);
        combinedCaptions.push({
          ...c,
          startMs: Math.round(c.startMs + layerOffsetMs),
          endMs: Math.round(c.endMs + layerOffsetMs),
          timestampMs: Math.round(baseTimestamp + layerOffsetMs),
        });
      });
    });

    if (!combinedCaptions.length) {
      toast.error("No caption words found to merge.");
      return;
    }

    const minStartFrame = Math.min(...captionLayers.map((l) => l.startFrame));
    const maxEndFrame = Math.max(...captionLayers.map((l) => l.startFrame + l.durationInFrames));
    const durationInFrames = Math.max(30, maxEndFrame - minStartFrame);

    const mergedOffsetMs = (minStartFrame / fps) * 1000;
    const relativeMergedCaptions = combinedCaptions.map((c) => {
      const baseTimestamp = c.timestampMs ?? Math.round((c.startMs + c.endMs) / 2);
      return {
        ...c,
        startMs: Math.round(c.startMs - mergedOffsetMs),
        endMs: Math.round(c.endMs - mergedOffsetMs),
        timestampMs: Math.round(baseTimestamp - mergedOffsetMs),
      };
    });

    const mergedLayer: Layer = {
      ...captionLayers[0]!,
      id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: "Whisper Captions",
      startFrame: minStartFrame,
      durationInFrames,
      captions: relativeMergedCaptions,
    };

    const firstCaptionIndex = projectLayers.findIndex((l) => l.id === captionLayers[0]!.id);
    const filteredLayers = projectLayers.filter((l) => !captionLayers.some((cl) => cl.id === l.id));

    const updatedLayers = [...filteredLayers];
    updatedLayers.splice(firstCaptionIndex, 0, mergedLayer);

    useEditorStore.getState().setLayers(updatedLayers);
    useEditorStore.getState().selectLayers([mergedLayer.id]);
    toast.success("Merged all individual caption parts into a single timeline bar.");
  };

  return (
    <div className="space-y-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/90">
          Your words + voice
        </p>
        <p className="text-[10px] text-white/40">
          Type what you want on screen, then tap the green button to add a
          speaking voice.
        </p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-white/60">Caption script</Label>
        <Textarea
          value={script}
          onChange={(e) => {
            const newVal = e.target.value;
            setScript(newVal);
            const hasTimestamps = newVal.match(/\[\d{1,2}:\d{2}/);
            const newCaptions = hasTimestamps
              ? timestampedScriptToCaptions(newVal, msPerWord)
              : scriptToTimedCaptions(newVal, { msPerWord });
            if (newCaptions.length) {
              const durationInFrames = captionsDurationInFrames(newCaptions, fps);
              onUpdateLayer(layer.id, {
                captions: newCaptions,
                durationInFrames,
              });
            }
          }}
          rows={3}
          placeholder={"Hello world\nThis is my caption list"}
          className="resize-y border-white/10 bg-black/30 text-xs text-white"
        />
        <p className="text-[10px] text-white/35">
          ~{previewCount} words · {msPerWord} ms/word
        </p>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-white/60">
          Pace · {msPerWord} ms per word
        </Label>
        <Slider
          value={[msPerWord]}
          min={180}
          max={600}
          step={10}
          onValueChange={([v]) => {
            setMsPerWord(v);
            const hasTimestamps = script.match(/\[\d{1,2}:\d{2}/);
            const newCaptions = hasTimestamps
              ? timestampedScriptToCaptions(script, v)
              : scriptToTimedCaptions(script, { msPerWord: v });
            if (newCaptions.length) {
              const durationInFrames = captionsDurationInFrames(newCaptions, fps);
              onUpdateLayer(layer.id, {
                captions: newCaptions,
                durationInFrames,
              });
            }
          }}
        />
      </div>

      <Button
        size="sm"
        disabled={busy !== null}
        className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
        onClick={() => void addVoiceTrack()}
      >
        {busy === "tts" ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <AudioLines className="mr-1.5 h-3.5 w-3.5" />
        )}
        Add voice so people can hear it
      </Button>

      <div className="grid grid-cols-2 gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={previewSpeak}
        >
          {busy === "speak" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Volume2 className="mr-1.5 h-3.5 w-3.5 text-sky-400" />
          )}
          Hear now
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={applyTextOnly}
        >
          {busy === "apply" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wand2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
          )}
          Text only
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 rounded border border-white/10 bg-black/20 px-2 py-1.5">
        <Label className="text-[10px] text-white/60">
          Speak while I play the video
        </Label>
        <Switch
          checked={speakOnPlay}
          onCheckedChange={onSpeakOnPlayChange}
        />
      </div>

      <p className="text-[10px] text-white/35">
        {cloudTts
          ? "Using OpenAI TTS when you Add voice."
          : "Uses Windows voice (no API key). Add OPENAI_API_KEY for cloud TTS."}
      </p>

      <div className="space-y-2 border-t border-white/10 pt-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Timeline Layout Options
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 border-emerald-500/25 bg-emerald-500/5 text-[10px] text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
            onClick={divideIntoTimestampBlocks}
          >
            <Scissors className="mr-1 h-3 w-3" />
            Split by Timestamps
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canMerge}
            className="h-7 border-sky-500/25 bg-sky-500/5 text-[10px] text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 disabled:opacity-40"
            onClick={mergeAllCaptionLayers}
          >
            <Merge className="mr-1 h-3 w-3" />
            Merge all parts
          </Button>
        </div>
      </div>

      {!!layer.captions?.length && (
        <ul className="max-h-24 space-y-0.5 overflow-y-auto rounded border border-white/10 bg-black/20 p-2 text-[10px] text-white/70">
          {layer.captions.map((c: TimedCaption, i) => (
            <li key={`${c.startMs}-${i}`} className="flex justify-between gap-2">
              <span className="truncate font-medium text-white">{c.text}</span>
              <span className="shrink-0 text-white/35">
                {(c.startMs / 1000).toFixed(1)}s–{(c.endMs / 1000).toFixed(1)}s
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
