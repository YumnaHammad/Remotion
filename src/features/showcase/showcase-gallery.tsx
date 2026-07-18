"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, ExternalLink, Play, Search } from "lucide-react";
import {
  TEMPLATE_CATALOG,
  TEMPLATE_CATEGORIES,
  type TemplateCatalogItem,
  type TemplateCategory,
} from "@/templates/catalog";
import { LazyTemplatePreview } from "@/features/showcase/lazy-template-preview";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import {
  buildTemplateProps,
  createProjectFromTemplate,
} from "@/utils/video-project-factory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function ShowcaseGallery() {
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

  const pick = (template: TemplateCatalogItem) => {
    const project = createProjectFromTemplate(template, brand, {
      title: template.name,
      subtitle: "Customize in the editor",
    });
    addProject(project);
    toast.success(`${template.name} added to your videos`);
    router.push(`/create/${project.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search showcase…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as TemplateCategory | "All")}
        >
          <TabsList className="h-auto max-w-full flex-wrap justify-start">
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

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <ShowcaseCard key={t.id} template={t} brand={brand} onUse={() => pick(t)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No templates match your search.
        </div>
      )}
    </div>
  );
}

function ShowcaseCard({
  template: t,
  brand,
  onUse,
}: {
  template: TemplateCatalogItem;
  brand: ReturnType<typeof useBrandKit>["brand"];
  onUse: () => void;
}) {
  const previewProps = buildTemplateProps(brand, {
    title: t.name,
    subtitle: t.description.slice(0, 60),
  });

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <Link href={`/showcase/${t.id}`} className="relative block">
        <LazyTemplatePreview
          compositionId={t.compositionId}
          inputProps={previewProps as unknown as Record<string, unknown>}
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {t.official && (
            <Badge className="bg-[#0b84f3]/90 text-[10px] text-white hover:bg-[#0b84f3]/90">
              Studio
            </Badge>
          )}
          {t.popular && (
            <Badge variant="secondary" className="text-[10px]">
              Popular
            </Badge>
          )}
          {t.premium && (
            <Badge className="bg-amber-500/90 text-[10px] text-black">
              <Crown className="mr-0.5 h-3 w-3" /> Pro
            </Badge>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link
            href={`/showcase/${t.id}`}
            className="font-medium hover:text-primary"
          >
            {t.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {t.description}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {t.category} · {t.aspectRatio} · {Math.round(t.durationInFrames / t.fps)}s
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <Button size="sm" className="flex-1 sm:flex-none" onClick={onUse}>
            Use template
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/showcase/${t.id}`}>Preview</Link>
          </Button>
          {t.remotionUrl && (
            <Button asChild size="icon" variant="ghost" className="h-8 w-8 shrink-0">
              <a href={t.remotionUrl} target="_blank" rel="noreferrer" title="Source">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
