"use client";

import { Images, Music, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/primitives";
import { MOCK_MEDIA } from "@/data/mock";
import { formatBytes, formatRelative } from "@/lib/utils";

const ICONS = {
  image: Images,
  video: Video,
  audio: Music,
  gif: Images,
  font: Images,
};

export default function MediaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Images, video, GIF, and audio assets
          </p>
        </div>
        <Button variant="glow">
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MOCK_MEDIA.map((m) => {
          const Icon = ICONS[m.type];
          return (
            <div
              key={m.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30"
            >
              <div className="mb-3 flex aspect-video items-center justify-center rounded-lg bg-muted">
                <Icon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="truncate text-sm font-medium">{m.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant="secondary">{m.type}</Badge>
                <span className="text-[11px] text-muted-foreground">
                  {formatBytes(m.size)}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {m.folder} · {formatRelative(m.createdAt)}
              </p>
            </div>
          );
        })}
      </div>

      {MOCK_MEDIA.length === 0 && (
        <EmptyState
          icon={Images}
          title="No media yet"
          description="Upload images, videos, GIFs, or audio to use in compositions."
          action={<Button>Upload assets</Button>}
        />
      )}
    </div>
  );
}
