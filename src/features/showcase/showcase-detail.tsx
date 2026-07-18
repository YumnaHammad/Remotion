"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, Download, ExternalLink } from "lucide-react";
import { TemplatePreview } from "@/features/shared/template-preview";
import { ExportVideoButton } from "@/features/shared/export-video-button";
import { getTemplateById, type TemplateCatalogItem } from "@/templates/catalog";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import {
  buildTemplateProps,
  createProjectFromTemplate,
} from "@/utils/video-project-factory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ShowcaseDetail({ template }: { template: TemplateCatalogItem }) {
  const router = useRouter();
  const { brand } = useBrandKit();
  const addProject = useSimpleVideoStore((s) => s.addProject);

  const previewProps = buildTemplateProps(brand, {
    title: template.name,
    subtitle: template.description.slice(0, 80),
  });

  const inputProps = previewProps as unknown as Record<string, unknown>;

  const useTemplate = () => {
    const project = createProjectFromTemplate(template, brand, {
      title: template.name,
      subtitle: "Customize in the editor",
    });
    addProject(project);
    toast.success(`${template.name} selected`);
    router.push(`/create/${project.id}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/showcase">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to showcase
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-black/90 p-3 sm:p-4">
          <TemplatePreview
            compositionId={template.compositionId}
            inputProps={inputProps}
            className="mx-auto w-full max-w-3xl"
          />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {template.official && (
                <Badge className="bg-[#0b84f3]/90 text-white hover:bg-[#0b84f3]/90">
                  Studio
                </Badge>
              )}
              {template.popular && <Badge variant="secondary">Popular</Badge>}
              {template.premium && (
                <Badge className="bg-amber-500/90 text-black">
                  <Crown className="mr-1 h-3 w-3" /> Pro
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{template.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <dt className="text-[10px] uppercase text-muted-foreground">Format</dt>
              <dd className="font-medium">{template.aspectRatio}</dd>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <dt className="text-[10px] uppercase text-muted-foreground">Duration</dt>
              <dd className="font-medium">
                {Math.round(template.durationInFrames / template.fps)}s
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <dt className="text-[10px] uppercase text-muted-foreground">Category</dt>
              <dd className="font-medium">{template.category}</dd>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <dt className="text-[10px] uppercase text-muted-foreground">FPS</dt>
              <dd className="font-medium">{template.fps}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <Button variant="glow" onClick={useTemplate}>
              Use this template
            </Button>
            <ExportVideoButton
              projectId={`showcase-${template.id}`}
              projectName={template.name}
              compositionId={template.compositionId}
              inputProps={inputProps}
              trigger={
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Export MP4
                </Button>
              }
            />
            {template.remotionUrl && (
              <Button asChild variant="outline">
                <a href={template.remotionUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> View source
                </a>
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Preview uses your brand kit colors and logo. Click &quot;Use this
            template&quot; to customize text and export from the editor.
          </p>
        </aside>
      </div>
    </div>
  );
}
