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
import { ASPECT_PRESETS } from "@/lib/constants";
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

  const useTemplate = (tplId: string) => {
    const tpl = MOCK_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    const preset = ASPECT_PRESETS[tpl.aspectRatio];
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: `${tpl.name} Project`,
      description: tpl.description,
      thumbnail: tpl.thumbnail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      settings: {
        width: preset.width,
        height: preset.height,
        fps: 30,
        durationInFrames: tpl.durationInFrames,
        aspectRatio: tpl.aspectRatio,
      },
      scenes: [
        {
          id: "sc-1",
          name: "Main",
          startFrame: 0,
          durationInFrames: tpl.durationInFrames,
          transition: "fade",
          transitionDuration: 15,
          background: "#0a0a0f",
        },
      ],
      tracks: [
        { id: "t-v1", name: "Video 1", kind: "video", locked: false, muted: false, height: 48 },
        { id: "t-tx1", name: "Text 1", kind: "text", locked: false, muted: false, height: 40 },
      ],
      layers: [
        {
          id: `l-${Date.now()}`,
          name: "Headline",
          type: "text",
          trackId: "t-tx1",
          startFrame: 10,
          durationInFrames: Math.min(90, tpl.durationInFrames - 10),
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 },
          animation: "bounce",
          animationDuration: 18,
          text: tpl.name,
          textStyle: {
            fontFamily: "Inter",
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            align: "center",
            lineHeight: 1.1,
            letterSpacing: -1,
            gradient: "linear-gradient(135deg,#fff,#a5b4fc)",
          },
        },
      ],
      tags: tpl.tags,
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
                <Button size="sm" onClick={() => useTemplate(t.id)}>
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
