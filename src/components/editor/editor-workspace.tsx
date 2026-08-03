"use client";

import { useEffect } from "react";
import { MOCK_PROJECTS } from "@/data/mock";
import { useEditorStore } from "@/stores/editor-store";
import { useProjectStore } from "@/stores/project-store";
import { EditorTopBar } from "@/components/editor/editor-shell";
import { LeftPanel } from "@/components/editor/left-panel";
import { RightPanel } from "@/components/editor/right-panel";
import { TransportBar } from "@/components/editor/transport-bar";
import dynamic from "next/dynamic";

const PreviewPlayer = dynamic(
  () => import("@/components/editor/preview-player").then((m) => m.PreviewPlayer),
  { ssr: false }
);
import { Timeline } from "@/components/editor/timeline";
import { CaptionSpeakOnPlay } from "@/components/editor/caption-speak-on-play";
import { EditorGuide } from "@/components/editor/editor-guide";

export function EditorWorkspace({ projectId }: { projectId: string }) {
  const loadProject = useEditorStore((s) => s.loadProject);
  const migrateBrokenMedia = useEditorStore((s) => s.migrateBrokenMedia);
  const speakCaptionsOnPlay = useEditorStore((s) => s.speakCaptionsOnPlay);

  // Load once per projectId only. Do NOT depend on storeProject — autosave
  // writes back to the project store and would re-trigger loadProject, which
  // cleared selection and hid Tools/Masking after ~1.5s.
  useEffect(() => {
    const fromStore = useProjectStore
      .getState()
      .projects.find((p) => p.id === projectId);
    const project =
      fromStore ??
      MOCK_PROJECTS.find((p) => p.id === projectId) ??
      MOCK_PROJECTS[0];
    loadProject(project);
    // Repair broken sample CDNs (lofi 404, BigBuckBunny 403) on open
    queueMicrotask(() => migrateBrokenMedia());
  }, [projectId, loadProject, migrateBrokenMedia]);

  return (
    <div className="editor-surface flex h-screen flex-col overflow-hidden">
      <EditorTopBar />
      <CaptionSpeakOnPlay enabled={speakCaptionsOnPlay} />
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
