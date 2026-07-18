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
    href: "/templates",
    label: "Templates",
    desc: "Pick a style and customize",
    icon: LayoutTemplate,
  },
  {
    href: "/website-to-video",
    label: "Website to Video",
    desc: "Paste a URL → auto-fill video",
    icon: Globe,
  },
  {
    href: "/data-to-video",
    label: "Data to Video",
    desc: "CSV, Excel, or JSON → slides",
    icon: FileSpreadsheet,
  },
  {
    href: "/brand",
    label: "Brand Kit",
    desc: "Logo, colors, fonts",
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
        className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]" />
        <div className="relative flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Badge className="mb-3 bg-[#0b84f3] text-white hover:bg-[#0b84f3]">
              <Video className="mr-1 h-3 w-3" /> {APP_NAME}
            </Badge>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Templates & automation
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Turn websites and spreadsheets into videos. Pick a template, edit
              text and colors, preview live, export MP4 — no timeline needed.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild variant="glow" size="lg" className="w-full sm:w-auto">
              <Link href="/templates">
                <Clapperboard className="h-4 w-4" /> New video
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
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
              className="block rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <item.icon className="mb-3 h-6 w-6 text-primary" />
              <p className="font-medium">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
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
              <Link href="/templates" className="text-primary hover:underline">
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
