"use client";

import { useEffect, useMemo, useState } from "react";
import { Volume2, Wand2, Loader2, AudioLines } from "lucide-react";
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
} from "@/lib/caption-editor";
import { captionsDurationInFrames } from "@/lib/transcribe-client";
import { toast } from "sonner";

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
    captionsToScript(layer.captions) ||
    "Create stunning videos with Framekit"
  );
  const [msPerWord, setMsPerWord] = useState(320);
  const [busy, setBusy] = useState<"apply" | "speak" | "tts" | null>(null);
  const [cloudTts, setCloudTts] = useState(false);

  useEffect(() => {
    setScript(
      captionsToScript(layer.captions) ||
        "Create stunning videos with Framekit"
    );
  }, [layer.id]); // eslint-disable-line react-hooks/exhaustive-deps -- only reset when switching layers

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
          onChange={(e) => setScript(e.target.value)}
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
          onValueChange={([v]) => setMsPerWord(v)}
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
