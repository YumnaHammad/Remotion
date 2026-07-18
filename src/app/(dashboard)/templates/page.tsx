"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Crown, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectThumb } from "@/components/shared/primitives";
import { MOCK_TEMPLATES } from "@/data/mock";
import { useProjectStore } from "@/stores/project-store";
import { createBlankProject, makeTextLayer } from "@/lib/project-factory";
import type { Project } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "All",
  "YouTube Shorts",
  "Instagram Reels",
  "TikTok",
  "Podcast",
  "Product Ads",
  "Startup Promo",
  "News",
  "Motivational",
  "Explainer",
  "SaaS Demos",
];

export default function TemplatesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const addProject = useProjectStore((s) => s.addProject);
  const router = useRouter();

  const filtered = useMemo(
    () =>
      MOCK_TEMPLATES.filter((t) => {
        const matchCat = category === "All" || t.category === category;
        const matchQ =
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.tags.some((tag) => tag.includes(query.toLowerCase()));
        return matchCat && matchQ;
      }),
    [query, category]
  );

  const handleUseTemplate = (tplId: string) => {
    const tpl = MOCK_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;

    const base = createBlankProject({
      name: `${tpl.name} Project`,
      description: tpl.description,
      thumbnail: tpl.thumbnail,
      aspectRatio: tpl.aspectRatio,
      durationInFrames: tpl.durationInFrames,
      tags: tpl.tags,
    });

    const project: Project = {
      ...base,
      scenes: [
        {
          ...base.scenes[0],
          name: "Main",
          transition: "fade",
          transitionDuration: 15,
        },
      ],
      layers: [
        makeTextLayer({
          name: "Headline",
          text: tpl.name,
          startFrame: 10,
          durationInFrames: Math.min(90, tpl.durationInFrames - 10),
          animation: "bounce",
        }),
      ],
    };
    addProject(project);
    toast.success("Template applied");
    router.push(`/editor/${project.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Marketplace of Remotion compositions with dynamic props
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
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="h-auto flex-wrap justify-start">
            {CATEGORIES.slice(0, 6).map((c) => (
              <TabsTrigger key={c} value={c} className="text-xs">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/30"
          >
            <ProjectThumb gradient={t.thumbnail} className="rounded-none">
              <div className="absolute left-3 top-3 flex gap-1.5">
                {t.popular && (
                  <Badge className="bg-black/50 backdrop-blur">
                    <Sparkles className="mr-1 h-3 w-3" /> Popular
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
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {t.aspectRatio} · {Math.round(t.durationInFrames / 30)}s
                </span>
                <Button size="sm" onClick={() => handleUseTemplate(t.id)}>
                  Use template
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Prefer blank canvas?{" "}
        <Link href="/projects" className="text-primary hover:underline">
          Create from scratch
        </Link>
      </p>
    </div>
  );
}
