"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, ExternalLink, Search } from "lucide-react";
import {
  TEMPLATE_CATALOG,
  TEMPLATE_CATEGORIES,
  type TemplateCatalogItem,
  type TemplateCategory,
} from "@/templates/catalog";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import { createProjectFromTemplate } from "@/utils/video-project-factory";
import { ProjectThumb } from "@/components/shared/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

/** Template gallery — official Remotion demos + built-in templates. */
export function TemplateGalleryFeature() {
  const router = useRouter();
  const { brand } = useBrandKit();
  const addProject = useSimpleVideoStore((s) => s.addProject);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "All">("All");

  const filtered = useMemo(() => {
    return TEMPLATE_CATALOG.filter((t) => {
      const matchCat = category === "All" || t.category === category;
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.compositionId.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  const pick = (templateId: string) => {
    const tpl = TEMPLATE_CATALOG.find((t) => t.id === templateId);
    if (!tpl) return;
    const project = createProjectFromTemplate(tpl, brand, {
      title: tpl.name,
      subtitle: tpl.official
        ? "Customize this layout in the next step"
        : "Edit this text in the next step",
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
          {TEMPLATE_CATALOG.length} professional layouts for social, product,
          podcast, and business use cases. Pick one, customize text and colors,
          preview live, export MP4.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as TemplateCategory | "All")}
        >
          <TabsList className="h-auto flex-wrap justify-start">
            <TabsTrigger value="All" className="text-xs">
              All ({TEMPLATE_CATALOG.length})
            </TabsTrigger>
            {TEMPLATE_CATEGORIES.map((c) => {
              const count = TEMPLATE_CATALOG.filter((t) => t.category === c).length;
              if (count === 0) return null;
              return (
                <TabsTrigger key={c} value={c} className="text-xs">
                  {c} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <TemplateCard key={t.id} template={t} onPick={() => pick(t.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No templates match your search.
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Need advanced editing?{" "}
        <Link href="/projects" className="text-primary underline-offset-2 hover:underline">
          Open timeline projects
        </Link>
      </p>
    </div>
  );
}

function TemplateCard({
  template: t,
  onPick,
}: {
  template: TemplateCatalogItem;
  onPick: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/30">
      <ProjectThumb gradient={t.thumbnail} className="aspect-video">
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {t.official && (
            <Badge className="bg-[#0b84f3]/90 text-white hover:bg-[#0b84f3]/90">
              Studio
            </Badge>
          )}
          {t.popular && <Badge variant="secondary">Popular</Badge>}
          {t.premium && (
            <Badge className="bg-amber-500/90 text-black">
              <Crown className="mr-1 h-3 w-3" /> Pro
            </Badge>
          )}
        </div>
      </ProjectThumb>
      <div className="space-y-3 p-4">
        <div>
          <p className="font-medium">{t.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            {t.category} · {t.aspectRatio} · {Math.round(t.durationInFrames / t.fps)}s
          </span>
          <div className="flex shrink-0 gap-1.5">
            {t.remotionUrl && (
              <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                <a href={t.remotionUrl} target="_blank" rel="noreferrer" title="View on remotion.dev">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <Button size="sm" onClick={onPick}>
              Use template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
