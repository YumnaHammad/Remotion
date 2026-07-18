"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStore } from "@/stores/project-store";
import { createBlankProject, makeTextLayer } from "@/lib/project-factory";
import { ASPECT_PRESETS } from "@/lib/constants";
import type { Project } from "@/types";
import { toast } from "sonner";

const schema = z.object({
  prompt: z.string().min(8, "Describe your video in more detail"),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5"]),
});

type FormValues = z.infer<typeof schema>;

export function CreateAIDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const addProject = useProjectStore((s) => s.addProject);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: "",
      aspectRatio: "16:9",
    },
  });

  const onSubmit = (values: FormValues) => {
    const title =
      values.prompt.split(/[.!?]/)[0]?.slice(0, 42) || "AI Video";

    const base = createBlankProject({
      name: title,
      description: values.prompt,
      thumbnail: "gradient-1",
      aspectRatio: values.aspectRatio,
      durationInFrames: 180,
      tags: ["ai", "prompt"],
    });

    const project: Project = {
      ...base,
      scenes: [
        {
          id: "sc-intro",
          name: "Intro",
          startFrame: 0,
          durationInFrames: 60,
          transition: "fade",
          transitionDuration: 12,
          background: "#0a0a0f",
        },
        {
          id: "sc-mid",
          name: "Middle",
          startFrame: 60,
          durationInFrames: 70,
          transition: "slide",
          transitionDuration: 15,
          background: "#111827",
        },
        {
          id: "sc-outro",
          name: "Outro",
          startFrame: 130,
          durationInFrames: 50,
          transition: "cinematic",
          transitionDuration: 12,
          background: "#0f172a",
        },
      ],
      layers: [
        makeTextLayer({
          name: "AI Title",
          text: title,
          startFrame: 8,
          durationInFrames: 50,
          animation: "split-text",
          animationDuration: 24,
          transform: { x: 0, y: -20, scale: 1, rotation: 0, opacity: 1, blur: 0 },
        }),
        makeTextLayer({
          name: "AI Subtitle",
          text: values.prompt.slice(0, 80),
          startFrame: 70,
          durationInFrames: 55,
          animation: "typewriter",
          animationDuration: 40,
          transform: { x: 0, y: 40, scale: 1, rotation: 0, opacity: 1, blur: 0 },
          textStyle: {
            fontFamily: "Inter",
            fontSize: 28,
            fontWeight: 400,
            color: "#94a3b8",
            align: "center",
            lineHeight: 1.4,
            letterSpacing: 0,
          },
        }),
      ],
    };

    addProject(project);
    setOpen(false);
    toast.success("AI draft created", {
      description: "Scenes and text layers generated from your prompt",
    });
    router.push(`/editor/${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="glow">
            <Sparkles className="h-4 w-4" /> Create with AI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create from prompt</DialogTitle>
          <DialogDescription>
            Describe the video. Lumen generates scenes, text layers, and
            transitions on a Remotion timeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Prompt</Label>
            <Textarea
              placeholder="A cinematic product launch for a futuristic smartwatch with bold kinetic typography…"
              rows={4}
              {...form.register("prompt")}
            />
            {form.formState.errors.prompt && (
              <p className="text-xs text-destructive">
                {form.formState.errors.prompt.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Aspect ratio</Label>
            <Select
              value={form.watch("aspectRatio")}
              onValueChange={(v) =>
                form.setValue("aspectRatio", v as FormValues["aspectRatio"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["16:9", "9:16", "1:1", "4:5"] as const).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r} · {ASPECT_PRESETS[r].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" variant="glow" className="w-full">
            <Sparkles className="h-4 w-4" /> Generate project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
