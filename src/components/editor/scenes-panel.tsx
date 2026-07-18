"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
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
import { useEditorStore } from "@/stores/editor-store";
import { TRANSITION_TYPES } from "@/lib/constants";
import type { TransitionType } from "@/types";

export function ScenesPanel() {
  const scenes = useEditorStore((s) => s.project.scenes);
  const fps = useEditorStore((s) => s.project.settings.fps);
  const addScene = useEditorStore((s) => s.addScene);
  const removeScene = useEditorStore((s) => s.removeScene);
  const reorderScene = useEditorStore((s) => s.reorderScene);
  const updateScene = useEditorStore((s) => s.updateScene);
  const setSceneTransition = useEditorStore((s) => s.setSceneTransition);
  const setFrame = useEditorStore((s) => s.setFrame);

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start border-white/10 bg-white/5 text-white hover:bg-white/10"
        onClick={addScene}
      >
        <Plus className="mr-2 h-4 w-4 text-primary" /> Add scene
      </Button>

      {scenes.map((scene, i) => (
        <div
          key={scene.id}
          className="space-y-2.5 rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Jump to scene"
              onClick={() => setFrame(scene.startFrame)}
              className="flex h-5 min-w-5 items-center justify-center rounded bg-primary/20 px-1 text-[10px] font-semibold text-primary"
            >
              {i + 1}
            </button>
            <Input
              value={scene.name}
              onChange={(e) => updateScene(scene.id, { name: e.target.value })}
              className="h-7 flex-1 border-white/10 bg-white/5 text-xs text-white"
            />
            <button
              type="button"
              disabled={i === 0}
              onClick={() => reorderScene(scene.id, "up")}
              className="text-white/50 hover:text-white disabled:opacity-20"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={i === scenes.length - 1}
              onClick={() => reorderScene(scene.id, "down")}
              className="text-white/50 hover:text-white disabled:opacity-20"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={scenes.length <= 1}
              onClick={() => removeScene(scene.id)}
              className="text-white/50 hover:text-red-400 disabled:opacity-20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-white/50">
                Duration ({(scene.durationInFrames / fps).toFixed(1)}s)
              </Label>
              <Input
                type="number"
                min={5}
                value={scene.durationInFrames}
                onChange={(e) =>
                  updateScene(scene.id, {
                    durationInFrames: Math.max(5, Number(e.target.value) || 5),
                  })
                }
                className="h-7 border-white/10 bg-white/5 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-white/50">Background</Label>
              <Input
                type="color"
                value={scene.background}
                onChange={(e) =>
                  updateScene(scene.id, { background: e.target.value })
                }
                className="h-7 border-white/10 bg-white/5 p-1"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] text-white/50">Transition out</Label>
            <Select
              value={scene.transition}
              onValueChange={(v) =>
                setSceneTransition(scene.id, v as TransitionType)
              }
            >
              <SelectTrigger className="h-7 border-white/10 bg-white/5 text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSITION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}
