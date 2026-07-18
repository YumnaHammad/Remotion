import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SimpleVideoProject } from "@/types/video";
import { genId } from "@/lib/project-factory";

interface SimpleVideoState {
  projects: SimpleVideoProject[];
  addProject: (project: SimpleVideoProject) => void;
  updateProject: (id: string, patch: Partial<SimpleVideoProject>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  getProject: (id: string) => SimpleVideoProject | undefined;
}

/** Simple workflow projects (no timeline) — persisted in localStorage. */
export const useSimpleVideoStore = create<SimpleVideoState>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (project) =>
        set((s) => ({ projects: [project, ...s.projects] })),
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p
          ),
        })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      duplicateProject: (id) => {
        const src = get().projects.find((p) => p.id === id);
        if (!src) return;
        const copy: SimpleVideoProject = {
          ...structuredClone(src),
          id: genId("svp"),
          name: `${src.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "draft",
        };
        set((s) => ({ projects: [copy, ...s.projects] }));
      },
      getProject: (id) => get().projects.find((p) => p.id === id),
    }),
    { name: "video-simple-projects" }
  )
);
