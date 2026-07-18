"use client";

import { useMemo, useState } from "react";
import {
  Clapperboard,
  GripVertical,
  Lock,
  Plus,
  StickyNote,
  Unlock,
} from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type BoardScene = {
  id: string;
  name: string;
  note: string;
  durationSec: number;
  locked: boolean;
  group: string;
};

const SEED: BoardScene[] = [
  { id: "1", name: "Intro", note: "Logo sting + hook line", durationSec: 3, locked: false, group: "Act 1" },
  { id: "2", name: "Problem", note: "Pain point montage", durationSec: 5, locked: false, group: "Act 1" },
  { id: "3", name: "Solution", note: "Product hero reveal", durationSec: 6, locked: true, group: "Act 2" },
  { id: "4", name: "Features", note: "3 feature cards", durationSec: 8, locked: false, group: "Act 2" },
  { id: "5", name: "CTA", note: "End card + URL", durationSec: 4, locked: false, group: "Act 3" },
];

export default function StoryboardPage() {
  const [scenes, setScenes] = useState(SEED);
  const [selected, setSelected] = useState(SEED[0].id);

  const total = useMemo(
    () => scenes.reduce((a, s) => a + s.durationSec, 0),
    [scenes]
  );

  const move = (id: string, dir: -1 | 1) => {
    setScenes((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= prev.length) return prev;
      if (prev[idx].locked || prev[swap].locked) {
        toast.error("Unlock scenes to reorder");
        return prev;
      }
      const next = [...prev];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const addScene = () => {
    const id = String(Date.now());
    const scene: BoardScene = {
      id,
      name: `Scene ${scenes.length + 1}`,
      note: "New beat",
      durationSec: 4,
      locked: false,
      group: "Act 2",
    };
    setScenes((s) => [...s, scene]);
    setSelected(id);
  };

  const update = (id: string, patch: Partial<BoardScene>) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const active = scenes.find((s) => s.id === selected) ?? scenes[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Storyboard"
        description="Plan scenes like Remotion Series sequences — reorder, lock, annotate, and set duration before editing."
        icon={Clapperboard}
        actions={
          <Button variant="glow" onClick={addScene}>
            <Plus className="h-4 w-4" /> Add scene
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="secondary">{scenes.length} scenes</Badge>
        <Badge variant="secondary">{total}s total</Badge>
        <span>Maps 1:1 to Remotion &lt;Series.Sequence /&gt;</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {scenes.map((scene, i) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => setSelected(scene.id)}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-card p-3 text-left shadow-sm transition",
                selected === scene.id
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40"
              )}
            >
              <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-[linear-gradient(135deg,#0b84f333,#0b0c0f)]">
                <span className="font-mono text-3xl font-bold text-white/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{scene.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {scene.group} · {scene.durationSec}s
                  </p>
                </div>
                {scene.locked ? (
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Scene inspector
          </p>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Name</label>
            <Input
              value={active.name}
              disabled={active.locked}
              onChange={(e) => update(active.id, { name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Group</label>
            <Input
              value={active.group}
              disabled={active.locked}
              onChange={(e) => update(active.id, { group: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              Duration (seconds)
            </label>
            <Input
              type="number"
              min={1}
              value={active.durationSec}
              disabled={active.locked}
              onChange={(e) =>
                update(active.id, {
                  durationSec: Math.max(1, Number(e.target.value) || 1),
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <StickyNote className="h-3 w-3" /> Notes
            </label>
            <Input
              value={active.note}
              disabled={active.locked}
              onChange={(e) => update(active.id, { note: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => move(active.id, -1)}
            >
              Move left
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => move(active.id, 1)}
            >
              Move right
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => update(active.id, { locked: !active.locked })}
            >
              {active.locked ? (
                <>
                  <Unlock className="h-3.5 w-3.5" /> Unlock
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" /> Lock
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const copy = {
                  ...active,
                  id: String(Date.now()),
                  name: `${active.name} Copy`,
                  locked: false,
                };
                setScenes((s) => [...s, copy]);
                toast.success("Scene duplicated");
              }}
            >
              Duplicate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
