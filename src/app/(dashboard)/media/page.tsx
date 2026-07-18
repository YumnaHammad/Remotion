"use client";

import { useRef } from "react";
import { Images, Music, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_MEDIA } from "@/data/mock";
import { useAssetStore, assetFromFile } from "@/stores/asset-store";
import { formatBytes, formatRelative } from "@/lib/utils";
import { toast } from "sonner";

const ICONS = {
  image: Images,
  video: Video,
  audio: Music,
  gif: Images,
  font: Images,
};

export default function MediaPage() {
  const uploaded = useAssetStore((s) => s.assets);
  const addAsset = useAssetStore((s) => s.addAsset);
  const inputRef = useRef<HTMLInputElement>(null);

  const onUpload = (files: FileList | null) => {
    if (!files) return;
    let count = 0;
    for (const file of Array.from(files)) {
      addAsset(assetFromFile(file));
      count++;
    }
    if (count) toast.success(`${count} asset${count > 1 ? "s" : ""} uploaded`);
  };

  const media = [...uploaded, ...MOCK_MEDIA];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            Images, video, GIF, and audio assets
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onUpload(e.target.files);
            e.target.value = "";
          }}
        />
        <Button variant="glow" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((m) => {
          const Icon = ICONS[m.type];
          const showPreview = m.type === "image" || m.type === "gif";
          return (
            <div
              key={m.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30"
            >
              <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
                {showPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon className="h-8 w-8 text-muted-foreground" />
                )}
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
    </div>
  );
}
