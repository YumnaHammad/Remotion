"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Download,
  FolderOpen,
  HardDrive,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/primitives";
import { ProjectPreview } from "@/components/shared/project-preview";
import { CreateAIDialog } from "@/components/shared/create-ai-dialog";
import { useProjectStore } from "@/stores/project-store";
import { useUIStore } from "@/stores/ui-store";
import { formatBytes, formatRelative } from "@/lib/utils";

export default function HomePage() {
  const projects = useProjectStore((s) => s.projects);
  const renders = useProjectStore((s) => s.renders);
  const { storageUsed, storageLimit } = useUIStore();
  const activeRenders = renders.filter(
    (r) => r.status === "rendering" || r.status === "queued" || r.status === "processing"
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Sparkles className="mr-1 h-3 w-3" /> AI Studio
            </Badge>
            <h1 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Welcome back, Alex
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Create cinematic videos from prompts, edit on a Remotion timeline,
              and export in minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CreateAIDialog
              trigger={
                <Button variant="glow" size="lg">
                  <Zap className="h-4 w-4" /> Create with AI
                </Button>
              }
            />
            <Button asChild variant="outline" size="lg">
              <Link href="/templates">Browse templates</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={String(projects.length)}
          hint="+2 this week"
          icon={FolderOpen}
        />
        <StatCard
          label="Renders today"
          value={String(renders.length)}
          hint={`${activeRenders.length} in queue`}
          icon={Download}
        />
        <StatCard
          label="Avg. render time"
          value="2m 14s"
          hint="−18% vs last week"
          icon={Clock}
        />
        <StatCard
          label="Engagement"
          value="+34%"
          hint="Template reuse rate"
          icon={TrendingUp}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent projects</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.slice(0, 4).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/editor/${p.id}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <ProjectPreview project={p} className="rounded-none">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                        <Play className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </ProjectPreview>
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <Badge
                        variant={
                          p.status === "ready"
                            ? "success"
                            : p.status === "rendering"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Edited {formatRelative(p.updatedAt)} · {p.settings.aspectRatio}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Rendering queue</h2>
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
                <p className="text-[11px] text-muted-foreground">
                  {r.format.toUpperCase()} · {r.quality} · {r.progress}%
                </p>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/export">Open Export Center</Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Storage</h3>
            </div>
            <Progress value={(storageUsed / storageLimit) * 100} />
            <p className="mt-2 text-xs text-muted-foreground">
              {formatBytes(storageUsed)} of {formatBytes(storageLimit)} used
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
