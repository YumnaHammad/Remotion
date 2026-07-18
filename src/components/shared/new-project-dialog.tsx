"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/project-store";
import { createBlankProject } from "@/lib/project-factory";
import { ASPECT_PRESETS, FPS_OPTIONS } from "@/lib/constants";
import type { AspectRatio } from "@/types";
import { toast } from "sonner";

const RATIOS: AspectRatio[] = ["16:9", "9:16", "1:1", "4:5"];
const DURATIONS = [5, 10, 15, 30, 60];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium transition",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40"
      )}
    >
      {children}
    </button>
  );
}

export function NewProjectDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Untitled Project");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [fps, setFps] = useState<number>(30);
  const [seconds, setSeconds] = useState<number>(10);

  const addProject = useProjectStore((s) => s.addProject);
  const router = useRouter();

  const create = () => {
    const project = createBlankProject({
      name: name.trim() || "Untitled Project",
      aspectRatio,
      fps,
      durationInFrames: Math.max(fps, Math.round(seconds * fps)),
    });
    addProject(project);
    setOpen(false);
    toast.success("Blank project created", {
      description: `${aspectRatio} · ${fps}fps · ${seconds}s`,
    });
    router.push(`/editor/${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="glow">
            <Clapperboard className="h-4 w-4" /> New project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New composition</DialogTitle>
          <DialogDescription>
            Start from a blank Remotion timeline. You can add scenes, media, and
            layers in the studio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Aspect ratio</Label>
            <div className="grid grid-cols-4 gap-2">
              {RATIOS.map((r) => (
                <Chip
                  key={r}
                  active={aspectRatio === r}
                  onClick={() => setAspectRatio(r)}
                >
                  {r}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {ASPECT_PRESETS[aspectRatio].label} ·{" "}
              {ASPECT_PRESETS[aspectRatio].width}×
              {ASPECT_PRESETS[aspectRatio].height}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frame rate</Label>
              <div className="grid grid-cols-2 gap-2">
                {FPS_OPTIONS.map((f) => (
                  <Chip key={f} active={fps === f} onClick={() => setFps(f)}>
                    {f}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map((d) => (
                  <Chip key={d} active={seconds === d} onClick={() => setSeconds(d)}>
                    {d}s
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <Button variant="glow" className="w-full" onClick={create}>
            <Clapperboard className="h-4 w-4" /> Create & open studio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
