"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { FolderOpen, LayoutTemplate, Plus, Sparkles } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { NAV_SECTIONS } from "@/lib/constants";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CommandPalette() {
  const router = useRouter();
  const { commandOpen, setCommandOpen } = useUIStore();
  const projects = useProjectStore((s) => s.projects);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  const go = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="overflow-hidden p-0 gap-0 max-w-xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b border-border px-3">
            <Sparkles className="mr-2 h-4 w-4 shrink-0 text-primary" />
            <Command.Input
              placeholder="Type a command or search…"
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Actions">
              <Command.Item
                onSelect={() => go("/projects?new=1")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-accent"
              >
                <Plus className="h-4 w-4" /> New Project
              </Command.Item>
              <Command.Item
                onSelect={() => go("/templates")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-accent"
              >
                <LayoutTemplate className="h-4 w-4" /> Browse Templates
              </Command.Item>
            </Command.Group>

            {NAV_SECTIONS.map((section) => (
              <Command.Group key={section.label} heading={section.label}>
                {section.items.map((p) => (
                  <Command.Item
                    key={p.href}
                    value={`${section.label} ${p.label}`}
                    onSelect={() => go(p.href)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-accent"
                  >
                    <Sparkles className="h-4 w-4 opacity-60" /> {p.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}

            <Command.Group heading="Projects">
              {projects.slice(0, 6).map((p) => (
                <Command.Item
                  key={p.id}
                  onSelect={() => go(`/editor/${p.id}`)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <FolderOpen className="h-4 w-4" /> {p.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
