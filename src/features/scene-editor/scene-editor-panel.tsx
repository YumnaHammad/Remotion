"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  SCENE_ANIMATION_PRESETS,
  SCENE_TYPE_LABELS,
  createEmptyScene,
  duplicateScene,
} from "@/lib/scene-presets";
import type { SceneType, VideoScene } from "@/types/scene-video";
import { totalSceneDuration, formatDurationFromFrames } from "@/types/scene-video";
import { EditingToolsPanel } from "@/features/editor-tools/editing-tools-panel";
import { normalizeMediaUrl } from "@/components/shared/file-uploader";

const SCENE_TYPES: SceneType[] = [
  "intro",
  "content",
  "stats",
  "gallery",
  "quote",
  "outro",
];

interface SceneEditorPanelProps {
  scenes: VideoScene[];
  onChange: (scenes: VideoScene[]) => void;
  fps?: number;
}

/** Simple scene list editor — add, remove, reorder, duplicate. */
export function SceneEditorPanel({ scenes, onChange, fps = 30 }: SceneEditorPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(scenes[0]?.id ?? null);
  const selected = scenes.find((s) => s.id === selectedId) ?? scenes[0];

  const updateScene = (id: string, patch: Partial<VideoScene>) => {
    onChange(scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...scenes];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (id: string) => {
    if (scenes.length <= 1) return;
    const next = scenes.filter((s) => s.id !== id);
    onChange(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  const addScene = (type: SceneType) => {
    const scene = createEmptyScene(type);
    onChange([...scenes, scene]);
    setSelectedId(scene.id);
  };

  const total = totalSceneDuration(scenes);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 border border-border p-4 rounded-xl shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Scene Breakdown</h3>
          <p className="text-[11px] text-muted-foreground">
            {scenes.length} scenes · {formatDurationFromFrames(total, fps)} total duration
          </p>
        </div>
        <Select onValueChange={(v) => addScene(v as SceneType)}>
          <SelectTrigger className="w-[150px] h-8.5 bg-background border-input text-xs text-foreground">
            <Plus className="mr-1.5 h-3.5 w-3.5 text-primary" />
            <SelectValue placeholder="Add scene" />
          </SelectTrigger>
          <SelectContent>
            {SCENE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {SCENE_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 lg:grid-cols-[210px_1fr]">
        <ul className="max-h-96 space-y-1.5 overflow-y-auto rounded-xl border border-border bg-muted/20 p-2 scrollbar-thin">
          {scenes.map((scene, i) => {
            const isSelected = selected?.id === scene.id;
            return (
              <li key={scene.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(scene.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs transition duration-200 border ${
                    isSelected
                      ? "bg-primary/10 border-primary/30 text-primary font-medium shadow-inner"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] text-muted-foreground font-mono">{i + 1}</span>
                  <Badge variant="outline" className={`text-[9px] uppercase tracking-wide py-0 px-1 border-border bg-muted ${isSelected ? "text-primary border-primary/20 bg-primary/5" : "text-muted-foreground/75"}`}>
                    {SCENE_TYPE_LABELS[scene.type]}
                  </Badge>
                  <span className="truncate flex-1 font-medium">{scene.title || "Untitled Scene"}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {selected && (
          <div className="space-y-4 rounded-xl border border-border bg-card/60 p-5 shadow-sm">
            {/* Scene Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <span className="text-xs font-semibold text-foreground">Edit Scene Properties</span>
              <div className="flex flex-wrap gap-1.5 p-1 bg-muted rounded-lg border border-border">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background"
                  onClick={() => {
                    const i = scenes.findIndex((s) => s.id === selected.id);
                    move(i, -1);
                  }}
                  title="Move scene up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background"
                  onClick={() => {
                    const i = scenes.findIndex((s) => s.id === selected.id);
                    move(i, 1);
                  }}
                  title="Move scene down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-border self-center my-0.5 mx-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground hover:bg-background font-semibold"
                  onClick={() => {
                    const dup = duplicateScene(selected);
                    const i = scenes.findIndex((s) => s.id === selected.id);
                    const next = [...scenes];
                    next.splice(i + 1, 0, dup);
                    onChange(next);
                    setSelectedId(dup.id);
                  }}
                >
                  <Copy className="mr-1 h-3.5 w-3.5 text-primary" /> Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[10px] text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 font-semibold"
                  disabled={scenes.length <= 1}
                  onClick={() => remove(selected.id)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5 text-rose-500" /> Remove
                </Button>
              </div>
            </div>

            {/* Scene settings */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select
                  value={selected.type}
                  onValueChange={(v) => updateScene(selected.id, { type: v as SceneType })}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCENE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {SCENE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Animation</Label>
                <Select
                  value={selected.animation}
                  onValueChange={(v) =>
                    updateScene(selected.id, {
                      animation: v as VideoScene["animation"],
                    })
                  }
                >
                  <SelectTrigger className="h-8.5 text-xs bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCENE_ANIMATION_PRESETS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                value={selected.title}
                onChange={(e) => updateScene(selected.id, { title: e.target.value })}
                className="h-9 bg-background border-input text-xs text-foreground"
              />
            </div>

            {(selected.type === "intro" ||
              selected.type === "content" ||
              selected.type === "outro") && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Subtitle</Label>
                  <Input
                    value={selected.subtitle ?? ""}
                    onChange={(e) => updateScene(selected.id, { subtitle: e.target.value })}
                    className="h-9 bg-background border-input text-xs text-foreground"
                  />
                </div>
                {selected.type === "content" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Body Text</Label>
                    <Input
                      value={selected.body ?? ""}
                      onChange={(e) => updateScene(selected.id, { body: e.target.value })}
                      className="h-9 bg-background border-input text-xs text-foreground"
                    />
                  </div>
                )}
              </>
            )}

            {selected.type === "stats" && (
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Stat value</Label>
                  <Input
                    value={selected.statValue ?? ""}
                    onChange={(e) => updateScene(selected.id, { statValue: e.target.value })}
                    className="h-9 bg-background border-input text-xs text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Stat label</Label>
                  <Input
                    value={selected.statLabel ?? ""}
                    onChange={(e) => updateScene(selected.id, { statLabel: e.target.value })}
                    className="h-9 bg-background border-input text-xs text-foreground"
                  />
                </div>
              </div>
            )}

            {selected.type === "quote" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quote Text</Label>
                  <Input
                    value={selected.quote ?? ""}
                    onChange={(e) => updateScene(selected.id, { quote: e.target.value })}
                    className="h-9 bg-background border-input text-xs text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Author</Label>
                  <Input
                    value={selected.author ?? ""}
                    onChange={(e) => updateScene(selected.id, { author: e.target.value })}
                    className="h-9 bg-background border-input text-xs text-foreground"
                  />
                </div>
              </>
            )}

            {selected.type === "gallery" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Gallery Images (comma-separated URLs)</Label>
                <Input
                  value={selected.images?.join(", ") ?? ""}
                  onChange={(e) =>
                    updateScene(selected.id, {
                      images: e.target.value.split(",").map((s) => normalizeMediaUrl(s.trim())).filter(Boolean),
                    })
                  }
                  placeholder="https://images.unsplash.com/photo-1, https://images.unsplash.com/photo-2"
                  className="h-9 bg-background border-input text-xs text-foreground placeholder-muted-foreground/35"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Duration (seconds)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={Math.round(selected.durationInFrames / fps)}
                onChange={(e) =>
                  updateScene(selected.id, {
                    durationInFrames: Math.max(30, Number(e.target.value) * fps),
                  })
                }
                className="h-9 bg-background border-input text-xs text-foreground"
              />
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scene editing tools</h4>
              <EditingToolsPanel
                sceneMode
                sceneEditing={selected.editing ?? {}}
                onSceneEditingChange={(patch) =>
                  updateScene(selected.id, {
                    editing: { ...selected.editing, ...patch } as VideoScene["editing"],
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
