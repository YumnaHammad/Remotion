"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Crown,
  ExternalLink,
  Flame,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import {
  TEMPLATE_CATALOG,
  TEMPLATE_CATEGORIES,
  LONG_FORM_CATEGORIES,
  type TemplateCatalogItem,
  type TemplateCategory,
} from "@/templates/catalog";
import type { LongFormCategory } from "@/types/scene-video";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import { createProjectFromTemplate } from "@/utils/video-project-factory";
import { recordRecentTemplate, getRecentTemplateIds } from "@/lib/recent-templates";
import { ProjectThumb } from "@/components/shared/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type FilterCategory = TemplateCategory | LongFormCategory | "All" | "Featured" | "Trending";

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/15 text-emerald-400",
  intermediate: "bg-amber-500/15 text-amber-400",
  advanced: "bg-rose-500/15 text-rose-400",
} as const;

/** Template marketplace — search, categories, featured, trending, recently used. */
export function TemplateGalleryFeature() {
  const router = useRouter();
  const { brand } = useBrandKit();
  const addProject = useSimpleVideoStore((s) => s.addProject);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterCategory>("All");
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentTemplateIds());
  }, []);

  const featured = useMemo(
    () => TEMPLATE_CATALOG.filter((t) => t.featured).slice(0, 6),
    []
  );
  const trending = useMemo(
    () => TEMPLATE_CATALOG.filter((t) => t.trending).slice(0, 6),
    []
  );
  const recent = useMemo(
    () =>
      recentIds
        .map((id) => TEMPLATE_CATALOG.find((t) => t.id === id))
        .filter(Boolean) as TemplateCatalogItem[],
    [recentIds]
  );

  const filtered = useMemo(() => {
    return TEMPLATE_CATALOG.filter((t) => {
      let matchCat = true;
      if (category === "Featured") matchCat = !!t.featured;
      else if (category === "Trending") matchCat = !!t.trending;
      else if (category === "All") matchCat = true;
      else if (LONG_FORM_CATEGORIES.includes(category as LongFormCategory)) {
        matchCat = t.longFormCategory === category;
      } else {
        matchCat = t.category === category;
      }

      const q = query.toLowerCase();
      const matchQ =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.longFormCategory?.toLowerCase().includes(q);

      return matchCat && matchQ;
    });
  }, [query, category]);

  const pick = (templateId: string) => {
    const tpl = TEMPLATE_CATALOG.find((t) => t.id === templateId);
    if (!tpl) return;
    const project = createProjectFromTemplate(tpl, brand, {
      title: tpl.name,
      subtitle: tpl.longForm
        ? "Customize scenes in the editor"
        : tpl.official
          ? "Customize this layout in the next step"
          : "Edit this text in the next step",
    });
    addProject(project);
    recordRecentTemplate(templateId);
    setRecentIds(getRecentTemplateIds());
    toast.success(`${tpl.name} selected`);
    router.push(`/create/${project.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Template Marketplace</h1>
        <p className="text-sm text-muted-foreground">
          {TEMPLATE_CATALOG.length} templates — short clips to 5-minute professional videos.
          Search, filter by category, and start with featured layouts.
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
      </div>

      {recent.length > 0 && category === "All" && !query && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" /> Recently used
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((t) => (
              <TemplateCard key={t.id} template={t} onPick={() => pick(t.id)} />
            ))}
          </div>
        </section>
      )}

      {category === "All" && !query && (
        <>
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Star className="h-4 w-4 text-amber-400" /> Featured templates
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((t) => (
                <TemplateCard key={t.id} template={t} onPick={() => pick(t.id)} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Flame className="h-4 w-4 text-orange-400" /> Trending
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((t) => (
                <TemplateCard key={t.id} template={t} onPick={() => pick(t.id)} />
              ))}
            </div>
          </section>
        </>
      )}

      <Tabs
        value={category}
        onValueChange={(v) => setCategory(v as FilterCategory)}
      >
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="All" className="text-xs">
            All ({TEMPLATE_CATALOG.length})
          </TabsTrigger>
          <TabsTrigger value="Featured" className="text-xs">
            Featured
          </TabsTrigger>
          <TabsTrigger value="Trending" className="text-xs">
            Trending
          </TabsTrigger>
          {LONG_FORM_CATEGORIES.map((c) => {
            const count = TEMPLATE_CATALOG.filter((t) => t.longFormCategory === c).length;
            if (count === 0) return null;
            return (
              <TabsTrigger key={c} value={c} className="text-xs">
                {c} ({count})
              </TabsTrigger>
            );
          })}
          {TEMPLATE_CATEGORIES.filter((c) => c !== "Official").map((c) => {
            const count = TEMPLATE_CATALOG.filter(
              (t) => t.category === c && !t.longForm
            ).length;
            if (count === 0) return null;
            return (
              <TabsTrigger key={c} value={c} className="text-xs">
                {c} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

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
  const durationLabel =
    t.estimatedDuration ?? `${Math.round(t.durationInFrames / t.fps)}s`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/30">
      <ProjectThumb gradient={t.thumbnail} className="aspect-video">
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {t.longForm && (
            <Badge className="bg-violet-500/90 text-white hover:bg-violet-500/90">
              <Sparkles className="mr-1 h-3 w-3" /> Long-form
            </Badge>
          )}
          {t.featured && <Badge variant="secondary">Featured</Badge>}
          {t.trending && (
            <Badge className="bg-orange-500/90 text-white hover:bg-orange-500/90">
              Trending
            </Badge>
          )}
          {t.official && (
            <Badge className="bg-[#0b84f3]/90 text-white hover:bg-[#0b84f3]/90">
              Studio
            </Badge>
          )}
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
        <div className="flex flex-wrap items-center gap-2">
          {t.difficulty && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${DIFFICULTY_COLORS[t.difficulty]}`}
            >
              {t.difficulty}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            {t.longFormCategory ?? t.category} · {t.aspectRatio} · {durationLabel}
          </span>
          {t.sceneCount && (
            <span className="text-[11px] text-muted-foreground">
              · {t.sceneCount} scenes
            </span>
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          {t.remotionUrl && (
            <Button asChild size="icon" variant="ghost" className="h-8 w-8">
              <a href={t.remotionUrl} target="_blank" rel="noreferrer" title="View source">
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
  );
}
