"use client";

import Link from "next/link";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/primitives";
import { useProjectStore } from "@/stores/project-store";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import { formatRelative } from "@/lib/utils";
import { toast } from "sonner";

/** Export history and simple project management. */
export default function ExportsPage() {
  const renders = useProjectStore((s) => s.renders);
  const simpleProjects = useSimpleVideoStore((s) => s.projects);
  const deleteProject = useSimpleVideoStore((s) => s.deleteProject);
  const duplicateProject = useSimpleVideoStore((s) => s.duplicateProject);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Exports</h1>
        <p className="text-sm text-muted-foreground">
          Download rendered videos and manage your simple workflow projects.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Render history</h2>
        {renders.length === 0 ? (
          <EmptyState
            icon={Download}
            title="No exports yet"
            description="Export a video from the create workflow to see it here."
            action={
              <Button asChild>
                <Link href="/templates">Create a video</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {renders.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.projectName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelative(r.createdAt)} · {r.format.toUpperCase()} ·{" "}
                    {r.quality}
                  </p>
                  <Progress className="mt-2 h-1.5" value={r.progress} />
                </div>
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
                {r.status === "completed" && r.outputUrl && (
                  <Button asChild size="sm" variant="outline">
                    <a href={r.outputUrl} download>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Saved projects</h2>
        {simpleProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved projects.</p>
        ) : (
          <div className="space-y-2">
            {simpleProjects.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.sourceType} · {p.compositionId}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/create/${p.id}`}>Edit</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    duplicateProject(p.id);
                    toast.success("Project duplicated");
                  }}
                >
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    deleteProject(p.id);
                    toast.success("Project deleted");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
