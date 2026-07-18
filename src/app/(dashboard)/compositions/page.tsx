"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, Copy, ExternalLink, Play } from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPOSITION_REGISTRY } from "@/lib/composition-registry";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CompositionsPage() {
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("All");
  const [selectedId, setSelectedId] = useState(COMPOSITION_REGISTRY[0].id);

  const folders = ["All", "Main", "Templates", "Effects", "Labs"];

  const filtered = useMemo(
    () =>
      COMPOSITION_REGISTRY.filter((c) => {
        const matchFolder = folder === "All" || c.folder === folder;
        const matchQ =
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.id.toLowerCase().includes(query.toLowerCase());
        return matchFolder && matchQ;
      }),
    [query, folder]
  );

  const selected =
    COMPOSITION_REGISTRY.find((c) => c.id === selectedId) ??
    COMPOSITION_REGISTRY[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Compositions"
        description="Remotion Composition registry — IDs, resolutions, FPS, and nested folders mirroring Root.tsx."
        icon={Boxes}
        actions={
          <Button asChild variant="outline">
            <a href="http://localhost:3001" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" /> Open Remotion CLI
            </a>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          className="max-w-sm"
          placeholder="Search compositions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Tabs value={folder} onValueChange={setFolder}>
          <TabsList className="h-auto flex-wrap">
            {folders.map((f) => (
              <TabsTrigger key={f} value={f} className="text-xs">
                {f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "overflow-hidden rounded-xl border bg-card text-left shadow-sm transition",
                selectedId === c.id
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border hover:border-primary/40"
              )}
            >
              <div
                className="relative flex items-center justify-center bg-[#0b0c0f]"
                style={{
                  aspectRatio: `${c.width}/${c.height}`,
                  maxHeight: 160,
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#0b84f344,transparent_55%)]" />
                <Play className="relative h-8 w-8 text-white/70" />
                <Badge className="absolute left-2 top-2 bg-black/60 backdrop-blur">
                  {c.folder}
                </Badge>
              </div>
              <div className="space-y-1 p-3">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  id: {c.id}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {c.width}×{c.height} · {c.fps}fps ·{" "}
                  {Math.round(c.durationInFrames / c.fps)}s
                </p>
              </div>
            </button>
          ))}
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Composition inspector
          </p>
          <div>
            <p className="text-lg font-semibold">{selected.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selected.description}
            </p>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs">{selected.id}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Resolution</dt>
              <dd>
                {selected.width}×{selected.height}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">FPS</dt>
              <dd>{selected.fps}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Duration</dt>
              <dd>{selected.durationInFrames}f</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Aspect</dt>
              <dd>{selected.aspectRatio}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2">
            <Button asChild variant="glow">
              <Link href={`/player-lab?comp=${selected.id}`}>
                <Play className="h-4 w-4" /> Preview in Player Lab
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(selected.id);
                toast.success("Composition ID copied");
              }}
            >
              <Copy className="h-4 w-4" /> Copy ID
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
