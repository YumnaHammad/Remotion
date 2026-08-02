import { create } from "zustand";
import type {
  AnimationPreset,
  AspectRatio,
  Layer,
  Project,
  Scene,
  Template,
  Track,
  TransitionType,
} from "@/types";
import { ASPECT_PRESETS } from "@/lib/constants";
import { MOCK_PROJECTS } from "@/data/mock";
import { makeTextLayer } from "@/lib/project-factory";
import { migrateProjectMediaUrls } from "@/lib/sample-media";
import { assignLayerToFreeTrack } from "@/lib/track-assignment";

type LeftTab =
  | "assets"
  | "templates"
  | "scenes"
  | "text"
  | "shapes"
  | "audio"
  | "video"
  | "broll"
  | "stickers"
  | "patterns"
  | "effects"
  | "collage"
  | "brand";

type RightTab = "properties" | "animation" | "effects" | "timing" | "tools";

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
  /** Browser TTS while timeline plays (caption layers). */
  speakCaptionsOnPlay: boolean;

  loadProject: (project: Project) => void;
  migrateBrokenMedia: () => void;
  setFrame: (frame: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  selectLayers: (ids: string[]) => void;
  setLeftTab: (tab: LeftTab) => void;
  setRightTab: (tab: RightTab) => void;
  setTimelineZoom: (zoom: number) => void;
  setSnap: (enabled: boolean) => void;
  toggleWaveforms: () => void;
  setSpeakCaptionsOnPlay: (enabled: boolean) => void;
  setAspectRatio: (ratio: AspectRatio) => void;

  // history-tracked mutations
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: Layer) => void;
  removeLayers: (ids: string[]) => void;
  setLayerAnimation: (id: string, animation: AnimationPreset) => void;
  setSceneTransition: (sceneId: string, transition: TransitionType) => void;
  applyTemplate: (template: Template) => void;
  addScene: () => void;
  removeScene: (id: string) => void;
  reorderScene: (id: string, direction: "up" | "down") => void;
  updateScene: (id: string, patch: Partial<Scene>) => void;
  updateTrack: (id: string, patch: Partial<Track>) => void;
  setMasterVolume: (volume: number) => void;
  duplicateSelected: () => void;
  moveLayer: (id: string, startFrame: number) => void;
  trimLayer: (id: string, startFrame: number, durationInFrames: number) => void;
  splitLayerAtPlayhead: () => void;
  reorderLayer: (id: string, direction: "up" | "down") => void;
  bringLayerToFront: (id: string) => void;
  sendLayerToBack: (id: string) => void;
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

/**
 * Lay scenes back-to-back on the timeline (recomputing each startFrame) and
 * return the recomputed scenes plus the total frame count so the composition
 * length stays in sync with the sum of scene durations.
 */
