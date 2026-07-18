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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium">Scenes</h3>
          <p className="text-xs text-muted-foreground">
            {scenes.length} scenes · {formatDurationFromFrames(total, fps)} total
          </p>
        </div>
        <Select onValueChange={(v) => addScene(v as SceneType)}>
          <SelectTrigger className="w-[160px]">
            <Plus className="mr-1 h-3.5 w-3.5" />
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

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <ul className="max-h-80 space-y-1 overflow-auto rounded-lg border border-border p-2">
          {scenes.map((scene, i) => (
            <li key={scene.id}>
              <button
                type="button"
                onClick={() => setSelectedId(scene.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${
                  selected?.id === scene.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                <Badge variant="outline" className="text-[10px]">
                  {SCENE_TYPE_LABELS[scene.type]}
                </Badge>
                <span className="truncate">{scene.title}</span>
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => {
                  const i = scenes.findIndex((s) => s.id === selected.id);
                  move(i, -1);
                }}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => {
                  const i = scenes.findIndex((s) => s.id === selected.id);
                  move(i, 1);
                }}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const dup = duplicateScene(selected);
                  const i = scenes.findIndex((s) => s.id === selected.id);
                  const next = [...scenes];
                  next.splice(i + 1, 0, dup);
                  onChange(next);
                  setSelectedId(dup.id);
                }}
              >
                <Copy className="mr-1 h-3.5 w-3.5" /> Duplicate
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={scenes.length <= 1}
                onClick={() => remove(selected.id)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={selected.type}
                  onValueChange={(v) => updateScene(selected.id, { type: v as SceneType })}
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Animation</Label>
                <Select
                  value={selected.animation}
                  onValueChange={(v) =>
                    updateScene(selected.id, {
                      animation: v as VideoScene["animation"],
                    })
                  }
                >
                  <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={selected.title}
                onChange={(e) => updateScene(selected.id, { title: e.target.value })}
              />
            </div>

            {(selected.type === "intro" ||
              selected.type === "content" ||
              selected.type === "outro") && (
              <>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={selected.subtitle ?? ""}
                    onChange={(e) => updateScene(selected.id, { subtitle: e.target.value })}
                  />
                </div>
                {selected.type === "content" && (
                  <div className="space-y-2">
                    <Label>Body</Label>
                    <Input
                      value={selected.body ?? ""}
                      onChange={(e) => updateScene(selected.id, { body: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}

            {selected.type === "stats" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Stat value</Label>
                  <Input
                    value={selected.statValue ?? ""}
                    onChange={(e) => updateScene(selected.id, { statValue: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stat label</Label>
                  <Input
                    value={selected.statLabel ?? ""}
                    onChange={(e) => updateScene(selected.id, { statLabel: e.target.value })}
                  />
                </div>
              </div>
            )}

            {selected.type === "quote" && (
              <>
                <div className="space-y-2">
                  <Label>Quote</Label>
                  <Input
                    value={selected.quote ?? ""}
                    onChange={(e) => updateScene(selected.id, { quote: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={selected.author ?? ""}
                    onChange={(e) => updateScene(selected.id, { author: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
