import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, RenderJob } from "@/types";
import { MOCK_PROJECTS, MOCK_RENDERS } from "@/data/mock";

interface ProjectState {
  projects: Project[];
  renders: RenderJob[];
  selectedProjectId: string | null;
  setSelectedProject: (id: string | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  addRender: (job: RenderJob) => void;
  updateRender: (id: string, patch: Partial<RenderJob>) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: MOCK_PROJECTS,
      renders: MOCK_RENDERS,
      selectedProjectId: null,
      setSelectedProject: (id) => set({ selectedProjectId: id }),
      addProject: (project) =>
        set((s) => ({ projects: [project, ...s.projects] })),
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
      duplicateProject: (id) => {
        const src = get().projects.find((p) => p.id === id);
        if (!src) return;
        const copy: Project = {
          ...structuredClone(src),
          id: `proj-${Date.now()}`,
          name: `${src.name} (Copy)`,
          status: "draft",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ projects: [copy, ...s.projects] }));
      },
      addRender: (job) => set((s) => ({ renders: [job, ...s.renders] })),
      updateRender: (id, patch) =>
        set((s) => ({
          renders: s.renders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
    }),
    { name: "lumen-projects" }
  )
);
