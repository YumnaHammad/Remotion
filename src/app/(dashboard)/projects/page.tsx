"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
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
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage compositions, duplicates, and drafts
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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

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
    </div>
  );
}
