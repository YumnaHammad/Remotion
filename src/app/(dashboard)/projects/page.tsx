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
import { useProjectStore } from "@/stores/project-store";
import { ASPECT_PRESETS } from "@/lib/constants";
import { formatRelative } from "@/lib/utils";
import type { Project } from "@/types";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { projects, addProject, deleteProject, duplicateProject } =
    useProjectStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [projects, query]
  );

  const createProject = () => {
    const preset = ASPECT_PRESETS["16:9"];
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: "Untitled Project",
      description: "New Remotion composition",
      thumbnail: "gradient-5",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      settings: {
        width: preset.width,
        height: preset.height,
        fps: 30,
        durationInFrames: 150,
        aspectRatio: "16:9",
      },
      scenes: [
        {
          id: "sc-new",
          name: "Intro",
          startFrame: 0,
          durationInFrames: 150,
          transition: "fade",
          transitionDuration: 15,
          background: "#0a0a0f",
        },
      ],
      tracks: [
        { id: "t-v1", name: "Video 1", kind: "video", locked: false, muted: false, height: 48 },
        { id: "t-tx1", name: "Text 1", kind: "text", locked: false, muted: false, height: 40 },
        { id: "t-a1", name: "Audio 1", kind: "audio", locked: false, muted: false, height: 36 },
      ],
      layers: [
        {
          id: `l-${Date.now()}`,
          name: "Title",
          type: "text",
          trackId: "t-tx1",
          startFrame: 10,
          durationInFrames: 90,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 },
          animation: "fade",
          animationDuration: 20,
          text: "New Project",
          textStyle: {
            fontFamily: "Inter",
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            align: "center",
            lineHeight: 1.1,
            letterSpacing: -1,
            gradient: "linear-gradient(135deg,#fff,#a5b4fc)",
          },
        },
      ],
      tags: [],
    };
    addProject(project);
    toast.success("Project created");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage compositions, duplicates, and drafts
          </p>
        </div>
        <Button onClick={createProject} variant="glow">
          <Plus className="h-4 w-4" /> New Project
        </Button>
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
