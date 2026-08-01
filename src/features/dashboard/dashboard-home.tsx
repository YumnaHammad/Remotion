"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clapperboard,
  Download,
  FileSpreadsheet,
  Globe,
  LayoutTemplate,
  Palette,
  Play,
  Video,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/primitives";
import { useProjectStore } from "@/stores/project-store";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { APP_NAME } from "@/lib/constants";
import { formatRelative } from "@/lib/utils";

const QUICK_LINKS = [
  {
    href: "/showcase",
    label: "Template Marketplace",
    desc: "Browse premium ready-made video styles",
    icon: LayoutTemplate,
  },
  {
    href: "/script-to-video",
    label: "Script to Video",
    desc: "Generate professional narration and visual assets",
    icon: Sparkles,
  },
  {
    href: "/website-to-video",
    label: "Website to Video",
    desc: "Paste a public URL to auto-fill video components",
    icon: Globe,
  },
  {
    href: "/brand",
    label: "Brand Kit",
    desc: "Save colors, fonts, and assets for instant branding",
    icon: Palette,
  },
] as const;

export function DashboardHome() {
  const renders = useProjectStore((s) => s.renders);
  const simpleProjects = useSimpleVideoStore((s) => s.projects);
  const activeRenders = renders.filter(
    (r) =>
      r.status === "rendering" ||
      r.status === "queued" ||
      r.status === "processing"
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-md p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:p-8"
      >
        <div className="relative flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Badge className="mb-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
              <Video className="mr-1.5 h-3.5 w-3.5" /> {APP_NAME}
            </Badge>
            <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
              Templates & automation
            </h1>
            <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
              Turn websites and spreadsheets into videos. Pick a template, edit
              text and colors, preview live, export MP4 — no timeline needed.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild variant="glow" size="sm" className="w-full sm:w-auto">
              <Link href="/showcase">
                <Clapperboard className="h-4 w-4" /> New video
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href="/website-to-video">
                <Globe className="h-4 w-4" /> From URL
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Your videos"
          value={String(simpleProjects.length)}
          hint="Simple workflow projects"
          icon={Video}
        />
        <StatCard
          label="Exports"
          value={String(renders.length)}
          hint={`${activeRenders.length} in progress`}
          icon={Download}
        />
        <StatCard
          label="Templates"
          value={String(TEMPLATE_CATALOG.length)}
          hint="Social, product, podcast & more"
          icon={LayoutTemplate}
        />
        <StatCard
          label="Brand kit"
          value="1"
          hint="Applied to all videos"
          icon={Palette}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={item.href}
              className="block rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:shadow-md"
            >
              <item.icon className="mb-3 h-5 w-5 text-primary" />
              <p className="font-medium text-sm">{item.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent videos</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/exports">View exports</Link>
            </Button>
          </div>
          {simpleProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No videos yet.{" "}
              <Link href="/showcase" className="text-primary hover:underline">
                Create your first
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {simpleProjects.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/create/${p.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Play className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.compositionId} · {formatRelative(p.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Export queue</h2>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            {renders.slice(0, 4).map((r) => (
              <div key={r.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{r.projectName}</p>
                  <Badge
                    variant={
                      r.status === "completed"
                        ? "success"
                        : r.status === "failed"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
                <Progress value={r.progress} />
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/exports">Open Exports</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