const resequenceScenes = (scenes: Scene[]) => {
  let cursor = 0;
  const next = scenes.map((s) => {
    const withStart = { ...s, startFrame: cursor };
    cursor += s.durationInFrames;
    return withStart;
  });
  return { scenes: next, total: cursor };
};

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
    speakCaptionsOnPlay: true,

    loadProject: (project) =>
      set((s) => {
        const migrated = migrateProjectMediaUrls(project);
        const sameProject = s.project.id === migrated.id;
        const nextIds = sameProject
          ? s.selectedLayerIds.filter((id) =>
              migrated.layers.some((l) => l.id === id)
            )
          : [];
        return {
          project: structuredClone(migrated),
          past: [],
          future: [],
          currentFrame: sameProject
            ? Math.min(
                s.currentFrame,
                Math.max(0, migrated.settings.durationInFrames - 1)
              )
            : 0,
          isPlaying: false,
          selectedLayerIds: nextIds,
          dirty: false,
        };
      }),

    /** Fix broken CDN urls on the open project without wiping selection. */
    migrateBrokenMedia: () =>
      set((s) => {
        const migrated = migrateProjectMediaUrls(s.project);
        if (migrated === s.project) return s;
        return { project: migrated, dirty: true };
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
    setSpeakCaptionsOnPlay: (enabled) => set({ speakCaptionsOnPlay: enabled }),

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

    setLayers: (layers) =>
      commit((p) => ({
        ...p,
        layers,
      })),

    addLayer: (layer) =>
      commit(
        (p) => {
          const { layer: placed, tracks } = assignLayerToFreeTrack(p, layer);
          return { ...p, tracks, layers: [...p.layers, placed] };
        },
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

    applyTemplate: (template) => {
      const preset = ASPECT_PRESETS[template.aspectRatio];
      commit(
        (p) => {
          const scene: Scene = {
            id: uid("sc"),
            name: "Main",
            startFrame: 0,
            durationInFrames: template.durationInFrames,
            transition: "fade",
            transitionDuration: 15,
            background: "#0a0a0f",
          };
          
          const DEFAULT_FILTERS = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            hueRotate: 0,
            grayscale: 0,
            sepia: 0,
            blur: 0,
          };

          // 1. Add background solid layer
          let bgColor = "#0f1015";
          if (template.id === "tpl-2") bgColor = "#121020"; // Instagram Reel Promo dark indigo
          if (template.id === "tpl-4") bgColor = "#042f2e"; // Podcast Wave dark teal
          if (template.id === "tpl-5") bgColor = "#1a1815"; // Product Ad dark luxury gold
          if (template.id === "tpl-6") bgColor = "#0f172a"; // Startup slate blue
          if (template.id === "tpl-7") bgColor = "#0c0a09"; // News dark stone

          const layers: Layer[] = [];
          layers.push({
            id: `l-${Date.now()}-bg`,
            name: "Background",
            type: "solid",
            trackId: "t-v1",
            startFrame: 0,
            durationInFrames: template.durationInFrames,
            transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 },
            animation: "none",
            animationDuration: 0,
            filters: { ...DEFAULT_FILTERS },
            fill: bgColor,
          });

          // Helper text layer builder
          const makeText = (partial: Partial<Layer> & Pick<Layer, "name" | "text">): Layer => {
            return makeTextLayer({
              trackId: "t-tx1",
              startFrame: 0,
              durationInFrames: template.durationInFrames,
              transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              animation: "none",
              animationDuration: 15,
              filters: { ...DEFAULT_FILTERS },
              ...partial,
            });
          };

          // 2. Add custom template title/subtitles
          if (template.id === "tpl-1" || template.id === "tpl-3") {
            // Shorts / TikTok hooks
            layers.push(makeText({
              name: "Headline",
              text: "KINETIC HOOK",
              startFrame: 10,
              durationInFrames: template.durationInFrames - 10,
              transform: { x: 0, y: -50, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 54,
                fontWeight: 800,
                color: "#f472b6",
                align: "center",
                lineHeight: 1.1,
                letterSpacing: -1.5,
                neon: true,
              },
              animation: "bounce",
            }));
            layers.push(makeText({
              name: "Subheading",
              text: "Grab Attention in 3 Seconds",
              startFrame: 25,
              durationInFrames: template.durationInFrames - 25,
              transform: { x: 0, y: 40, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 22,
                fontWeight: 600,
                color: "#ffffff",
                align: "center",
                lineHeight: 1.2,
                letterSpacing: 0,
              },
              animation: "fade",
            }));
          } else if (template.id === "tpl-2") {
            // Instagram Reel Promo
            layers.push(makeText({
              name: "Headline",
              text: "EXCLUSIVE PROMO",
              startFrame: 12,
              durationInFrames: template.durationInFrames - 12,
              transform: { x: 0, y: -60, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 48,
                fontWeight: 800,
                color: "#ffffff",
                align: "center",
                lineHeight: 1.1,
                letterSpacing: -1,
                gradient: "linear-gradient(135deg,#f472b6,#38bdf8)",
              },
              animation: "scale",
            }));
            layers.push(makeText({
              name: "Subheading",
              text: "50% OFF TODAY ONLY",
              startFrame: 28,
              durationInFrames: template.durationInFrames - 28,
              transform: { x: 0, y: 30, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                fontWeight: 700,
                color: "#e11d48",
                align: "center",
                lineHeight: 1.2,
                letterSpacing: 0.5,
                neon: true,
              },
              animation: "fade",
            }));
          } else if (template.id === "tpl-4") {
            // Podcast Wave
            layers.push(makeText({
              name: "Headline",
              text: "PODCAST HOST",
              startFrame: 15,
              durationInFrames: template.durationInFrames - 15,
              transform: { x: 0, y: -40, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 48,
                fontWeight: 800,
                color: "#2dd4bf",
                align: "center",
                lineHeight: 1.1,
                letterSpacing: -1,
              },
              animation: "slide",
            }));
            layers.push(makeText({
              name: "Episode #",
              text: "EPISODE 42",
              startFrame: 25,
              durationInFrames: template.durationInFrames - 25,
              transform: { x: 0, y: 30, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 24,
                fontWeight: 600,
                color: "#ffffff",
                align: "center",
                lineHeight: 1.2,
                letterSpacing: 0,
              },
              animation: "fade",
            }));
          } else if (template.id === "tpl-5") {
            // Product Ad
            layers.push(makeText({
              name: "Headline",
              text: "LUXURY EDITION",
              startFrame: 15,
              durationInFrames: template.durationInFrames - 15,
              transform: { x: 0, y: -30, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 54,
                fontWeight: 800,
                color: "#fbbf24",
                align: "center",
                lineHeight: 1.1,
                letterSpacing: 2,
              },
              animation: "scale",
            }));
            layers.push(makeText({
              name: "Tagline",
              text: "Experience True Craftsmanship",
              startFrame: 35,
              durationInFrames: template.durationInFrames - 35,
              transform: { x: 0, y: 40, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 20,
                fontWeight: 500,
                color: "#cbd5e1",
                align: "center",
                lineHeight: 1.2,
                letterSpacing: 1,
              },
              animation: "fade",
            }));
          } else {
            // Fallback template builder
            layers.push(makeText({
              name: "Headline",
              text: template.name.toUpperCase(),
              startFrame: 10,
              durationInFrames: template.durationInFrames - 10,
              transform: { x: 0, y: -35, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 44,
                fontWeight: 800,
                color: "#38bdf8",
                align: "center",
                lineHeight: 1.1,
                letterSpacing: -1,
              },
              animation: "scale",
            }));
            layers.push(makeText({
              name: "Subheading",
              text: "Professional Video Template Layout",
              startFrame: 25,
              durationInFrames: template.durationInFrames - 25,
              transform: { x: 0, y: 35, scale: 1, rotation: 0, opacity: 1, blur: 0 },
              textStyle: {
                fontFamily: "Inter",
                fontSize: 20,
                fontWeight: 500,
                color: "#94a3b8",
                align: "center",
                lineHeight: 1.2,
                letterSpacing: 0,
              },
              animation: "fade",
            }));
          }

          return {
            ...p,
            settings: {
              ...p.settings,
              aspectRatio: template.aspectRatio,
              width: preset.width,
              height: preset.height,
              durationInFrames: template.durationInFrames,
            },
            scenes: [scene],
            layers,
          };
        },
        { selectedLayerIds: [] }
      );
    },

    addScene: () =>
      commit((p) => {
        const scene: Scene = {
          id: uid("sc"),
          name: `Scene ${p.scenes.length + 1}`,
          startFrame: 0,
          durationInFrames: 60,
          transition: "fade",
          transitionDuration: 12,
          background: "#0a0a0f",
        };
        const { scenes, total } = resequenceScenes([...p.scenes, scene]);
        return {
          ...p,
          scenes,
          settings: { ...p.settings, durationInFrames: total },
        };
      }),

    removeScene: (id) =>
      commit((p) => {
        if (p.scenes.length <= 1) return p;
        const { scenes, total } = resequenceScenes(
          p.scenes.filter((s) => s.id !== id)
        );
        return {
          ...p,
          scenes,
          settings: { ...p.settings, durationInFrames: total },
        };
      }),

    reorderScene: (id, direction) =>
      commit((p) => {
        const idx = p.scenes.findIndex((s) => s.id === id);
        if (idx === -1) return p;
        const swap = direction === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= p.scenes.length) return p;
        const arr = [...p.scenes];
        [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
        const { scenes, total } = resequenceScenes(arr);
        return {
          ...p,
          scenes,
          settings: { ...p.settings, durationInFrames: total },
        };
      }),

    updateScene: (id, patch) =>
      commit((p) => {
        const { scenes, total } = resequenceScenes(
          p.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s))
        );
        return {
          ...p,
          scenes,
          settings: { ...p.settings, durationInFrames: total },
        };
      }),

    updateTrack: (id, patch) =>
      commit((p) => ({
        ...p,
        tracks: p.tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })),

    setMasterVolume: (volume) =>
      commit((p) => ({
        ...p,
        masterVolume: Math.max(0, Math.min(1, volume)),
      })),

    duplicateSelected: () => {
      const { project, selectedLayerIds } = get();
      const drafts = project.layers
        .filter((l) => selectedLayerIds.includes(l.id))
        .map((l) => ({
          ...structuredClone(l),
          id: uid(),
          name: `${l.name} Copy`,
          startFrame: l.startFrame + 5,
        }));
      if (!drafts.length) return;
      commit(
        (p) => {
          let tracks = p.tracks;
          let layers = [...p.layers];
          const placedIds: string[] = [];
          for (const draft of drafts) {
            const { layer: placed, tracks: nextTracks } = assignLayerToFreeTrack(
              { ...p, tracks, layers },
              draft
            );
            tracks = nextTracks;
            layers = [...layers, placed];
            placedIds.push(placed.id);
          }
          return { ...p, tracks, layers };
        },
        // selected ids set after commit via second arg — use draft ids (unchanged)
        { selectedLayerIds: drafts.map((d) => d.id) }
      );
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
        // up = toward front (higher index), down = toward back (lower index)
        const swap = direction === "up" ? idx + 1 : idx - 1;
        if (swap < 0 || swap >= p.layers.length) return p;
        const layers = [...p.layers];
        [layers[idx], layers[swap]] = [layers[swap], layers[idx]];
        return { ...p, layers };
      }),

    bringLayerToFront: (id) =>
      commit((p) => {
        const idx = p.layers.findIndex((l) => l.id === id);
        if (idx === -1 || idx === p.layers.length - 1) return p;
        const layers = [...p.layers];
        const [item] = layers.splice(idx, 1);
        layers.push(item);
        return { ...p, layers };
      }),

    sendLayerToBack: (id) =>
      commit((p) => {
        const idx = p.layers.findIndex((l) => l.id === id);
        if (idx <= 0) return p;
        const layers = [...p.layers];
        const [item] = layers.splice(idx, 1);
        layers.unshift(item);
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
