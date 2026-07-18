"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import { createProjectFromTemplate } from "@/utils/video-project-factory";
import { ProjectThumb } from "@/components/shared/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/** Template gallery — starts the simple create workflow (no timeline editor). */
export function TemplateGalleryFeature() {
  const router = useRouter();
  const { brand } = useBrandKit();
  const addProject = useSimpleVideoStore((s) => s.addProject);

  const pick = (templateId: string) => {
    const tpl = TEMPLATE_CATALOG.find((t) => t.id === templateId);
    if (!tpl) return;
    const project = createProjectFromTemplate(tpl, brand, {
      title: tpl.name,
      subtitle: "Edit this text in the next step",
    });
    addProject(project);
    toast.success(`${tpl.name} selected`);
    router.push(`/create/${project.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Pick a style, customize text and colors, then export — no timeline
          required.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_CATALOG.map((t) => (
          <div
            key={t.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/30"
          >
            <ProjectThumb gradient={t.thumbnail} className="aspect-video">
              {t.popular && (
                <Badge className="absolute left-2 top-2">Popular</Badge>
              )}
            </ProjectThumb>
            <div className="space-y-3 p-4">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {t.aspectRatio} · {Math.round(t.durationInFrames / t.fps)}s
                </span>
                <Button size="sm" onClick={() => pick(t.id)}>
                  Use template
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need advanced editing?{" "}
        <Link href="/projects" className="text-primary underline-offset-2 hover:underline">
          Open timeline projects
        </Link>
      </p>
    </div>
  );
}
