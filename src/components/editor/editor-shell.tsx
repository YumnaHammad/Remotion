"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Redo2,
  Save,
  Scissors,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore } from "@/stores/editor-store";
import { useProjectStore } from "@/stores/project-store";
import { ExportDialog } from "./export-dialog";
import { toast } from "sonner";

export function EditorTopBar() {
  const project = useEditorStore((s) => s.project);
  const dirty = useEditorStore((s) => s.dirty);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const removeLayers = useEditorStore((s) => s.removeLayers);
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected);
  const splitLayer = useEditorStore((s) => s.splitLayerAtPlayhead);
  const nudgeSelected = useEditorStore((s) => s.nudgeSelected);
  const togglePlay = useEditorStore((s) => s.togglePlay);
  const setFrame = useEditorStore((s) => s.setFrame);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past.length);
  const future = useEditorStore((s) => s.future.length);
  const markSaved = useEditorStore((s) => s.markSaved);
  const updateProject = useProjectStore((s) => s.updateProject);

  const save = () => {
    updateProject(project.id, project);
    markSaved();
    toast.success("Project saved");
  };

  // Autosave: debounce persist to the project store whenever dirty.
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirty) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      updateProject(project.id, project);
      markSaved();
    }, 1500);
    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, [dirty, project, updateProject, markSaved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const mod = e.metaKey || e.ctrlKey;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedLayerIds.length) removeLayers(selectedLayerIds);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      } else if (e.key.toLowerCase() === "s" && !mod) {
        if (selectedLayerIds.length) splitLayer();
      } else if (e.key === "ArrowLeft") {
        if (e.altKey && selectedLayerIds.length) nudgeSelected(e.shiftKey ? -10 : -1);
        else setFrame(currentFrame - (e.shiftKey ? 10 : 1));
      } else if (e.key === "ArrowRight") {
        if (e.altKey && selectedLayerIds.length) nudgeSelected(e.shiftKey ? 10 : 1);
        else setFrame(currentFrame + (e.shiftKey ? 10 : 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex h-12 items-center gap-2 border-b border-[var(--editor-border)] bg-[var(--editor-panel)] px-3">
      <Button
        asChild
        variant="ghost"
        size="icon-sm"
        className="text-white/70 hover:bg-white/10 hover:text-white"
      >
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-white">
            {project.name}
          </h1>
          <Badge variant="secondary" className="bg-white/10 text-white/70">
            {project.settings.aspectRatio}
          </Badge>
          <span className="text-[10px] text-white/40">
            {dirty ? "Unsaved…" : "All changes saved"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/70 hover:bg-white/10 disabled:opacity-30"
              disabled={past === 0}
              onClick={undo}
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (⌘Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/70 hover:bg-white/10 disabled:opacity-30"
              disabled={future === 0}
              onClick={redo}
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
              disabled={selectedLayerIds.length === 0}
              onClick={splitLayer}
            >
              <Scissors className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split at playhead (S)</TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
          disabled={selectedLayerIds.length === 0}
          onClick={duplicateSelected}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
          disabled={selectedLayerIds.length === 0}
          onClick={() => removeLayers(selectedLayerIds)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-white/70 hover:bg-white/10 hover:text-white"
        onClick={save}
      >
        <Save className="h-3.5 w-3.5" />
        Save
      </Button>

      <ExportDialog />
    </div>
  );
}
