"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, MoreHorizontal, Plus, Search, Trash2, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectPreview } from "@/components/shared/project-preview";
import { NewProjectDialog } from "@/components/shared/new-project-dialog";
import { useProjectStore } from "@/stores/project-store";
import { formatRelative } from "@/lib/utils";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { projects, deleteProject, duplicateProject } = useProjectStore();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [projects, query]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Editor</h1>
          <p className="text-sm text-muted-foreground">
            Create and edit your custom multi-track timeline videos
          </p>
        </div>
        <NewProjectDialog
          trigger={
            <Button variant="glow">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          }
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search projects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-background/50 p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8"
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8"
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No projects yet. Create a new project to start editing in Timeline Studio.
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-foreground/80">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Last Edited</th>
                    <th className="px-5 py-3.5">Orientation</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((p) => {
                    const durationSec = (
                      p.settings.durationInFrames / (p.settings.fps || 30)
                    ).toFixed(1);
                    return (
                      <tr
                        key={p.id}
                        className="transition hover:bg-muted/10 group"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/editor/${p.id}`}
                            className="font-medium text-foreground hover:text-primary transition truncate block max-w-md"
                          >
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          <div>
                            {new Date(p.updatedAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </div>
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {formatRelative(p.updatedAt)}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium uppercase border-border/80 text-foreground bg-muted/40"
                          >
                            {p.settings.aspectRatio}
                          </Badge>
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {p.settings.width} x {p.settings.height}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                          <div>{durationSec}s</div>
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {p.layers.length} {p.layers.length === 1 ? "layer" : "layers"}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold capitalize"
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Duplicate project"
                              onClick={() => duplicateProject(p.id)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/5"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Delete project"
                              onClick={() => {
                                deleteProject(p.id);
                                toast.success("Project deleted");
                              }}
                              className="h-7 w-7 text-muted-foreground hover:text-red-400 hover:bg-white/5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/30"
              >
                <Link href={`/editor/${p.id}`}>
                  <ProjectPreview project={p} className="rounded-none" />
                </Link>
                <div className="flex items-start justify-between gap-2 p-3.5">
                  <div className="min-w-0">
                    <Link
                      href={`/editor/${p.id}`}
                      className="block truncate text-sm font-medium hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelative(p.updatedAt)} · {p.settings.aspectRatio}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">{p.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => duplicateProject(p.id)}>
                          <Copy className="h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            deleteProject(p.id);
                            toast.success("Project deleted");
                          }}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
