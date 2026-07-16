"use client";

import { BarChart3, Eye, Film, Share2 } from "lucide-react";
import { StatCard } from "@/components/shared/primitives";

const BARS = [42, 68, 55, 90, 72, 88, 64];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsPage() {
  const max = Math.max(...BARS);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Production volume and export performance
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Videos created" value="128" hint="+12 this week" icon={Film} />
        <StatCard label="Exports" value="86" hint="94% success rate" icon={Share2} />
        <StatCard label="Preview plays" value="2.4k" hint="Editor sessions" icon={Eye} />
        <StatCard label="Template uses" value="41" hint="Marketplace" icon={BarChart3} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-6 text-sm font-semibold">Renders this week</h2>
        <div className="flex h-48 items-end gap-3">
          {BARS.map((v, i) => (
            <div key={DAYS[i]} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary/70 to-primary transition hover:brightness-110"
                style={{ height: `${(v / max) * 100}%` }}
              />
              <span className="text-[11px] text-muted-foreground">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
