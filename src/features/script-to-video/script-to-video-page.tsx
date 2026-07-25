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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
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
import { localBreakdown } from "@/lib/pipeline/local-breakdown";
import {
  buildAutomatedVideoInputProps,
  fetchCaptionVoiceoverUrl,
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
    setVoiceBusy(true);
    try {
      const speakText =
        nextResolved.scenes.map((s) => s.subtitleText).join(" ").trim() ||
        nextResolved.title;
      const voiceUrl = await fetchCaptionVoiceoverUrl(speakText);
      return buildAutomatedVideoInputProps(nextResolved, {
        showCaptions: true,
        voiceoverUrl: voiceUrl ?? nextResolved.voiceoverUrl,
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
          <div className="space-y-4 rounded-xl border bg-card p-5">
            <div className="space-y-1.5">
              <Label htmlFor="script">Your script</Label>
              <Textarea
                id="script"
                rows={10}
                placeholder={EXAMPLE_SCRIPT}
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use tags like [WHOOSH EFFECT] or [DING EFFECT] for sound cues.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Aspect ratio</Label>
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
            <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 p-3">
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
            <div className="flex flex-wrap gap-2">
              <Button
                variant="glow"
                onClick={() => void generateWithVeo()}
                disabled={loading || veoBusy}
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
                onClick={runBreakdown}
                disabled={loading || veoBusy}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Remotion breakdown
              </Button>
              <Button
                variant="ghost"
                onClick={() => void generateAll()}
                disabled={loading || veoBusy}
              >
                Remotion 1-click
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-5">
            <h2 className="mb-2 text-sm font-semibold">How it works</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Generate with Veo</strong> —
                Google AI creates a real video from your prompt (needs{" "}
                <code className="text-xs">GOOGLE_API_KEY</code>).
              </li>
              <li>
                <strong className="text-foreground">Remotion breakdown</strong> —
                splits your script into timed scenes with stock pictures.
              </li>
              <li>
                <strong className="text-foreground">Captions toggle</strong> —
                optional on-screen words + spoken voice for Remotion previews.
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
              compositionId="AutomatedVideo"
              inputProps={previewProps}
              durationInFrames={durationInFrames}
              width={width}
              height={height}
              fps={30}
              className="w-full"
            />
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
