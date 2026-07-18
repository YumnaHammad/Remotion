"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepIndicator } from "@/features/shared/step-indicator";
import { TemplatePreview } from "@/features/shared/template-preview";
import { ExportVideoButton } from "@/features/shared/export-video-button";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { TEMPLATE_CATALOG, getTemplateById } from "@/templates/catalog";
import { applyBrandToProps } from "@/utils/brand-defaults";
import type { VideoTemplateProps } from "@/types/video";
import { toast } from "sonner";

const FONTS = ["Inter", "Space Grotesk", "Georgia", "Arial"];

interface CreateWorkflowProps {
  projectId: string;
}

/**
 * Simple 5-step workflow — no timeline.
 * Edit title, subtitle, colors, font, music → preview → export.
 */
export function CreateWorkflow({ projectId }: CreateWorkflowProps) {
  const router = useRouter();
  const project = useSimpleVideoStore((s) => s.getProject(projectId));
  const updateProject = useSimpleVideoStore((s) => s.updateProject);
  const { brand } = useBrandKit();

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(3);

  useEffect(() => {
    if (useSimpleVideoStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useSimpleVideoStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  // Local edit state synced from project props
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [accent, setAccent] = useState(brand.colors.accent);
  const [brandColor, setBrandColor] = useState(brand.colors.primary);
  const [fontFamily, setFontFamily] = useState(brand.fontFamily);
  const [musicUrl, setMusicUrl] = useState(brand.musicUrl ?? "");

  useEffect(() => {
    if (!project) return;
    const p = project.props as VideoTemplateProps;
    setTitle(p.title ?? "");
    setSubtitle(p.subtitle ?? "");
    setAccent(p.accent ?? brand.colors.accent);
    setBrandColor(p.brandColor ?? brand.colors.primary);
    setFontFamily(p.fontFamily ?? brand.fontFamily);
    setMusicUrl(p.musicUrl ?? "");
  }, [project, brand]);

  const inputProps = useMemo((): Record<string, unknown> => {
    const base = {
      ...(project?.props ?? {}),
      title,
      subtitle,
      accent,
      brandColor,
      fontFamily,
      ...(musicUrl ? { musicUrl } : {}),
    };
    return applyBrandToProps(base as VideoTemplateProps, brand) as unknown as Record<
      string,
      unknown
    >;
  }, [project, title, subtitle, accent, brandColor, fontFamily, musicUrl, brand]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center text-sm text-muted-foreground">
        Loading project…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/templates">Pick a template</Link>
        </Button>
      </div>
    );
  }

  const templateMeta = project.templateId
    ? getTemplateById(project.templateId)
    : TEMPLATE_CATALOG.find((t) => t.compositionId === project.compositionId);

  const save = () => {
    updateProject(projectId, {
      name: title.slice(0, 80) || project.name,
      props: inputProps as unknown as VideoTemplateProps,
      status: "ready",
    });
    toast.success("Project saved");
  };

  const changeTemplate = (templateId: string) => {
    const tpl = getTemplateById(templateId);
    if (!tpl) return;
    updateProject(projectId, {
      compositionId: tpl.compositionId,
      templateId: tpl.id,
      aspectRatio: tpl.aspectRatio,
      durationInFrames: tpl.durationInFrames,
      width: tpl.width,
      height: tpl.height,
      fps: tpl.fps,
    });
    toast.success(`Switched to ${tpl.name}`);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{project.name}</h1>
            <p className="text-xs text-muted-foreground">
              {templateMeta?.name ?? project.compositionId} · Simple editor
            </p>
          </div>
        </div>
        <StepIndicator current={step} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: step controls */}
        <div className="space-y-4">
          {step === 1 && (
            <section className="space-y-3 rounded-xl border border-border bg-card p-5">
              <h2 className="font-medium">Step 1 · Template</h2>
              <div className="grid gap-2 max-h-80 overflow-auto">
                {TEMPLATE_CATALOG.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => changeTemplate(t.id)}
                    className={`rounded-lg border p-3 text-left text-sm ${
                      project.templateId === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)}>Next</Button>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-3 rounded-xl border border-border bg-card p-5">
              <h2 className="font-medium">Step 2 · Content</h2>
              <p className="text-sm text-muted-foreground">
                {project.sourceType === "website" && project.sourceUrl
                  ? `From: ${project.sourceUrl}`
                  : project.sourceType === "data"
                    ? `${project.dataRows?.length ?? 0} data rows loaded`
                    : "Edit text and colors in the next step."}
              </p>
              <Button onClick={() => setStep(3)}>Next</Button>
            </section>
          )}

          {(step === 3 || step === 4) && (
            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="font-medium">
                Step {step} · {step === 3 ? "Edit" : "Preview"}
              </h2>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Accent color</Label>
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-lg border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand color</Label>
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded-lg border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Music URL</Label>
                <Input
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  placeholder="Optional MP3 link"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" onClick={save}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button onClick={() => setStep(4)}>Preview</Button>
                <Button variant="secondary" onClick={() => setStep(5)}>
                  Go to export
                </Button>
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4 rounded-xl border border-border bg-card p-5">
              <h2 className="font-medium">Step 5 · Export</h2>
              <p className="text-sm text-muted-foreground">
                Render your video as MP4. Progress appears in Exports.
              </p>
              <ExportVideoButton
                projectId={project.id}
                projectName={title || project.name}
                compositionId={project.compositionId}
                inputProps={inputProps}
              />
              <Button asChild variant="outline">
                <Link href="/exports">View all exports</Link>
              </Button>
            </section>
          )}

          <div className="flex gap-2 text-xs">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Step {s}
              </button>
            ))}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-black/50 p-4 lg:min-h-[480px]">
          <TemplatePreview
            compositionId={project.compositionId}
            inputProps={inputProps}
            durationInFrames={project.durationInFrames}
            className="w-full max-w-xl"
          />
        </div>
      </div>
    </div>
  );
}
