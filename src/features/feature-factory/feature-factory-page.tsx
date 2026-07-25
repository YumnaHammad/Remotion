"use client";

import { useCallback, useRef, useState } from "react";
import {
  Film,
  Loader2,
  Map,
  Mic2,
  Sparkles,
  Upload,
  User,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { extractPuppetLandmarks } from "@/lib/mediapipe-puppet";
import { captionsToVisemes } from "@/lib/visemes";
import { defaultCityCameraPath } from "@/lib/camera-path";
import { resolveStoryLook } from "@/lib/story-look";
import { aspectRatioToDimensions } from "@/types/edit-recipe";
import type { CharacterMapVideoProps } from "@/types/feature-stack";
import { DEFAULT_CHARACTER_MAP_PROPS } from "@/remotion/compositions/character-map-schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const EXAMPLE =
  "Welcome to the city. Tonight we fly between the towers and tell your story with a cartoon guide.";

type Route = "script" | "reference";

function localScriptProps(
  script: string,
  opts: {
    title: string;
    aspectRatio: "16:9" | "9:16" | "1:1";
    accent: string;
    brandColor: string;
    showMap: boolean;
    showCharacter: boolean;
    characterPrompt: string;
    worldPrompt: string;
  }
): { props: CharacterMapVideoProps; durationInFrames: number } {
  const words = script
    .replace(/\[[^\]]+\]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  let t = 0;
  const captions = words.map((text) => {
    const startMs = t;
    const endMs = t + 280;
    t = endMs + 40;
    return {
      text,
      startMs,
      endMs,
      timestampMs: Math.round((startMs + endMs) / 2),
      confidence: 1 as number | null,
    };
  });
  const visemes = captionsToVisemes(captions);
  const durationHintFrames = Math.max(
    90,
    Math.ceil((Math.max(...captions.map((c) => c.endMs), 1000) / 1000) * 30) +
      45
  );
  const look = resolveStoryLook({
    characterPrompt: opts.characterPrompt,
    worldPrompt: opts.worldPrompt,
    script,
    accent: opts.accent,
    brandColor: opts.brandColor,
  });
  const props: CharacterMapVideoProps = {
    title: opts.title,
    accent: look.character.accent,
    brandColor: look.character.shirt,
    aspectRatio: opts.aspectRatio,
    voiceoverUrl: "https://remotion.media/dialogue.wav",
    backgroundMusicUrl: "https://remotion.media/audio.mp3",
    captions,
    visemes,
    route: "script",
    showMap: opts.showMap,
    showCharacter: opts.showCharacter,
    mapSeed: look.map.seed,
    cameraPath: defaultCityCameraPath(durationHintFrames),
    durationHintFrames,
    characterLook: look.character,
    mapLook: look.map,
  };
  return { props, durationInFrames: durationHintFrames };
}

export function FeatureFactoryPage() {
  const { brand } = useBrandKit();
  const fileRef = useRef<HTMLInputElement>(null);

  const [route, setRoute] = useState<Route>("script");
  const [script, setScript] = useState(EXAMPLE);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">(
    "9:16"
  );
  const [showMap, setShowMap] = useState(true);
  const [showCharacter, setShowCharacter] = useState(true);
  const [characterPrompt, setCharacterPrompt] = useState(
    "friendly cartoon guide in a blue jacket"
  );
  const [worldPrompt, setWorldPrompt] = useState(
    "night city with tall towers"
  );
  const [busy, setBusy] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [props, setProps] = useState<CharacterMapVideoProps | null>(null);
  const [durationInFrames, setDurationInFrames] = useState(150);
  const [meta, setMeta] = useState<{
    lipsyncEngine?: string;
    voiceMode?: string;
  }>({});

  const dims = aspectRatioToDimensions(aspectRatio);

  const generateScript = useCallback(async () => {
    if (!script.trim()) {
      toast.error("Enter a script first");
      return;
    }
    setBusy(true);
    setProgressMsg("Generating voice, visemes, captions, map…");
    try {
      const res = await fetch("/api/feature-stack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: "script",
          script,
          title: brand.name || "City Story",
          aspectRatio,
          accent: brand.colors?.accent || brand.colors?.primary || "#0b84f3",
          brandColor: brand.colors?.primary || "#1e3a5f",
          showMap,
          showCharacter,
          mapSeed: 42,
          characterPrompt,
          worldPrompt,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        props?: CharacterMapVideoProps;
        durationInFrames?: number;
        lipsyncEngine?: string;
        voiceMode?: string;
      };
      if (!res.ok || !data.ok || !data.props) {
        throw new Error(data.error ?? "Generate failed");
      }
      setProps(data.props);
      setDurationInFrames(data.durationInFrames ?? 150);
      setMeta({
        lipsyncEngine: data.lipsyncEngine,
        voiceMode: data.voiceMode,
      });
      toast.success("Ready — look updated from your prompts");
    } catch (err) {
      // Always-working offline fallback: procedural map + lip-sync from script timing
      const local = localScriptProps(script, {
        title: brand.name || "City Story",
        aspectRatio,
        accent: brand.colors?.accent || brand.colors?.primary || "#0b84f3",
        brandColor: brand.colors?.primary || "#1e3a5f",
        showMap,
        showCharacter,
        characterPrompt,
        worldPrompt,
      });
      setProps(local.props);
      setDurationInFrames(local.durationInFrames);
      setMeta({ lipsyncEngine: "caption-map", voiceMode: "local" });
      toast.message(
        err instanceof Error
          ? `Server generate failed (${err.message}) — using local stack`
          : "Using local feature stack"
      );
    } finally {
      setBusy(false);
      setProgressMsg("");
    }
  }, [script, aspectRatio, brand, showMap, showCharacter, characterPrompt, worldPrompt]);

  const generateReference = useCallback(
    async (file: File) => {
      setBusy(true);
      setProgressMsg("Extracting face & pose with MediaPipe…");
      try {
        const landmarks = await extractPuppetLandmarks(file, {
          fps: 12,
          maxFrames: 240,
          onProgress: (pct, message) =>
            setProgressMsg(`${message} (${pct}%)`),
        });

        setProgressMsg("Building captions, visemes & Remotion props…");
        const form = new FormData();
        form.append("route", "reference");
        form.append("file", file);
        form.append("landmarks", JSON.stringify(landmarks));
        form.append("title", brand.name || "Reference Puppet");
        form.append("aspectRatio", aspectRatio);
        form.append(
          "accent",
          brand.colors?.accent || brand.colors?.primary || "#0b84f3"
        );
        form.append("brandColor", brand.colors?.primary || "#1e3a5f");
        form.append("showMap", showMap ? "1" : "0");
        form.append("showCharacter", showCharacter ? "1" : "0");

        const res = await fetch("/api/feature-stack/generate", {
          method: "POST",
          body: form,
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          props?: CharacterMapVideoProps;
          durationInFrames?: number;
        };
        if (!res.ok || !data.ok || !data.props) {
          throw new Error(data.error ?? "Reference generate failed");
        }
        setProps(data.props);
        setDurationInFrames(data.durationInFrames ?? 150);
        setMeta({});
        toast.success(
          `Puppet ready — ${landmarks.length} landmark frames retargeted`
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Reference pipeline failed"
        );
      } finally {
        setBusy(false);
        setProgressMsg("");
      }
    },
    [aspectRatio, brand, showMap, showCharacter]
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 pb-16">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> Feature Factory
          </Badge>
          <Badge variant="outline">Map · Character · Lip-sync · Captions</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Make a story video
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Write what your guide says, describe how they look, and describe the
          3D place. We build voice, captions, character, and a matching world.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={route === "script" ? "default" : "outline"}
          onClick={() => setRoute("script")}
          className="gap-2"
        >
          <Mic2 className="h-4 w-4" /> Script route
        </Button>
        <Button
          variant={route === "reference" ? "default" : "outline"}
          onClick={() => setRoute("reference")}
          className="gap-2"
        >
          <User className="h-4 w-4" /> Reference (premium)
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aspect</Label>
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
                  <SelectItem value="9:16">9:16 Vertical</SelectItem>
                  <SelectItem value="16:9">16:9 Landscape</SelectItem>
                  <SelectItem value="1:1">1:1 Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Map className="h-3.5 w-3.5" /> 3D map
                </Label>
                <Switch checked={showMap} onCheckedChange={setShowMap} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <User className="h-3.5 w-3.5" /> Character
                </Label>
                <Switch
                  checked={showCharacter}
                  onCheckedChange={setShowCharacter}
                />
              </div>
            </div>
          </div>

          {route === "script" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>What they say (script)</Label>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={5}
                  className="resize-y"
                  placeholder="Welcome to the city…"
                />
              </div>

              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <Label className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Character look (prompt)
                </Label>
                <Textarea
                  value={characterPrompt}
                  onChange={(e) => setCharacterPrompt(e.target.value)}
                  rows={2}
                  className="resize-y"
                  placeholder="robot with silver skin, red jacket…"
                />
                <p className="text-[11px] text-muted-foreground">
                  Try: robot, wizard, hero, blue jacket, blonde hair, small kid…
                </p>
              </div>

              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <Label className="flex items-center gap-1.5">
                  <Map className="h-3.5 w-3.5" />
                  3D world (prompt)
                </Label>
                <Textarea
                  value={worldPrompt}
                  onChange={(e) => setWorldPrompt(e.target.value)}
                  rows={2}
                  className="resize-y"
                  placeholder="neon futuristic city at night…"
                />
                <p className="text-[11px] text-muted-foreground">
                  Try: night city, neon, desert, forest, ocean, snow, space,
                  tall towers…
                </p>
              </div>

              <Button
                disabled={busy}
                onClick={() => void generateScript()}
                className="w-full gap-2"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Create video from my story
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Upload reference video of yourself</Label>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void generateReference(f);
                }}
              />
              <Button
                disabled={busy}
                variant="outline"
                className="w-full gap-2"
                onClick={() => fileRef.current?.click()}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload & puppet character
              </Button>
              <p className="text-xs text-muted-foreground">
                Face + pose landmarks run in your browser via MediaPipe, then
                retarget onto the cartoon/Rive rig over the 3D city.
              </p>
            </div>
          )}

          {progressMsg && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {progressMsg}
            </p>
          )}

          <ul className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            {[
              "3D world from your place prompt",
              "Character look from your look prompt",
              "Lip-sync mouth shapes",
              "Spoken voiceover",
              "Karaoke captions",
              "Optional: film yourself to puppet (Reference)",
            ].map((item) => (
              <li
                key={item}
                className="rounded-md border bg-muted/40 px-2.5 py-1.5"
              >
                {item}
              </li>
            ))}
          </ul>

          {props?.characterLook && (
            <p className="text-xs text-muted-foreground">
              Look: <strong>{props.characterLook.label}</strong>
              {props.mapLook ? (
                <>
                  {" "}
                  · Place: <strong>{props.mapLook.label}</strong>
                </>
              ) : null}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div
            className={cn(
              "overflow-hidden rounded-xl border bg-black",
              aspectRatio === "9:16" && "mx-auto max-w-[320px]"
            )}
          >
            <TemplatePreview
              compositionId="CharacterMapVideo"
              inputProps={
                (props ?? DEFAULT_CHARACTER_MAP_PROPS) as unknown as Record<
                  string,
                  unknown
                >
              }
              durationInFrames={durationInFrames}
              width={dims.width}
              height={dims.height}
              fps={30}
            />
          </div>

          {props && (
            <div className="flex flex-wrap items-center gap-2">
              <ExportVideoButton
                projectId={`feature-${Date.now()}`}
                projectName={props.title}
                compositionId="CharacterMapVideo"
                inputProps={props as unknown as Record<string, unknown>}
                aspectRatio={aspectRatio}
              />
              {meta.lipsyncEngine && (
                <Badge variant="outline">lipsync: {meta.lipsyncEngine}</Badge>
              )}
              {meta.voiceMode && (
                <Badge variant="outline">voice: {meta.voiceMode}</Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <Film className="h-3 w-3" /> {props.visemes?.length ?? 0} visemes
              </Badge>
              {(props.landmarks?.length ?? 0) > 0 && (
                <Badge variant="outline">
                  {props.landmarks?.length} puppet frames
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
