"use client";

import { useEffect } from "react";
import { MOCK_PROJECTS } from "@/data/mock";
import { useEditorStore } from "@/stores/editor-store";
import { useProjectStore } from "@/stores/project-store";
import { EditorTopBar } from "@/components/editor/editor-shell";
import { LeftPanel } from "@/components/editor/left-panel";
import { RightPanel } from "@/components/editor/right-panel";
import { PreviewPlayer } from "@/components/editor/preview-player";
import { TransportBar } from "@/components/editor/transport-bar";
import { Timeline } from "@/components/editor/timeline";

export function EditorWorkspace({ projectId }: { projectId: string }) {
  const loadProject = useEditorStore((s) => s.loadProject);
  const storeProject = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId)
  );

  useEffect(() => {
    const project =
      storeProject ??
      MOCK_PROJECTS.find((p) => p.id === projectId) ??
      MOCK_PROJECTS[0];
    loadProject(project);
  }, [projectId, storeProject, loadProject]);

  return (
    <div className="editor-surface flex h-screen flex-col overflow-hidden">
      <EditorTopBar />
      <div className="flex min-h-0 flex-1">
        <LeftPanel />
        <div className="flex min-w-0 flex-1 flex-col">
          <TransportBar />
          <div className="min-h-0 flex-1">
            <PreviewPlayer />
          </div>
          <Timeline />
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
