"use client";

import { Mic, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_VOICES } from "@/data/mock";
import { toast } from "sonner";

export default function VoicesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Voice Library</h1>
        <p className="text-sm text-muted-foreground">
          AI narrators for voice-over tracks
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_VOICES.map((v) => (
          <div
            key={v.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mic className="h-5 w-5" />
              </div>
              {v.popular && <Badge>Popular</Badge>}
            </div>
            <h3 className="mt-4 text-base font-semibold">{v.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{v.style}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{v.language}</Badge>
              <Badge variant="outline">{v.gender}</Badge>
              <Badge variant="outline">{v.provider}</Badge>
            </div>
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => toast.message(`Previewing ${v.name}`)}
            >
              <Play className="h-4 w-4" /> Preview
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
