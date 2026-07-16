import { create } from "zustand";
import type {
  AnimationPreset,
  AspectRatio,
  Layer,
  Project,
  TransitionType,
} from "@/types";
import { ASPECT_PRESETS } from "@/lib/constants";
import { MOCK_PROJECTS } from "@/data/mock";

type LeftTab =
  | "assets"
  | "templates"
  | "text"
  | "shapes"
  | "audio"
  | "video"
  | "stickers"
  | "brand";

type RightTab = "properties" | "animation" | "effects" | "timing";

const HISTORY_LIMIT = 50;

interface EditorState {
  project: Project;
  past: Project[];
  future: Project[];
  currentFrame: number;
  isPlaying: boolean;
  selectedLayerIds: string[];
  leftTab: LeftTab;
  rightTab: RightTab;
  timelineZoom: number;
  previewScale: number;
  snapEnabled: boolean;
  showWaveforms: boolean;
  dirty: boolean;

  loadProject: (project: Project) => void;
  setFrame: (frame: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  selectLayers: (ids: string[]) => void;
  setLeftTab: (tab: LeftTab) => void;
  setRightTab: (tab: RightTab) => void;
  setTimelineZoom: (zoom: number) => void;
  setSnap: (enabled: boolean) => void;
  toggleWaveforms: () => void;
  setAspectRatio: (ratio: AspectRatio) => void;

  // history-tracked mutations
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  addLayer: (layer: Layer) => void;
  removeLayers: (ids: string[]) => void;
  setLayerAnimation: (id: string, animation: AnimationPreset) => void;
  setSceneTransition: (sceneId: string, transition: TransitionType) => void;
  duplicateSelected: () => void;
  moveLayer: (id: string, startFrame: number) => void;
  trimLayer: (id: string, startFrame: number, durationInFrames: number) => void;
  splitLayerAtPlayhead: () => void;
  reorderLayer: (id: string, direction: "up" | "down") => void;
  toggleLayerLock: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  nudgeSelected: (frames: number) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  markSaved: () => void;
}

const defaultProject = structuredClone(MOCK_PROJECTS[0]);

const uid = (prefix = "l") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const useEditorStore = create<EditorState>((set, get) => {
  /** Apply a project mutation while recording an undo snapshot. */
  const commit = (
    mutate: (project: Project) => Project,
    extra: Partial<EditorState> = {}
  ) =>
    set((s) => {
      const nextProject = mutate(s.project);
      return {
        project: nextProject,
        past: [...s.past.slice(-HISTORY_LIMIT + 1), s.project],
        future: [],
        dirty: true,
        ...extra,
      };
    });

  return {
    project: defaultProject,
    past: [],
    future: [],
    currentFrame: 0,
    isPlaying: false,
    selectedLayerIds: [],
    leftTab: "assets",
    rightTab: "properties",
    timelineZoom: 1,
    previewScale: 1,
    snapEnabled: true,
    showWaveforms: true,
    dirty: false,

    loadProject: (project) =>
      set({
        project: structuredClone(project),
        past: [],
        future: [],
        currentFrame: 0,
        isPlaying: false,
        selectedLayerIds: [],
        dirty: false,
      }),

    setFrame: (frame) =>
      set((s) => ({
        currentFrame: Math.max(
          0,
          Math.min(frame, s.project.settings.durationInFrames - 1)
        ),
      })),

    setPlaying: (isPlaying) => set({ isPlaying }),
    togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
    selectLayers: (ids) => set({ selectedLayerIds: ids }),
    setLeftTab: (leftTab) => set({ leftTab }),
    setRightTab: (rightTab) => set({ rightTab }),
    setTimelineZoom: (timelineZoom) =>
      set({ timelineZoom: Math.max(0.25, Math.min(4, timelineZoom)) }),
    setSnap: (snapEnabled) => set({ snapEnabled }),
    toggleWaveforms: () => set((s) => ({ showWaveforms: !s.showWaveforms })),

    setAspectRatio: (ratio) => {
      const preset = ASPECT_PRESETS[ratio];
      commit((p) => ({
        ...p,
        settings: {
          ...p.settings,
          aspectRatio: ratio,
          width: preset.width,
          height: preset.height,
        },
      }));
    },

    updateLayer: (id, patch) =>
      commit((p) => ({
        ...p,
        layers: p.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      })),

    addLayer: (layer) =>
      commit(
        (p) => ({ ...p, layers: [...p.layers, layer] }),
        { selectedLayerIds: [layer.id] }
      ),

    removeLayers: (ids) =>
      commit(
        (p) => ({ ...p, layers: p.layers.filter((l) => !ids.includes(l.id)) }),
        { selectedLayerIds: [] }
      ),

    setLayerAnimation: (id, animation) => get().updateLayer(id, { animation }),

    setSceneTransition: (sceneId, transition) =>
      commit((p) => ({
        ...p,
        scenes: p.scenes.map((sc) =>
          sc.id === sceneId ? { ...sc, transition } : sc
        ),
      })),

    duplicateSelected: () => {
      const { project, selectedLayerIds } = get();
      const copies = project.layers
        .filter((l) => selectedLayerIds.includes(l.id))
        .map((l) => ({
          ...structuredClone(l),
          id: uid(),
          name: `${l.name} Copy`,
          startFrame: l.startFrame + 5,
        }));
      if (!copies.length) return;
      commit((p) => ({ ...p, layers: [...p.layers, ...copies] }), {
        selectedLayerIds: copies.map((c) => c.id),
      });
    },

    moveLayer: (id, startFrame) =>
      commit((p) => ({
        ...p,
        layers: p.layers.map((l) =>
          l.id === id ? { ...l, startFrame: Math.max(0, startFrame) } : l
        ),
      })),

    trimLayer: (id, startFrame, durationInFrames) =>
      commit((p) => ({
        ...p,
        layers: p.layers.map((l) =>
          l.id === id
            ? {
                ...l,
                startFrame: Math.max(0, startFrame),
                durationInFrames: Math.max(5, durationInFrames),
              }
            : l
        ),
      })),

    splitLayerAtPlayhead: () => {
      const { project, selectedLayerIds, currentFrame } = get();
      const target = project.layers.find((l) =>
        selectedLayerIds.includes(l.id)
      );
      if (!target) return;
      const localCut = currentFrame - target.startFrame;
      if (localCut <= 2 || localCut >= target.durationInFrames - 2) return;

      const left: Layer = { ...target, durationInFrames: localCut };
      const right: Layer = {
        ...structuredClone(target),
        id: uid(),
        name: `${target.name} (2)`,
        startFrame: currentFrame,
        durationInFrames: target.durationInFrames - localCut,
        trimBefore: (target.trimBefore ?? 0) + localCut,
      };
      commit(
        (p) => ({
          ...p,
          layers: p.layers.flatMap((l) =>
            l.id === target.id ? [left, right] : [l]
          ),
        }),
        { selectedLayerIds: [right.id] }
      );
    },

    reorderLayer: (id, direction) =>
      commit((p) => {
        const idx = p.layers.findIndex((l) => l.id === id);
        if (idx === -1) return p;
        const swap = direction === "up" ? idx + 1 : idx - 1;
        if (swap < 0 || swap >= p.layers.length) return p;
        const layers = [...p.layers];
        [layers[idx], layers[swap]] = [layers[swap], layers[idx]];
        return { ...p, layers };
      }),

    toggleLayerLock: (id) =>
      commit((p) => ({
        ...p,
        layers: p.layers.map((l) =>
          l.id === id ? { ...l, locked: !l.locked } : l
        ),
      })),

    toggleLayerVisibility: (id) =>
      commit((p) => ({
        ...p,
        layers: p.layers.map((l) =>
          l.id === id ? { ...l, visible: l.visible === false } : l
        ),
      })),

    nudgeSelected: (frames) => {
      const { selectedLayerIds } = get();
      if (!selectedLayerIds.length) return;
      commit((p) => ({
        ...p,
        layers: p.layers.map((l) =>
          selectedLayerIds.includes(l.id)
            ? { ...l, startFrame: Math.max(0, l.startFrame + frames) }
            : l
        ),
      }));
    },

    undo: () =>
      set((s) => {
        if (!s.past.length) return s;
        const previous = s.past[s.past.length - 1];
        return {
          project: previous,
          past: s.past.slice(0, -1),
          future: [s.project, ...s.future].slice(0, HISTORY_LIMIT),
          dirty: true,
        };
      }),

    redo: () =>
      set((s) => {
        if (!s.future.length) return s;
        const next = s.future[0];
        return {
          project: next,
          past: [...s.past, s.project].slice(-HISTORY_LIMIT),
          future: s.future.slice(1),
          dirty: true,
        };
      }),

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
    markSaved: () => set({ dirty: false }),
  };
});
