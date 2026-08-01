"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Copy,
  Loader2,
  Sparkles,
  Wand2,
  Film,
  Download,
  Share2,
  RefreshCw,
  Upload,
  Mic,
  Link2,
} from "lucide-react";
import { blobToWavFile, pickRecorderMimeType } from "@/lib/record-audio";
import { transcribeFromFile, transcribeFromSourceUrl } from "@/lib/transcribe-client";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplatePreview } from "@/features/shared/template-preview";
import { ExportVideoButton } from "@/features/shared/export-video-button";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import { createProjectFromEditRecipe } from "@/utils/video-project-factory";
import { localBreakdown, groupCaptionsIntoSegments } from "@/lib/pipeline/local-breakdown";
import {
  buildAutomatedVideoInputProps,
  fetchCaptionVoiceover,
  resolveEditRecipeLocal,
} from "@/lib/pipeline/local-resolver";
import type { PipelinePreferences } from "@/lib/pipeline/pipeline-preferences";
import {
  PipelineSettings,
  usePipelinePreferences,
} from "@/features/script-to-video/pipeline-settings";
import type { EditRecipe, ResolvedEditRecipe } from "@/types/edit-recipe";
import { ASPECT_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateVideoWithVeo } from "@/lib/veo-client";
import type { VeoJobPublic } from "@/lib/google-video";
import { VEO_STAGE_LABELS } from "@/lib/google-video";

const EXAMPLE_SCRIPT = `The business collapsed overnight [WHOOSH EFFECT]. The founder lost everything. But then, he had a breakthrough [DING EFFECT]!`;

const STEPS = [
  { id: 1, label: "Script" },
  { id: 2, label: "Recipe" },
  { id: 3, label: "Export" },
] as const;

function ScriptStepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {STEPS.map((step, i) => (
        <li key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 font-medium",
              current >= step.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                current >= step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.id}
            </span>
            <span>{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-1 h-px w-6",
                current > step.id ? "bg-primary/40" : "bg-border"
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

function formatTranscriptionText(result: any): string {
  const segments = result.segments && result.segments.length > 0
    ? result.segments
    : (result.captions ? groupCaptionsIntoSegments(result.captions) : []);
    
  if (!segments.length) {
    return result.text || "";
  }

  return segments.map((seg: any) => {
    const totalSeconds = seg.startMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const hundredths = Math.floor((seg.startMs % 1000) / 10);
    
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    const hh = String(hundredths).padStart(2, "0");
    
    return `[${mm}:${ss}.${hh}] ${seg.text.trim()}`;
  }).join("\n");
}

export function ScriptToVideoFeature() {
  const searchParams = useSearchParams();
  const { brand } = useBrandKit();
  const addProject = useSimpleVideoStore((s) => s.addProject);
  const [pipelinePrefs, setPipelinePrefs] = usePipelinePreferences();

  const [step, setStep] = useState(1);
  const [script, setScript] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">(
    "16:9"
  );
  const [loading, setLoading] = useState(false);
  const [breakdownMode, setBreakdownMode] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<EditRecipe | null>(null);
  const [resolved, setResolved] = useState<ResolvedEditRecipe | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [previewProps, setPreviewProps] = useState<Record<string, unknown>>(
    {}
  );
  const [durationInFrames, setDurationInFrames] = useState(900);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  /** Captions (and matching spoken voice) only when the user turns this on. */
  const [showCaptions, setShowCaptions] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);

  /** Google Veo generation (async poll) */
  const [veoBusy, setVeoBusy] = useState(false);
  const [veoJob, setVeoJob] = useState<VeoJobPublic | null>(null);
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);
  const [veoProgressLabel, setVeoProgressLabel] = useState("");
  const veoAbortRef = useRef<AbortController | null>(null);

  // Microphone recording & Raw footage transcription states/refs
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcribingMedia, setTranscribingMedia] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [aiImproving, setAiImproving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordIntervalRef = useRef<any>(null);
  const recordStartRef = useRef<number>(0);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const scriptParam = searchParams.get("script");
    const ratioParam = searchParams.get("aspectRatio");
    if (scriptParam) setScript(scriptParam);
    if (
      ratioParam === "16:9" ||
      ratioParam === "9:16" ||
      ratioParam === "1:1"
    ) {
      setAspectRatio(ratioParam);
    }
  }, [searchParams]);

  const startProgressTimer = () => {
    setTranscriptionProgress(0);
    const interval = setInterval(() => {
      setTranscriptionProgress((prev) => {
        if (prev < 30) return prev + 5;
        if (prev < 70) return prev + 3;
        if (prev < 95) return prev + 1;
        return prev;
      });
    }, 400);
    return interval;
  };

  const startRecording = async () => {
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
        if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
        const elapsedSec = (Date.now() - recordStartRef.current) / 1000;
        if (elapsedSec < 0.5 || chunks.length === 0) {
          toast.error("Recording was too short — hold on a bit longer");
          return;
        }
        const blob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        });
        const stamp = Date.now();
        setTranscribingMedia(true);
        const progressInterval = startProgressTimer();
        const toastId = toast.loading("Processing recording and extracting speech...");
        try {
          let file: File;
          try {
            const wav = await blobToWavFile(blob, `voice-script-${stamp}.wav`);
            file = wav.file;
          } catch {
            file = new File([blob], `voice-script-${stamp}.webm`, { type: blob.type });
          }
          const result = await transcribeFromFile(file, "faster-whisper");
          if (!result.ok) {
            toast.error(result.error, { id: toastId });
            return;
          }
          const formatted = formatTranscriptionText(result);
          if (!formatted.trim()) {
            toast.warning("No speech detected. Speak closer to the microphone.", { id: toastId });
            return;
          }
          setScript((prev) => (prev ? prev + "\n" + formatted : formatted));
          toast.success("Recording transcribed successfully!", { id: toastId });
        } catch (err) {
          toast.error("Transcription failed", { id: toastId });
        } finally {
          clearInterval(progressInterval);
          setTranscriptionProgress(100);
          setTimeout(() => {
            setTranscriptionProgress(0);
            setTranscribingMedia(false);
          }, 500);
        }
      };
      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      setRecordingDuration(0);
      recorder.start(250);
      setRecording(true);
      recordIntervalRef.current = setInterval(() => {
        setRecordingDuration(Math.round((Date.now() - recordStartRef.current) / 1000));
      }, 1000);
      toast.info("Recording voice... click stop when done");
    } catch {
      toast.error("Microphone access was blocked. Please check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleUploadTranscribe = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTranscribingMedia(true);
    const progressInterval = startProgressTimer();
    const toastId = toast.loading(`Uploading and transcribing "${file.name}"...`);
    try {
      const result = await transcribeFromFile(file, "faster-whisper");
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      const formatted = formatTranscriptionText(result);
      if (!formatted.trim()) {
        toast.warning("No speech detected in this media file.", { id: toastId });
        return;
      }
      setScript((prev) => (prev ? prev + "\n" + formatted : formatted));
      toast.success("Media transcribed successfully!", { id: toastId });
    } catch (err) {
      toast.error("Transcription failed", { id: toastId });
    } finally {
      clearInterval(progressInterval);
      setTranscriptionProgress(100);
      setTimeout(() => {
        setTranscriptionProgress(0);
        setTranscribingMedia(false);
      }, 500);
      e.target.value = "";
    }
  };

  const handleUrlTranscribe = async () => {
    if (!mediaUrl.trim()) return;
    setTranscribingMedia(true);
    const progressInterval = startProgressTimer();
    const toastId = toast.loading(`Processing URL transcription...`);
    try {
      const result = await transcribeFromSourceUrl(mediaUrl.trim(), "faster-whisper");
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      const formatted = formatTranscriptionText(result);
      if (!formatted.trim()) {
        toast.warning("No speech detected in this media URL.", { id: toastId });
        return;
      }
      setScript((prev) => (prev ? prev + "\n" + formatted : formatted));
      toast.success("Media transcribed successfully!", { id: toastId });
      setShowUrlInput(false);
      setMediaUrl("");
    } catch (err) {
      toast.error("Transcription failed", { id: toastId });
    } finally {
      clearInterval(progressInterval);
      setTranscriptionProgress(100);
      setTimeout(() => {
        setTranscriptionProgress(0);
        setTranscribingMedia(false);
      }, 500);
    }
  };

  const handleAiImprove = async () => {
    if (!script.trim()) return;
    setAiImproving(true);
    const toastId = toast.loading("AI is refining grammar, spelling, and removing fillers (timestamps preserved)...");
    try {
      const res = await fetch("/api/ai/improve-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (!data.ok || !data.script) {
        toast.error(data.error ?? "Failed to improve transcript", { id: toastId });
        return;
      }
      setScript(data.script);
      toast.success("Transcript improved by AI!", { id: toastId });
    } catch {
      toast.error("Network error during AI improvement", { id: toastId });
    } finally {
      setAiImproving(false);
    }
  };

  const pipelineBody = (): PipelinePreferences => ({
    source: pipelinePrefs.source,
    useExternalApis: pipelinePrefs.useExternalApis,
  });

  const buildPreviewProps = async (
    nextResolved: ResolvedEditRecipe,
    captionsOn: boolean
  ): Promise<Record<string, unknown>> => {
    if (!captionsOn) {
      return buildAutomatedVideoInputProps(nextResolved, {
        showCaptions: false,
      });
    }

    if (pipelinePrefs.source === "client") {
      return buildAutomatedVideoInputProps(nextResolved, {
        showCaptions: true,
        voiceoverUrl: "",
        captions: nextResolved.captions,
      });
    }

    setVoiceBusy(true);
    try {
      const speakText =
        nextResolved.scenes.map((s) => s.subtitleText).join(" ").trim() ||
        nextResolved.title;
      const voiceResult = await fetchCaptionVoiceover(speakText);
      return buildAutomatedVideoInputProps(nextResolved, {
        showCaptions: true,
        voiceoverUrl: voiceResult?.url ?? nextResolved.voiceoverUrl,
        captions: voiceResult?.captions && voiceResult.captions.length > 0
          ? voiceResult.captions
          : nextResolved.captions,
      });
    } finally {
      setVoiceBusy(false);
    }
  };

  const applyResolved = async (
    nextRecipe: EditRecipe,
    nextResolved: ResolvedEditRecipe,
    inputProps?: Record<string, unknown>,
    mode?: string,
    captionsOn = showCaptions
  ) => {
    const project = createProjectFromEditRecipe(nextResolved, brand, {
      script: script.trim(),
    });
    addProject(project);
    setRecipe(nextRecipe);
    setResolved(nextResolved);
    setProjectId(project.id);
    const props =
      inputProps ?? (await buildPreviewProps(nextResolved, captionsOn));
    setPreviewProps(props);
    setDurationInFrames(project.durationInFrames);
    setWidth(project.width);
    setHeight(project.height);
    if (mode) setBreakdownMode(mode);
    setStep(3);
  };

  const runBreakdown = async () => {
    if (script.trim().length < 10) {
      toast.error("Write at least a few sentences for your script");
      return;
    }
    setLoading(true);
    try {
      if (pipelinePrefs.source === "client") {
        const nextRecipe = localBreakdown(script.trim(), aspectRatio);
        setRecipe(nextRecipe);
        setBreakdownMode("local");
        setStep(2);
        toast.success("Edit recipe ready (client-side)");
        return;
      }

      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: script.trim(),
          aspectRatio,
          ...pipelineBody(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        recipe?: EditRecipe;
        mode?: string;
        error?: string;
      };
      if (!data.ok || !data.recipe) {
        toast.error(data.error ?? "Could not break down script");
        return;
      }
      setRecipe(data.recipe);
      setBreakdownMode(data.mode ?? "unknown");
      setStep(2);
      toast.success("Edit recipe ready");
    } catch {
      toast.error("Breakdown request failed");
    } finally {
      setLoading(false);
    }
  };

  const resolveAndPreview = async () => {
    if (!recipe) return;
    setLoading(true);
    try {
      if (pipelinePrefs.source === "client") {
        const nextResolved = resolveEditRecipeLocal(recipe, {
          accent: brand.colors.accent,
          brandColor: brand.colors.primary,
          fontFamily: brand.fontFamily,
        });
        await applyResolved(recipe, nextResolved, undefined, "local");
        toast.success(
          showCaptions
            ? "Preview ready — captions on with voice"
            : "Preview ready — captions off"
        );
        return;
      }

      const res = await fetch("/api/assets/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe,
          accent: brand.colors.accent,
          brandColor: brand.colors.primary,
          fontFamily: brand.fontFamily,
          ...pipelineBody(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        resolved?: ResolvedEditRecipe;
        error?: string;
      };
      if (!data.ok || !data.resolved) {
        toast.error(data.error ?? "Could not resolve assets");
        return;
      }

      await applyResolved(
        recipe,
        data.resolved,
        undefined,
        breakdownMode ?? undefined
      );
      toast.success("Assets fetched — preview ready");
    } catch {
      toast.error("Asset resolution failed");
    } finally {
      setLoading(false);
    }
  };

  const generateAll = async () => {
    if (script.trim().length < 10) {
      toast.error("Write at least a few sentences for your script");
      return;
    }
    setLoading(true);
    try {
      if (pipelinePrefs.source === "client") {
        const nextRecipe = localBreakdown(script.trim(), aspectRatio);
        const nextResolved = resolveEditRecipeLocal(nextRecipe, {
          accent: brand.colors.accent,
          brandColor: brand.colors.primary,
          fontFamily: brand.fontFamily,
        });
        await applyResolved(nextRecipe, nextResolved, undefined, "local");
        toast.success(
          showCaptions
            ? "Video ready — captions + voice on"
            : "Video ready — turn on captions below if you want words & speech"
        );
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: script.trim(),
          aspectRatio,
          accent: brand.colors.accent,
          brandColor: brand.colors.primary,
          fontFamily: brand.fontFamily,
          ...pipelineBody(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        recipe?: EditRecipe;
        resolved?: ResolvedEditRecipe;
        inputProps?: Record<string, unknown>;
        durationInFrames?: number;
        width?: number;
        height?: number;
        breakdownMode?: string;
        error?: string;
      };
      if (!data.ok || !data.resolved) {
        toast.error(data.error ?? "Generation failed");
        return;
      }

      // Rebuild props so caption toggle + real TTS are respected
      await applyResolved(
        data.recipe ?? recipe!,
        data.resolved,
        undefined,
        data.breakdownMode ?? undefined
      );
      toast.success("Video generated — preview and export below");
    } catch {
      toast.error("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  /** Primary AI video path: Google Veo (async). Remotion stock stays available above. */
  const generateWithVeo = async () => {
    if (script.trim().length < 8) {
      toast.error("Enter a prompt or script first");
      return;
    }
    veoAbortRef.current?.abort();
    const ac = new AbortController();
    veoAbortRef.current = ac;
    setVeoBusy(true);
    setVeoVideoUrl(null);
    setVeoJob(null);
    setVeoProgressLabel(VEO_STAGE_LABELS.preparing);
    setStep(3);
    try {
      const job = await generateVideoWithVeo({
        prompt: script.trim(),
        aspectRatio,
        signal: ac.signal,
        onProgress: (j, label) => {
          setVeoJob(j);
          setVeoProgressLabel(label);
        },
      });
      setVeoJob(job);
      if (job.videoUrl) {
        setVeoVideoUrl(job.videoUrl);
        toast.success("Veo video ready");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Veo generation failed";
      toast.error(msg);
      setVeoProgressLabel(msg);
    } finally {
      setVeoBusy(false);
    }
  };

  const copyVeoUrl = async () => {
    if (!veoVideoUrl) return;
    const absolute =
      typeof window !== "undefined"
        ? new URL(veoVideoUrl, window.location.origin).toString()
        : veoVideoUrl;
    try {
      await navigator.clipboard.writeText(absolute);
      toast.success("Video URL copied");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const shareVeo = async () => {
    if (!veoVideoUrl) return;
    const absolute =
      typeof window !== "undefined"
        ? new URL(veoVideoUrl, window.location.origin).toString()
        : veoVideoUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Framekit video",
          url: absolute,
        });
        return;
      } catch {
        /* fall through */
      }
    }
    await copyVeoUrl();
  };

  const toggleCaptions = async (on: boolean) => {
    setShowCaptions(on);
    if (!resolved) return;
    setLoading(true);
    try {
      const props = await buildPreviewProps(resolved, on);
      setPreviewProps(props);
      toast.success(
        on
          ? "Captions on — speaking your script"
          : "Captions off — no on-screen words or voice"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSceneField = (
    index: number,
    field: keyof EditRecipe["scenes"][number],
    value: string | number
  ) => {
    if (!recipe) return;
    const scenes = recipe.scenes.map((scene, i) =>
      i === index ? { ...scene, [field]: value } : scene
    );
    setRecipe({ ...recipe, scenes });
  };
  const hasTimestamps = !!script.match(/\[\d{1,2}:\d{2}/);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Script to Video</h1>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paste your story. We turn it into scenes with matching pictures.
          Captions and spoken voice only appear when you turn them on.
        </p>
        <ScriptStepIndicator current={step} />
      </div>

      <PipelineSettings value={pipelinePrefs} onChange={setPipelinePrefs} />

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-border/50 bg-card/45 backdrop-blur-md p-5 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="script" className="text-sm font-semibold">Your script</Label>
                <div className="flex items-center gap-1.5">
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    className="hidden"
                    onChange={handleUploadTranscribe}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={transcribingMedia || loading}
                    onClick={() => uploadInputRef.current?.click()}
                    className="h-8 gap-1.5 text-[11px] font-medium"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Video/Audio
                  </Button>
                  <Button
                    type="button"
                    variant={recording ? "destructive" : "outline"}
                    size="sm"
                    disabled={transcribingMedia || loading}
                    onClick={recording ? stopRecording : startRecording}
                    className="h-8 gap-1.5 text-[11px] font-medium"
                  >
                    <Mic className={cn("h-3.5 w-3.5", recording && "animate-pulse")} />
                    {recording ? `Stop (${recordingDuration}s)` : "Record Voice"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={transcribingMedia || loading}
                    onClick={() => setShowUrlInput((prev) => !prev)}
                    className={cn("h-8 gap-1.5 text-[11px] font-medium", showUrlInput && "bg-accent")}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Paste URL
                  </Button>
                </div>
              </div>
              {showUrlInput && (
                <div className="flex items-center gap-1.5 mt-1 pb-1">
                  <Input
                    type="text"
                    placeholder="Enter audio/video URL (e.g., https://example.com/podcast.mp3)"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    disabled={transcribingMedia}
                    className="h-8 text-xs flex-1 bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUrlTranscribe}
                    disabled={transcribingMedia || !mediaUrl.trim()}
                    className="h-8 text-xs"
                  >
                    Transcribe
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUrlInput(false);
                      setMediaUrl("");
                    }}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {hasTimestamps && (
                <div className="flex flex-col gap-2 p-3.5 rounded-lg border border-primary/20 bg-primary/5 shadow-[0_0_12px_rgba(59,130,246,0.06)] mt-1.5 mb-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Transcript Editor Active
                    </span>
                    <Button
                      type="button"
                      variant="glow"
                      size="sm"
                      disabled={aiImproving || loading}
                      onClick={handleAiImprove}
                      className="h-7 text-[11px] gap-1 px-2.5 font-semibold bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                    >
                      {aiImproving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      )}
                      AI Improve (Grammar Only)
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    <strong className="text-foreground/90">Option 1 (Manual Edit):</strong> Adjust the text or timestamps manually below. <br />
                    <strong className="text-foreground/90">Option 2 (AI Improve):</strong> Click the button above to auto-fix spelling, grammar, and remove fillers without changing the meaning.
                  </p>
                </div>
              )}
              <Textarea
                id="script"
                rows={10}
                placeholder={EXAMPLE_SCRIPT}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                disabled={transcribingMedia}
                className="border-border/50 bg-background/50 text-sm"
              />
              {transcribingMedia && (
                <div className="space-y-2 py-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      Transcribing media with Faster Whisper...
                    </span>
                    <span className="font-semibold">{transcriptionProgress}%</span>
                  </div>
                  <Progress value={transcriptionProgress} className="h-1.5 w-full" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Use tags like [WHOOSH EFFECT] or [DING EFFECT] for sound cues.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Aspect ratio</Label>
              <Select
                value={aspectRatio}
                onValueChange={(v) =>
                  setAspectRatio(v as "16:9" | "9:16" | "1:1")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["16:9", "9:16", "1:1"] as const).map((r) => (
                    <SelectItem key={r} value={r}>
                      {r} · {ASPECT_PRESETS[r]?.label ?? r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="show-captions" className="text-sm font-medium">
                  Captions + speak my script
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Off = picture only. On = show words on screen and speak them
                  out loud.
                </p>
              </div>
              <Switch
                id="show-captions"
                checked={showCaptions}
                onCheckedChange={setShowCaptions}
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="glow"
                size="sm"
                onClick={() => void generateWithVeo()}
                disabled={loading || veoBusy || aiImproving}
              >
                {veoBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate with Veo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={runBreakdown}
                disabled={loading || veoBusy || aiImproving}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {hasTimestamps ? "Approve & Plan Scenes" : "Remotion breakdown"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void generateAll()}
                disabled={loading || veoBusy || aiImproving}
              >
                {hasTimestamps ? "Approve & Generate Video" : "Remotion 1-click"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/25 backdrop-blur-sm p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground/90">How it works</h2>
            <ol className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
                <span>
                  <strong className="text-foreground">Generate with Veo</strong> —
                  Google AI creates a real video from your prompt (needs{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-[10px]">GOOGLE_API_KEY</code>).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
                <span>
                  <strong className="text-foreground">Remotion breakdown</strong> —
                  splits your script into timed scenes with stock pictures.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
                <span>
                  <strong className="text-foreground">Captions toggle</strong> —
                  optional on-screen words + spoken voice for Remotion previews.
                </span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {step === 2 && recipe && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{recipe.scenes.length} scenes</Badge>
            {breakdownMode && (
              <Badge variant="outline">
                {pipelinePrefs.source === "client" ? "Client" : "Server"} ·{" "}
                {breakdownMode}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              Back to script
            </Button>
          </div>

          <div className="space-y-3">
            {recipe.scenes.map((scene, index) => (
              <div
                key={scene.id}
                className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Scene {index + 1} · frame {scene.startFrame}
                  </Label>
                  <Textarea
                    rows={2}
                    value={scene.subtitleText}
                    onChange={(e) =>
                      updateSceneField(index, "subtitleText", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Stock keyword</Label>
                    <Textarea
                      rows={1}
                      value={scene.stockVideoKeyword}
                      onChange={(e) =>
                        updateSceneField(
                          index,
                          "stockVideoKeyword",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Sound effect</Label>
                    <Textarea
                      rows={1}
                      value={scene.soundEffect ?? ""}
                      onChange={(e) =>
                        updateSceneField(index, "soundEffect", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="glow" onClick={resolveAndPreview} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Film className="h-4 w-4" />
            )}
            Step 2: Fetch assets & preview
          </Button>
        </div>
      )}

      {(step === 3 || veoBusy || veoVideoUrl) && (
        <div className="space-y-4">
          {(veoBusy || veoJob || veoVideoUrl) && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-xl border bg-black">
                {veoVideoUrl ? (
                  <video
                    key={veoVideoUrl}
                    src={veoVideoUrl}
                    controls
                    playsInline
                    className="aspect-video w-full bg-black"
                  />
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-zinc-950 p-6 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-white">
                      {veoProgressLabel || "Preparing…"}
                    </p>
                    <Progress
                      value={veoJob?.progress ?? 8}
                      className="h-2 w-full max-w-xs"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Google Veo</h2>
                  <p className="text-sm text-muted-foreground">
                    {veoBusy
                      ? veoProgressLabel
                      : veoVideoUrl
                        ? "Your AI video is ready"
                        : "Generate from your script"}
                  </p>
                </div>
                {veoBusy && (
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {(
                      [
                        "preparing",
                        "sending",
                        "generating",
                        "rendering",
                        "finalizing",
                        "complete",
                      ] as const
                    ).map((stage) => (
                      <li
                        key={stage}
                        className={cn(
                          veoJob?.stage === stage ||
                            (stage === "complete" && veoJob?.status === "completed")
                            ? "font-medium text-primary"
                            : ""
                        )}
                      >
                        {VEO_STAGE_LABELS[stage]}
                      </li>
                    ))}
                  </ul>
                )}
                {veoVideoUrl && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="glow" asChild>
                      <a href={veoVideoUrl} download>
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      disabled={veoBusy}
                      onClick={() => void generateWithVeo()}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button variant="outline" onClick={() => void copyVeoUrl()}>
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </Button>
                    <Button variant="ghost" onClick={() => void shareVeo()}>
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && resolved && projectId && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border bg-black">
            <TemplatePreview
              playerRef={playerRef}
              compositionId="AutomatedVideo"
              inputProps={previewProps}
              durationInFrames={durationInFrames}
              width={width}
              height={height}
              fps={30}
              className="w-full"
            />
            {pipelinePrefs.source === "client" && (
              <LocalSpeechPreview
                playerRef={playerRef}
                enabled={showCaptions}
                captions={previewProps.captions as any[]}
                fps={30}
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{resolved.title}</h2>
              <p className="text-sm text-muted-foreground">
                {resolved.scenes.length} scenes · {Math.round(durationInFrames / 30)}s
              </p>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-lg border bg-card p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  Captions + speak my script
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  {showCaptions
                    ? "Words on screen and a spoken voice of your script."
                    : "Hidden — picture and music only."}
                </p>
              </div>
              <Switch
                checked={showCaptions}
                disabled={loading || voiceBusy}
                onCheckedChange={(on) => void toggleCaptions(on)}
              />
            </div>
            {(loading || voiceBusy) && showCaptions && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Making spoken voice for your captions…
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <ExportVideoButton
                projectId={projectId}
                projectName={resolved.title}
                compositionId="AutomatedVideo"
                inputProps={previewProps}
                aspectRatio={resolved.aspectRatio}
                trigger={
                  <Button variant="glow">
                    <Download className="h-4 w-4" />
                    Export MP4
                  </Button>
                }
              />
              <Button variant="outline" asChild>
                <Link href="/exports">
                  View exports
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)}>
                New script
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LocalSpeechPreview({
  playerRef,
  enabled,
  captions,
  fps = 30,
}: {
  playerRef: React.RefObject<any>;
  enabled: boolean;
  captions?: any[];
  fps?: number;
}) {
  const spokenClipRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis || !playerRef.current) {
      return;
    }

    const player = playerRef.current;

    const handleFrameUpdate = () => {
      const frame = player.getCurrentFrame();
      const isPlaying = player.isPlaying();
      const didSeek = Math.abs(frame - lastFrameRef.current) > 4;
      lastFrameRef.current = frame;
      
      if (!isPlaying) {
        window.speechSynthesis.cancel();
        spokenClipRef.current = null;
        return;
      }

      if (didSeek) {
        window.speechSynthesis.cancel();
        spokenClipRef.current = null;
      }

      const timeMs = (frame / fps) * 1000;

      // Find active caption segment
      const activeIndex = captions?.findIndex((c) => {
        return timeMs >= c.startMs && timeMs < c.endMs;
      });

      if (activeIndex === undefined || activeIndex === -1) {
        if (spokenClipRef.current !== null) {
          window.speechSynthesis.cancel();
          spokenClipRef.current = null;
        }
        return;
      }

      if (spokenClipRef.current === activeIndex) return;

      window.speechSynthesis.cancel();
      spokenClipRef.current = activeIndex;
      
      const activeCaption = captions?.[activeIndex];
      const text = activeCaption?.text;
      if (!text) return;

      const segmentStartMs = activeCaption.startMs;
      const elapsedMsInSegment = Math.max(0, timeMs - segmentStartMs);
      
      const words = text.split(/\s+/).filter(Boolean);
      const segmentDurationMs = activeCaption.endMs - segmentStartMs;
      const wordDurationMs = segmentDurationMs / Math.max(1, words.length);
      const passedWordsCount = Math.floor(elapsedMsInSegment / wordDurationMs);

      const remainingWords = words.slice(passedWordsCount);
      const textToSpeak = remainingWords.join(" ").trim();
      if (!textToSpeak) return;

      const utter = new SpeechSynthesisUtterance(textToSpeak);

      // Calibrate speech speed to complete exactly within the remaining segment duration
      const remainingSec = (segmentDurationMs - elapsedMsInSegment) / 1000;
      if (remainingSec > 0.5) {
        const targetWpm = (remainingWords.length / remainingSec) * 60;
        // Normal speed is ~140 WPM. Clamp rate between 0.85 and 1.8.
        const rate = Math.min(1.8, Math.max(0.85, targetWpm / 140));
        utter.rate = rate;
      } else {
        utter.rate = 1.0;
      }

      window.speechSynthesis.speak(utter);
    };

    const handlePlay = () => {
      spokenClipRef.current = null;
    };

    const handlePause = () => {
      window.speechSynthesis.cancel();
      spokenClipRef.current = null;
    };

    player.addEventListener("frameupdate", handleFrameUpdate);
    player.addEventListener("play", handlePlay);
    player.addEventListener("pause", handlePause);

    return () => {
      player.removeEventListener("frameupdate", handleFrameUpdate);
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("pause", handlePause);
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, [enabled, captions, fps, playerRef]);

  return null;
}
