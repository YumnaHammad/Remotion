"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clapperboard,
  Search,
  Plus,
  Tv,
  Video,
  Sparkles,
  Globe,
  FileSpreadsheet,
  Layers,
  Upload,
  MousePointer,
  Compass,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground dark:border-white/10 dark:text-white/60 dark:hover:border-white/20"
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
  const [seconds, setSeconds] = useState<number>(15);
  const [dialogTab, setDialogTab] = useState<"for-you" | "videos" | "social" | "custom">("for-you");
  const [searchQuery, setSearchQuery] = useState("");

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
    toast.success("Design created successfully", {
      description: `${aspectRatio} · ${fps}fps · ${seconds}s`,
    });
    router.push(`/editor/${project.id}`);
  };

  const createWithPreset = (ratio: AspectRatio, presetName: string) => {
    const project = createBlankProject({
      name: `New ${presetName}`,
      aspectRatio: ratio,
      fps: 30,
      durationInFrames: 15 * 30, // 15s default
    });
    addProject(project);
    setOpen(false);
    toast.success(`${presetName} created`, {
      description: `${ratio} · 30fps · 15s`,
    });
    router.push(`/editor/${project.id}`);
  };

  const menuItems = [
    { id: "for-you", label: "For you", icon: Compass },
    { id: "videos", label: "Videos (Landscape)", icon: Tv },
    { id: "social", label: "Social media (Portrait)", icon: Video },
    { id: "custom", label: "Custom size", icon: Layers },
  ] as const;

  const quickActions = [
    { label: "Magic Layers", desc: "Blank video canvas", action: () => createWithPreset("16:9", "Blank Video") },
    { label: "Screen Recorder", desc: "Voiceover workflow", action: () => createWithPreset("9:16", "Recording Video") },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="glow">
            <Clapperboard className="h-4 w-4" /> New project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-border bg-background text-foreground dark:border-white/10 dark:bg-[#18191b] dark:text-white">
        {/* Top Header */}
        <div className="border-b border-border/80 dark:border-white/15 px-6 py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground dark:text-white">Create a design</h2>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground dark:text-white/40" />
            <Input
              type="text"
              placeholder="What would you like to create?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full pl-10.5 border-border bg-muted/40 text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder-white/40"
            />
          </div>
        </div>

        {/* Dialog Grid Body */}
        <div className="flex h-[420px]">
          {/* Left Sidebar */}
          <div className="w-1/3 border-r border-border bg-muted/35 dark:border-white/15 dark:bg-[#121315] py-3 flex flex-col justify-between">
            <div className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDialogTab(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-left",
                      dialogTab === item.id
                        ? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick automation shortcuts */}
            <div className="border-t border-border/80 dark:border-white/10 pt-3 mt-auto px-2 space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-white/40">
                Automate
              </p>
              {[
                { href: "/script-to-video", label: "Script to Video", icon: Sparkles },
                { href: "/website-to-video", label: "Website to Video", icon: Globe },
                { href: "/data-to-video", label: "Data to Video", icon: FileSpreadsheet },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push(link.href);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white py-2"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 bg-background dark:bg-[#18191b] p-6 overflow-y-auto">
            {dialogTab === "for-you" && (
              <div className="space-y-6">
                {/* Quick actions */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground/75 dark:text-white/50 uppercase tracking-wider mb-3">Quick actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((qa) => (
                      <button
                        key={qa.label}
                        type="button"
                        onClick={qa.action}
                        className="flex flex-col items-start rounded-xl border border-border bg-muted/20 p-3 text-left hover:border-primary/40 dark:border-white/10 dark:bg-[#252629] dark:hover:border-white/20 transition group"
                      >
                        <span className="text-xs font-bold text-foreground group-hover:text-primary dark:text-white transition">{qa.label}</span>
                        <span className="text-[10px] text-muted-foreground dark:text-white/50 mt-1">{qa.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequently used presets */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground/75 dark:text-white/50 uppercase tracking-wider mb-3">Frequently used</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "YouTube Video", ratio: "16:9" as AspectRatio, desc: "Landscape · 1920x1080" },
                      { name: "TikTok Video", ratio: "9:16" as AspectRatio, desc: "Portrait · 1080x1920" },
                      { name: "Instagram Post", ratio: "1:1" as AspectRatio, desc: "Square · 1080x1080" },
                      { name: "Portrait Video", ratio: "4:5" as AspectRatio, desc: "Vertical · 1080x1350" },
                    ].map((card) => (
                      <button
                        key={card.name}
                        type="button"
                        onClick={() => createWithPreset(card.ratio, card.name)}
                        className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 text-left hover:border-primary/40 dark:border-white/10 dark:bg-[#252629] dark:hover:border-white/20 transition group w-full"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 dark:bg-white/5">
                          <LayoutTemplate className="h-5 w-5 text-muted-foreground/80 group-hover:text-primary dark:text-white/60 transition" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary dark:text-white transition truncate">{card.name}</p>
                          <p className="text-[10px] text-muted-foreground/80 dark:text-white/40 mt-0.5">{card.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {dialogTab === "videos" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground/75 dark:text-white/50 uppercase tracking-wider mb-3">Landscape Video formats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "YouTube Video", ratio: "16:9" as AspectRatio, desc: "Landscape · 1920x1080" },
                    { name: "Cinematic Video", ratio: "16:9" as AspectRatio, desc: "Ultra-wide · 1920x1080" },
                  ].map((card) => (
                    <button
                      key={card.name}
                      type="button"
                      onClick={() => createWithPreset(card.ratio, card.name)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 text-left hover:border-primary/40 dark:border-white/10 dark:bg-[#252629] dark:hover:border-white/20 transition group w-full"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 dark:bg-white/5">
                        <Tv className="h-5 w-5 text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground group-hover:text-primary dark:text-white transition truncate">{card.name}</p>
                        <p className="text-[10px] text-muted-foreground/80 dark:text-white/40 mt-0.5">{card.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dialogTab === "social" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground/75 dark:text-white/50 uppercase tracking-wider mb-3">Social Media formats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "TikTok Video", ratio: "9:16" as AspectRatio, desc: "Portrait · 1080x1920" },
                    { name: "Instagram Square", ratio: "1:1" as AspectRatio, desc: "Square · 1080x1080" },
                    { name: "Portrait Video", ratio: "4:5" as AspectRatio, desc: "Vertical · 1080x1350" },
                  ].map((card) => (
                    <button
                      key={card.name}
                      type="button"
                      onClick={() => createWithPreset(card.ratio, card.name)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 text-left hover:border-primary/40 dark:border-white/10 dark:bg-[#252629] dark:hover:border-white/20 transition group w-full"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 dark:bg-white/5">
                        <Video className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground group-hover:text-primary dark:text-white transition truncate">{card.name}</p>
                        <p className="text-[10px] text-muted-foreground/80 dark:text-white/40 mt-0.5">{card.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dialogTab === "custom" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground/75 dark:text-white/50 uppercase tracking-wider mb-3">Custom dimensions</h3>
                <div className="space-y-3.5 bg-muted/20 p-4 rounded-xl border border-border/80 dark:bg-[#252629] dark:border-white/5">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground dark:text-white/70 text-xs">Project name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 border-border bg-background dark:border-white/15 dark:bg-[#121315] text-foreground dark:text-white text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground dark:text-white/70 text-xs">Aspect ratio</Label>
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
                    <p className="text-[10px] text-muted-foreground/80 dark:text-white/40">
                      {ASPECT_PRESETS[aspectRatio].label} · {ASPECT_PRESETS[aspectRatio].width}x{ASPECT_PRESETS[aspectRatio].height}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground dark:text-white/70 text-xs">Frame rate</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {FPS_OPTIONS.map((f) => (
                          <Chip key={f} active={fps === f} onClick={() => setFps(f)}>
                            {f}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground dark:text-white/70 text-xs">Duration</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {DURATIONS.map((d) => (
                          <Chip key={d} active={seconds === d} onClick={() => setSeconds(d)}>
                            {d}s
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button variant="glow" className="w-full h-10 mt-2 font-bold text-xs" onClick={create}>
                    <Plus className="h-4 w-4" /> Create & open studio
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
